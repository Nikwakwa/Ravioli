// Pure Web Crypto implementation of RFC 8291 (aes128gcm Web Push encryption)
// and RFC 8292 (VAPID ES256 authentication) with zero Node.js dependencies.

const encoder = new TextEncoder();

export function normalizeVapidSubject(raw?: string | null): string {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return 'mailto:oli@ravioli.app';
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('https://')) return trimmed;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return `mailto:${trimmed}`;
  return 'mailto:oli@ravioli.app';
}

export function base64ToBytes(raw: string): Uint8Array<ArrayBuffer> {
  const clean = raw.trim().replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = clean + '='.repeat((4 - (clean.length % 4)) % 4);
  const bin = atob(padded);
  const buf = new ArrayBuffer(bin.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i += 1) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function normalizeP256PrivateScalar(raw: Uint8Array): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(32);
  const out = new Uint8Array(buf);
  if (raw.length === 32) {
    out.set(raw);
    return out;
  }
  if (raw.length === 33 && raw[0] === 0) {
    out.set(raw.subarray(1, 33));
    return out;
  }
  if (raw.length > 0 && raw.length < 32) {
    out.set(raw, 32 - raw.length);
    return out;
  }
  throw new Error(`Invalid VAPID private key length (${raw.length})`);
}

function concatBytes(...chunks: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const buf = new ArrayBuffer(total);
  const out = new Uint8Array(buf);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** Builds an RFC 8292 `Authorization: vapid t=..., k=...` header signed with ES256. */
export async function buildVapidAuthorization(
  endpoint: string,
  subject: string | null | undefined,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  nowMs: number = Date.now(),
): Promise<string> {
  const pubBytes = base64ToBytes(vapidPublicKey);
  if (pubBytes.length !== 65 || pubBytes[0] !== 0x04) {
    throw new Error(`Invalid VAPID public key length (${pubBytes.length})`);
  }
  const privBytes = normalizeP256PrivateScalar(base64ToBytes(vapidPrivateKey));

  const jwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    x: bytesToBase64Url(pubBytes.subarray(1, 33)),
    y: bytesToBase64Url(pubBytes.subarray(33, 65)),
    d: bytesToBase64Url(privBytes),
    ext: true,
  };

  const signingKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );

  const headerPart = bytesToBase64Url(encoder.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claimsPart = bytesToBase64Url(
    encoder.encode(
      JSON.stringify({
        aud: new URL(endpoint).origin,
        exp: Math.floor(nowMs / 1000) + 12 * 3600,
        sub: normalizeVapidSubject(subject),
      }),
    ),
  );

  const signingInput = encoder.encode(`${headerPart}.${claimsPart}`);
  const signature = new Uint8Array(
    await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, signingKey, signingInput),
  );
  const jwt = `${headerPart}.${claimsPart}.${bytesToBase64Url(signature)}`;
  return `vapid t=${jwt}, k=${bytesToBase64Url(pubBytes)}`;
}

/** Encrypts a UTF-8 push payload using RFC 8291 (`aes128gcm` content encoding). */
export async function encryptPushPayload(
  plaintext: string,
  p256dh: string,
  auth: string,
): Promise<Uint8Array<ArrayBuffer>> {
  const uaPublic = base64ToBytes(p256dh);
  if (uaPublic.length !== 65 || uaPublic[0] !== 0x04) {
    throw new Error(`Invalid subscriber p256dh key length (${uaPublic.length})`);
  }
  const authSecret = base64ToBytes(auth);
  if (authSecret.length !== 16) {
    throw new Error(`Invalid subscriber auth secret length (${authSecret.length})`);
  }

  const plaintextBytes = encoder.encode(plaintext);
  if (plaintextBytes.length > 3800) {
    throw new Error('Push payload exceeds maximum Web Push size');
  }

  const asKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
    'deriveBits',
  ]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', asKeyPair.publicKey));
  const uaPublicKey = await crypto.subtle.importKey(
    'raw',
    uaPublic,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );

  const ecdhSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: uaPublicKey }, asKeyPair.privateKey, 256),
  );

  const keyInfo = concatBytes(encoder.encode('WebPush: info\0'), uaPublic, asPublic);
  const ecdhHkdfKey = await crypto.subtle.importKey('raw', ecdhSecret, 'HKDF', false, ['deriveBits']);
  const ikm = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt: authSecret, info: keyInfo },
      ecdhHkdfKey,
      256,
    ),
  );

  const saltBuf = new ArrayBuffer(16);
  const salt = crypto.getRandomValues(new Uint8Array(saltBuf));
  const ikmHkdfKey = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, [
    'deriveKey',
    'deriveBits',
  ]);

  const cekKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info: encoder.encode('Content-Encoding: aes128gcm\0'),
    },
    ikmHkdfKey,
    { name: 'AES-GCM', length: 128 },
    false,
    ['encrypt'],
  );

  const nonce = new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt,
        info: encoder.encode('Content-Encoding: nonce\0'),
      },
      ikmHkdfKey,
      96,
    ),
  );

  // Single final RFC 8188 record terminated by 0x02 delimiter byte.
  const paddedPlaintext = concatBytes(plaintextBytes, new Uint8Array([0x02]));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce, tagLength: 128 },
      cekKey,
      paddedPlaintext,
    ),
  );

  // RFC 8188 header: salt (16B) || rs=4096 uint32be (4B) || idlen=65 uint8 (1B) || keyid=asPublic (65B)
  const rsAndLen = new Uint8Array([0x00, 0x00, 0x10, 0x00, asPublic.length]);
  return concatBytes(salt, rsAndLen, asPublic, ciphertext);
}

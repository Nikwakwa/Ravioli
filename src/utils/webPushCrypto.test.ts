import { describe, expect, it } from 'vitest';
import {
  base64ToBytes,
  buildVapidAuthorization,
  bytesToBase64Url,
  encryptPushPayload,
  normalizeVapidSubject,
} from './webPushCrypto';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

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

describe('webPushCrypto (RFC 8291 aes128gcm & RFC 8292 VAPID)', () => {
  it('normalizes VAPID subjects safely for Apple & FCM', () => {
    expect(normalizeVapidSubject(undefined)).toBe('mailto:oli@ravioli.app');
    expect(normalizeVapidSubject('  ')).toBe('mailto:oli@ravioli.app');
    expect(normalizeVapidSubject('caretaker@example.com')).toBe('mailto:caretaker@example.com');
    expect(normalizeVapidSubject('mailto:custom@example.com')).toBe('mailto:custom@example.com');
    expect(normalizeVapidSubject('https://nikwakwa.github.io')).toBe('https://nikwakwa.github.io');
    expect(normalizeVapidSubject('not a valid subject')).toBe('mailto:oli@ravioli.app');
  });

  it('signs a valid RFC 8292 ES256 VAPID authorization header verifiable with Web Crypto', async () => {
    const keyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
      'sign',
      'verify',
    ]);
    const pubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey));
    const privJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
    const vapidPublicKey = bytesToBase64Url(pubRaw);
    const vapidPrivateKey = privJwk.d!;

    const nowMs = Date.parse('2026-11-25T12:00:00Z');
    const authHeader = await buildVapidAuthorization(
      'https://web.push.apple.com/QH123456',
      'caretaker@example.com',
      vapidPublicKey,
      vapidPrivateKey,
      nowMs,
    );

    expect(authHeader.startsWith('vapid t=')).toBe(true);
    const match = authHeader.match(/^vapid t=([^,]+), k=(.+)$/);
    expect(match).not.toBeNull();
    const [, jwt, kParam] = match!;
    expect(kParam).toBe(vapidPublicKey);

    const [headerB64, claimsB64, sigB64] = jwt.split('.');
    const header = JSON.parse(decoder.decode(base64ToBytes(headerB64)));
    const claims = JSON.parse(decoder.decode(base64ToBytes(claimsB64)));
    expect(header).toEqual({ typ: 'JWT', alg: 'ES256' });
    expect(claims).toEqual({
      aud: 'https://web.push.apple.com',
      exp: Math.floor(nowMs / 1000) + 12 * 3600,
      sub: 'mailto:caretaker@example.com',
    });

    const sigBytes = base64ToBytes(sigB64);
    expect(sigBytes.length).toBe(64);
    const verified = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      keyPair.publicKey,
      sigBytes,
      encoder.encode(`${headerB64}.${claimsB64}`),
    );
    expect(verified).toBe(true);
  });

  it('encrypts a Web Push JSON payload with RFC 8291 aes128gcm that decrypts cleanly on the client', async () => {
    // Simulate browser PushSubscription ECDH key pair + 16-byte auth secret
    const uaPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
      'deriveBits',
    ]);
    const uaPublic = new Uint8Array(await crypto.subtle.exportKey('raw', uaPair.publicKey));
    const authSecret = crypto.getRandomValues(new Uint8Array(16));

    // Pass standard base64 (with + / =) to verify tolerant decoding too
    const p256dhStandardB64 = btoa(String.fromCharCode(...uaPublic));
    const authUrlSafe = bytesToBase64Url(authSecret);

    const message = JSON.stringify({
      title: '😿 Oli is getting hungry!',
      body: 'Food dropped below 25 (now 19). Time for wet food or a treat!',
      tag: 'oli-need-hunger',
    });

    const encrypted = await encryptPushPayload(message, p256dhStandardB64, authUrlSafe);

    // Parse RFC 8188 header (86 bytes)
    expect(encrypted.byteLength).toBeGreaterThan(86 + 17);
    const salt = encrypted.subarray(0, 16);
    const view = new DataView(encrypted.buffer, encrypted.byteOffset, encrypted.byteLength);
    const recordSize = view.getUint32(16, false);
    const idLen = encrypted[20];
    expect(recordSize).toBe(4096);
    expect(idLen).toBe(65);

    const asPublic = encrypted.subarray(21, 86);
    const ciphertext = encrypted.subarray(86);

    // Simulate browser decrypting RFC 8291 payload
    const asPublicKey = await crypto.subtle.importKey(
      'raw',
      asPublic,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      [],
    );
    const sharedSecret = new Uint8Array(
      await crypto.subtle.deriveBits({ name: 'ECDH', public: asPublicKey }, uaPair.privateKey, 256),
    );

    const keyInfo = concatBytes(encoder.encode('WebPush: info\0'), uaPublic, asPublic);
    const ecdhHkdf = await crypto.subtle.importKey('raw', sharedSecret, 'HKDF', false, [
      'deriveBits',
    ]);
    const ikm = new Uint8Array(
      await crypto.subtle.deriveBits(
        { name: 'HKDF', hash: 'SHA-256', salt: authSecret, info: keyInfo },
        ecdhHkdf,
        256,
      ),
    );

    const ikmHkdf = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, [
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
      ikmHkdf,
      { name: 'AES-GCM', length: 128 },
      false,
      ['decrypt'],
    );
    const nonce = new Uint8Array(
      await crypto.subtle.deriveBits(
        {
          name: 'HKDF',
          hash: 'SHA-256',
          salt,
          info: encoder.encode('Content-Encoding: nonce\0'),
        },
        ikmHkdf,
        96,
      ),
    );

    const decryptedRecord = new Uint8Array(
      await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, cekKey, ciphertext),
    );
    expect(decryptedRecord[decryptedRecord.length - 1]).toBe(0x02);
    const plaintextOut = decoder.decode(decryptedRecord.subarray(0, decryptedRecord.length - 1));
    expect(plaintextOut).toBe(message);
  });
});

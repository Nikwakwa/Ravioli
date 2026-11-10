import { useSyncExternalStore } from 'react';
import { getCloset, getEmptyCloset, subscribeCloset, type AccessoryId, type Outfit } from '../utils/closet';

/** The outfit Oli is wearing right now (updates live when the closet changes). */
export function useOutfit(): Outfit {
  return useSyncExternalStore(subscribeCloset, getCloset, getEmptyCloset).outfit;
}

// All shapes are drawn in the head's own coordinates (head spans roughly x 39–161, y 30–124),
// so they follow Oli's head in every pose.

function Flower({ cx, cy, petal, r = 3.3 }: { cx: number; cy: number; petal: string; r?: number }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((deg) => (
        <circle key={deg} cx={cx} cy={cy - r * 1.05} r={r} fill={petal} transform={`rotate(${deg} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.62} fill="#f6c443" />
    </g>
  );
}

function FlowerCrown() {
  return (
    <g>
      <path d="M57 51 Q72 34 100 31 Q128 34 143 51" stroke="#5e9a54" strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <g fill="#79b56b">
        <ellipse cx={66} cy={41} rx={4.5} ry={2.2} transform="rotate(-42 66 41)" />
        <ellipse cx={93} cy={30} rx={4.5} ry={2.2} transform="rotate(-8 93 30)" />
        <ellipse cx={121} cy={33} rx={4.5} ry={2.2} transform="rotate(22 121 33)" />
        <ellipse cx={137} cy={44} rx={4.5} ry={2.2} transform="rotate(48 137 44)" />
      </g>
      <Flower cx={59} cy={49} petal="#fff7ef" r={2.9} />
      <Flower cx={72} cy={38} petal="#f79bb6" />
      <Flower cx={86} cy={32} petal="#c9a6f0" r={3} />
      <Flower cx={100} cy={29} petal="#fff7ef" r={3.8} />
      <Flower cx={114} cy={32} petal="#f79bb6" r={3} />
      <Flower cx={128} cy={38} petal="#c9a6f0" />
      <Flower cx={141} cy={49} petal="#f79bb6" r={2.9} />
    </g>
  );
}

function DetectiveCap() {
  return (
    <g>
      {/* Crown */}
      <path d="M66 43 C66 12 134 12 134 43 Q100 36 66 43 Z" fill="#b48d5c" />
      <g stroke="#8a6a41" strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.75}>
        <path d="M100 18 V38" />
        <path d="M85 21 Q81 31 81 40" />
        <path d="M115 21 Q119 31 119 40" />
        <path d="M70 32 Q100 24 130 32" />
      </g>
      {/* Brim */}
      <path d="M60 44 Q100 33 140 44 Q100 55 60 44 Z" fill="#9a774a" />
      <path d="M66 44 Q100 37 134 44" stroke="#c9a678" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.8} />
      {/* Ear flaps tied on top with a tiny bow */}
      <path d="M100 18 Q90 8 88 16 Q90 21 100 18 Q110 21 112 16 Q110 8 100 18 Z" fill="#8a6a41" />
      <circle cx={100} cy={18} r={2.4} fill="#6f5433" />
    </g>
  );
}

function Sunglasses() {
  return (
    <g>
      <path d="M59 75 L44 71 M141 75 L156 71" stroke="#1c2230" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M94 77 Q100 72 106 77" stroke="#1c2230" strokeWidth={3} fill="none" strokeLinecap="round" />
      <rect x={57} y={68} width={38} height={25} rx={10} fill="#1c2230" />
      <rect x={105} y={68} width={38} height={25} rx={10} fill="#1c2230" />
      <g stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" opacity={0.42}>
        <path d="M65 74 L72 87 M71 73 L75 80" />
        <path d="M113 74 L120 87 M119 73 L123 80" />
      </g>
    </g>
  );
}

function Bowtie() {
  return (
    <g>
      <path d="M100 128 L79 117 Q75 128 79 139 Z" fill="#dc3545" />
      <path d="M100 128 L121 117 Q125 128 121 139 Z" fill="#dc3545" />
      <path d="M83 122 L93 127 M83 134 L93 129 M117 122 L107 127 M117 134 L107 129" stroke="#a61e2c" strokeWidth={1.3} strokeLinecap="round" />
      <rect x={94.5} y={122} width={11} height={12} rx={3.5} fill="#b82231" />
    </g>
  );
}

function BowtieBack() {
  return <path d="M58 115 Q100 129 142 115" stroke="#dc3545" strokeWidth={5} fill="none" strokeLinecap="round" />;
}

const SCARF_WRAP = 'M53 114 Q100 135 147 114';

function Scarf({ back = false }: { back?: boolean }) {
  return (
    <g>
      {!back && (
        <g transform="rotate(-10 122 124)">
          <rect x={114} y={122} width={16} height={31} rx={3} fill="#2f8088" />
          <path d="M114 133 H130 M114 143 H130" stroke="#f4ead7" strokeWidth={2.4} opacity={0.85} />
          <path d="M116 153 v5 M120 153 v5 M124 153 v5 M128 153 v5" stroke="#2f8088" strokeWidth={1.8} strokeLinecap="round" />
        </g>
      )}
      <path d={SCARF_WRAP} stroke="#2f8088" strokeWidth={13} fill="none" strokeLinecap="round" />
      <path d={SCARF_WRAP} stroke="#f4ead7" strokeWidth={13} fill="none" strokeDasharray="2.6 10" opacity={0.8} />
      <path d={SCARF_WRAP} stroke="#256a71" strokeWidth={1.2} fill="none" opacity={0.5} transform="translate(0 6)" />
    </g>
  );
}

function AccessoryShape({ id, back }: { id: AccessoryId; back: boolean }) {
  switch (id) {
    case 'flower_crown':
      return <FlowerCrown />;
    case 'detective_cap':
      return <DetectiveCap />;
    case 'sunglasses':
      return back ? null : <Sunglasses />;
    case 'bowtie':
      return back ? <BowtieBack /> : <Bowtie />;
    case 'scarf':
      return <Scarf back={back} />;
  }
}

/** Everything Oli is wearing, drawn over his head. `back` is the view from behind. */
export function HeadAccessories({ back = false }: { back?: boolean }) {
  const outfit = useOutfit();
  return (
    <g pointerEvents="none">
      {outfit.neck && <AccessoryShape id={outfit.neck} back={back} />}
      {outfit.face && <AccessoryShape id={outfit.face} back={back} />}
      {outfit.head && <AccessoryShape id={outfit.head} back={back} />}
    </g>
  );
}

const ICON_VIEWBOX: Record<AccessoryId, string> = {
  bowtie: '70 108 60 40',
  flower_crown: '48 18 104 44',
  scarf: '44 104 112 60',
  detective_cap: '54 4 92 56',
  sunglasses: '40 60 120 40',
};

/** Small picture of one accessory for the closet cards. */
export function AccessoryIcon({ id, className }: { id: AccessoryId; className?: string }) {
  return (
    <svg viewBox={ICON_VIEWBOX[id]} className={className} aria-hidden="true">
      <AccessoryShape id={id} back={false} />
    </svg>
  );
}

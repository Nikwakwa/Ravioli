import { useSyncExternalStore } from 'react';
import { getCloset, getEmptyCloset, subscribeCloset, type AccessoryId, type Outfit } from '../utils/closet';

/** The outfit Oli is wearing right now (updates live when the closet changes). */
export function useOutfit(): Outfit {
  return useSyncExternalStore(subscribeCloset, getCloset, getEmptyCloset).outfit;
}

/** Colors of the Fancy Suit (drawn on Oli's body by CatAvatar). */
export const SUIT = { jacket: '#2b3550', line: '#4c5a7d', shirt: '#fbfaf6', button: '#e6c15a' } as const;

/** Colors of the Yellow Raincoat (drawn on Oli's body by CatAvatar). */
export const RAINCOAT = {
  coat: '#facc15',
  shade: '#ca8a04',
  collar: '#eab308',
  gloss: '#fef9c3',
  button: '#5c4028',
} as const;

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

function WinterBeanie() {
  return (
    <g>
      {/* Fluffy cream pom-pom on top */}
      <circle cx={100} cy={10} r={8.5} fill="#fff7ed" stroke="#e5d5be" strokeWidth={1.1} />
      <circle cx={96} cy={8} r={3.4} fill="#ffffff" opacity={0.8} />
      {/* Ribbed berry-red knit dome sitting snugly between Oli's ears */}
      <path d="M68 41 C68 15 132 15 132 41 Q100 35 68 41 Z" fill="#c83e4d" stroke="#992836" strokeWidth={1.1} />
      {/* Cozy vertical knit rib lines */}
      <g stroke="#992836" strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.6}>
        <path d="M80 23 Q77 31 76 39" />
        <path d="M90 19 Q88 29 88 38" />
        <path d="M100 18 V37" />
        <path d="M110 19 Q112 29 112 38" />
        <path d="M120 23 Q123 31 124 39" />
      </g>
      {/* Cream snowflake stitch stripe */}
      <path d="M72 32 Q100 26 128 32" stroke="#fff5e6" strokeWidth={2.2} strokeDasharray="3.5 4.5" fill="none" strokeLinecap="round" opacity={0.9} />
      {/* Folded ribbed cuff */}
      <path d="M63 44 Q100 34 137 44 Q138 50 133 51 Q100 42 67 51 Q62 50 63 44 Z" fill="#fff5e6" stroke="#d8c5ad" strokeWidth={1} />
      <g stroke="#d8c5ad" strokeWidth={1.2} strokeLinecap="round" opacity={0.8}>
        <path d="M74 42 v6" />
        <path d="M84 40 v6" />
        <path d="M94 39 v6" />
        <path d="M106 39 v6" />
        <path d="M116 40 v6" />
        <path d="M126 42 v6" />
      </g>
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
    case 'winter_beanie':
      return <WinterBeanie />;
    case 'detective_cap':
      return <DetectiveCap />;
    case 'sunglasses':
      return back ? null : <Sunglasses />;
    case 'bowtie':
      return back ? <BowtieBack /> : <Bowtie />;
    case 'scarf':
      return <Scarf back={back} />;
    case 'suit':
    case 'raincoat':
      // Worn on the body: CatAvatar draws it for each pose.
      return null;
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

function SuitIcon() {
  return (
    <g>
      <path d="M18 6 L30 12 L42 6 L55 14 L50 30 L45 28 V56 H15 V28 L10 30 L5 14 Z" fill={SUIT.jacket} />
      <path d="M22 7 L30 34 L38 7 L30 12 Z" fill={SUIT.shirt} />
      <path d="M19 6 L30 36 L23 30 L17 16 Z" fill={SUIT.line} />
      <path d="M41 6 L30 36 L37 30 L43 16 Z" fill={SUIT.line} />
      <circle cx={30} cy={42} r={1.8} fill={SUIT.button} />
      <circle cx={30} cy={49} r={1.8} fill={SUIT.button} />
      <path d="M37 24 l6 -1 l-1 4.5 z" fill={SUIT.shirt} />
    </g>
  );
}

function RaincoatIcon() {
  return (
    <g>
      {/* Hood */}
      <path d="M18 12 Q30 2 42 12 L39 18 H21 Z" fill={RAINCOAT.collar} stroke={RAINCOAT.shade} strokeWidth={1.2} />
      {/* Coat & sleeves */}
      <path
        d="M19 14 H41 L54 22 L49 35 L43 32 L46 55 H14 L17 32 L11 35 L6 22 Z"
        fill={RAINCOAT.coat}
        stroke={RAINCOAT.shade}
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
      {/* Front storm flap & toggles */}
      <line x1={30} y1={16} x2={30} y2={54} stroke={RAINCOAT.shade} strokeWidth={1.4} />
      {[24, 34, 44].map((y) => (
        <g key={y}>
          <line x1={26} y1={y} x2={34} y2={y} stroke={RAINCOAT.button} strokeWidth={2.1} strokeLinecap="round" />
        </g>
      ))}
      {/* Glossy raindrop highlight */}
      <path d="M19 23 L17 44" stroke={RAINCOAT.gloss} strokeWidth={2.2} strokeLinecap="round" opacity={0.85} />
    </g>
  );
}

const ICON_VIEWBOX: Record<AccessoryId, string> = {
  bowtie: '70 108 60 40',
  flower_crown: '48 18 104 44',
  winter_beanie: '56 0 88 56',
  scarf: '44 104 112 60',
  detective_cap: '54 4 92 56',
  raincoat: '0 0 60 60',
  sunglasses: '40 60 120 40',
  suit: '0 0 60 60',
};

/** Small picture of one accessory for the closet cards. */
export function AccessoryIcon({ id, className }: { id: AccessoryId; className?: string }) {
  return (
    <svg viewBox={ICON_VIEWBOX[id]} className={className} aria-hidden="true">
      {id === 'suit' ? <SuitIcon /> : id === 'raincoat' ? <RaincoatIcon /> : <AccessoryShape id={id} back={false} />}
    </svg>
  );
}

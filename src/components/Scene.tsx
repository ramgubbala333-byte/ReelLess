import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/**
 * Original code-drawn scenery for ScrollTally: matte layered silhouettes in
 * the navy game palette. No image assets. The hub scene is a jungle hollow
 * with a teal-lit cave portal; feed scenes are simple location plates
 * (waterfall, jungle, mountains, ocean, cave, peaks) behind each reel.
 */

const SKY = '#132A47';
const FAR = '#1B3A5F';
const MID = '#10233C';
const NEAR = '#0A1830';
const LEAF = '#14402F';
const LEAF_DARK = '#0C2A20';
const TEAL = '#3FC1B0';
const MOON = '#FFE9B8';

function Leaf({
  x,
  y,
  s = 1,
  r = 0,
  fill,
  flip = false,
}: {
  x: number;
  y: number;
  s?: number;
  r?: number;
  fill: string;
  flip?: boolean;
}) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${r}) scale(${flip ? -s : s} ${s})`}>
      <Path
        d="M0 0 C 14 -16 34 -18 46 -6 C 34 8 14 10 0 0 Z M2 1 C 14 -4 28 -6 40 -6"
        fill={fill}
        stroke={fill}
        strokeWidth={1}
      />
    </G>
  );
}

function Stars({ seed = 1 }: { seed?: number }) {
  const pts: Array<[number, number, number]> = [
    [30 + seed * 7, 26, 1.6],
    [86, 14 + seed * 3, 1.2],
    [150, 34, 1.8],
    [214, 16, 1.2],
    [276, 30 + seed * 2, 1.5],
    [326, 12, 1.1],
    [120, 58, 1.0],
    [248, 62, 1.0],
  ];
  return (
    <>
      {pts.map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill="#DCE9FB" opacity={0.5} />
      ))}
    </>
  );
}

/** Wide backdrop for the Today hub: jungle hollow + teal cave portal. */
export function HubScene() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 250" preserveAspectRatio="xMidYMid slice">
      <Rect x={0} y={0} width={360} height={250} fill={SKY} />
      <Stars seed={2} />
      <Circle cx={308} cy={40} r={17} fill={MOON} opacity={0.9} />
      {/* far ridge */}
      <Path d="M0 150 L70 96 L128 138 L196 84 L262 132 L360 92 L360 250 L0 250 Z" fill={FAR} />
      {/* cave mound */}
      <Path d="M96 250 C96 168 128 128 180 128 C232 128 264 168 264 250 Z" fill={MID} />
      {/* portal: teal-lit arch */}
      <Path d="M146 250 C146 196 160 168 180 168 C200 168 214 196 214 250 Z" fill="#08323A" />
      <Path
        d="M146 250 C146 196 160 168 180 168 C200 168 214 196 214 250"
        fill="none"
        stroke={TEAL}
        strokeWidth={3}
        opacity={0.75}
      />
      <Ellipse cx={180} cy={226} rx={26} ry={10} fill={TEAL} opacity={0.28} />
      {/* mid ground */}
      <Path d="M0 214 C60 198 120 210 180 204 C240 198 300 208 360 196 L360 250 L0 250 Z" fill={NEAR} />
      {/* jungle leaves framing */}
      <Leaf x={-8} y={26} s={1.5} r={18} fill={LEAF_DARK} />
      <Leaf x={6} y={64} s={1.1} r={38} fill={LEAF} />
      <Leaf x={352} y={20} s={1.5} r={-14} fill={LEAF_DARK} flip />
      <Leaf x={338} y={66} s={1.05} r={-34} fill={LEAF} flip />
      <Leaf x={30} y={238} s={1.2} r={-24} fill={LEAF_DARK} />
      <Leaf x={322} y={240} s={1.2} r={22} fill={LEAF_DARK} flip />
      {/* hanging vines */}
      <Path d="M58 0 C54 26 62 44 56 70" stroke={LEAF} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <Path d="M302 0 C306 22 298 40 304 62" stroke={LEAF} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      {/* fireflies */}
      <Circle cx={92} cy={168} r={2.4} fill="#FFC53D" opacity={0.85} />
      <Circle cx={272} cy={158} r={2} fill={TEAL} opacity={0.8} />
      <Circle cx={238} cy={196} r={1.8} fill="#FFC53D" opacity={0.7} />
      <Circle cx={116} cy={204} r={1.8} fill={TEAL} opacity={0.7} />
    </Svg>
  );
}

export type SceneKind = 'waterfall' | 'jungle' | 'mountains' | 'ocean' | 'cave' | 'peaks';

export const SCENE_KINDS: SceneKind[] = ['waterfall', 'jungle', 'mountains', 'ocean', 'cave', 'peaks'];

/** Deterministic scene pick for a reel card id. */
export function sceneForCard(id: string): SceneKind {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return SCENE_KINDS[h % SCENE_KINDS.length];
}

/** Location plate behind a simulated reel in the feed. */
export function ReelScene({ kind }: { kind: SceneKind }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 300" preserveAspectRatio="xMidYMid slice">
      <Rect x={0} y={0} width={360} height={300} fill={SKY} />
      <Stars seed={kind.length} />
      {kind === 'waterfall' && (
        <>
          <Path d="M0 300 L0 120 L120 120 L120 300 Z" fill={MID} />
          <Path d="M240 300 L240 96 L360 96 L360 300 Z" fill={MID} />
          <Path d="M120 118 L240 118 L228 300 L134 300 Z" fill="#BEE3F2" opacity={0.9} />
          <Path d="M168 118 L182 118 L178 300 L164 300 Z" fill="#7FC7DE" opacity={0.8} />
          <Ellipse cx={181} cy={292} rx={86} ry={12} fill={TEAL} opacity={0.4} />
          <Leaf x={-6} y={36} s={1.4} r={20} fill={LEAF_DARK} />
          <Leaf x={346} y={30} s={1.4} r={-16} fill={LEAF_DARK} flip />
          <Path d="M0 300 C70 282 140 292 200 284 C260 276 320 286 360 278 L360 300 L0 300 Z" fill={NEAR} />
        </>
      )}
      {kind === 'jungle' && (
        <>
          <Path d="M0 226 C60 204 130 220 190 208 C250 196 310 212 360 200 L360 300 L0 300 Z" fill={FAR} />
          <Leaf x={20} y={110} s={2.1} r={24} fill={LEAF} />
          <Leaf x={70} y={66} s={1.7} r={6} fill={LEAF_DARK} />
          <Leaf x={330} y={104} s={2.1} r={-22} fill={LEAF} flip />
          <Leaf x={282} y={60} s={1.6} r={-4} fill={LEAF_DARK} flip />
          <Leaf x={140} y={44} s={1.5} r={16} fill={LEAF} />
          <Path d="M96 0 C92 40 100 66 94 104" stroke={LEAF_DARK} strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d="M262 0 C266 34 258 58 264 92" stroke={LEAF_DARK} strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d="M0 300 C80 278 160 292 230 282 C290 274 330 284 360 276 L360 300 L0 300 Z" fill={NEAR} />
          <Circle cx={180} cy={150} r={22} fill={MOON} opacity={0.55} />
        </>
      )}
      {kind === 'mountains' && (
        <>
          <Circle cx={286} cy={54} r={18} fill={MOON} opacity={0.9} />
          <Path d="M0 300 L0 190 L96 108 L168 190 L168 300 Z" fill={FAR} />
          <Path d="M110 300 L196 130 L268 216 L318 158 L360 210 L360 300 Z" fill={MID} />
          <Path d="M196 130 L224 164 L208 168 L196 152 L184 168 L170 162 Z" fill="#E8F1FB" opacity={0.9} />
          <Path d="M0 300 C70 280 150 292 220 282 C280 274 330 284 360 278 L360 300 L0 300 Z" fill={NEAR} />
        </>
      )}
      {kind === 'ocean' && (
        <>
          <Circle cx={180} cy={196} r={30} fill="#F99C3D" opacity={0.9} />
          <Rect x={0} y={206} width={360} height={94} fill="#0E3D55" />
          <Path d="M0 218 C40 208 80 226 120 216 C160 206 200 224 240 214 C280 204 320 222 360 212 L360 232 L0 232 Z" fill={TEAL} opacity={0.35} />
          <Path d="M0 248 C50 238 100 254 150 244 C200 234 250 252 300 242 C330 236 350 244 360 240 L360 258 L0 258 Z" fill="#BEE3F2" opacity={0.22} />
          <Path d="M0 300 C80 284 170 294 240 284 C300 276 340 286 360 280 L360 300 L0 300 Z" fill={NEAR} />
          <Path d="M40 120 L66 104 M60 132 L84 118" stroke="#DCE9FB" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
        </>
      )}
      {kind === 'cave' && (
        <>
          <Path d="M30 300 C30 150 92 84 180 84 C268 84 330 150 330 300 Z" fill={MID} />
          <Path d="M118 300 C118 208 144 158 180 158 C216 158 242 208 242 300 Z" fill="#08323A" />
          <Path d="M118 300 C118 208 144 158 180 158 C216 158 242 208 242 300" fill="none" stroke={TEAL} strokeWidth={3.5} opacity={0.8} />
          <Ellipse cx={180} cy={286} rx={52} ry={11} fill={TEAL} opacity={0.3} />
          <Path d="M60 84 L74 130 L62 128 Z M292 76 L282 122 L296 118 Z" fill={NEAR} />
          <Path d="M0 300 C80 282 170 294 240 284 C300 276 340 286 360 280 L360 300 L0 300 Z" fill={NEAR} />
          <Circle cx={96} cy={196} r={2.4} fill="#FFC53D" opacity={0.85} />
          <Circle cx={268} cy={210} r={2} fill={TEAL} opacity={0.85} />
        </>
      )}
      {kind === 'peaks' && (
        <>
          <Path d="M0 300 L0 210 L70 138 L150 226 L216 148 L360 236 L360 300 Z" fill={FAR} />
          <Path d="M0 300 L86 196 L160 268 L238 182 L360 262 L360 300 Z" fill={MID} />
          <Path d="M86 196 L106 218 L94 222 L86 210 L76 222 L66 216 Z" fill="#E8F1FB" opacity={0.95} />
          <Path d="M238 182 L260 206 L246 210 L238 196 L228 210 L218 204 Z" fill="#E8F1FB" opacity={0.95} />
          <Circle cx={316} cy={48} r={4} fill="#DCE9FB" opacity={0.8} />
          <Circle cx={52} cy={70} r={3} fill="#DCE9FB" opacity={0.7} />
          <Path d="M0 300 C80 284 170 294 240 284 C300 276 340 286 360 280 L360 300 L0 300 Z" fill={NEAR} />
        </>
      )}
    </Svg>
  );
}

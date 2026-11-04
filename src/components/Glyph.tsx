import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

export type GlyphName =
  | 'today'
  | 'reels'
  | 'stats'
  | 'duel'
  | 'settings'
  | 'bolt'
  | 'play'
  | 'heart'
  | 'comment'
  | 'share'
  | 'check'
  | 'down'
  | 'star'
  | 'lock';

/** Small set of code-drawn glyphs. No icon fonts. */
export default function Glyph({
  name,
  size = 22,
  color,
  filled = false,
}: {
  name: GlyphName;
  size?: number;
  color: string;
  filled?: boolean;
}) {
  const sw = 2;
  switch (name) {
    case 'today':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={sw} fill="none" />
          <Path d="M12 7.5 V12 L15 14" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'reels':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x={4} y={3} width={16} height={18} rx={3.5} stroke={color} strokeWidth={sw} fill="none" />
          <Path d="M4 8.5 H20 M4 15.5 H20 M9 3 V21 M15 3 V21" stroke={color} strokeWidth={1.4} fill="none" />
        </Svg>
      );
    case 'stats':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 20 V12 M10.5 20 V6 M16 20 V9.5 M21 20 H3" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'duel':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon points="13,2.5 5.5,13.5 10.8,13.5 9.8,21.5 18.5,9.8 13.2,9.8" fill={filled ? color : 'none'} stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
        </Svg>
      );
    case 'settings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 7.5 H20 M4 12 H20 M4 16.5 H20" stroke={color} strokeWidth={sw} strokeLinecap="round" />
          <Circle cx={9} cy={7.5} r={2.4} fill={color} />
          <Circle cx={15} cy={12} r={2.4} fill={color} />
          <Circle cx={8} cy={16.5} r={2.4} fill={color} />
        </Svg>
      );
    case 'bolt':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon points="13,2.5 5.5,13.5 10.8,13.5 9.8,21.5 18.5,9.8 13.2,9.8" fill={color} stroke="none" />
        </Svg>
      );
    case 'play':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon points="8,5 19,12 8,19" fill={color} />
        </Svg>
      );
    case 'heart':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 20.5 C6 16.5 3.5 13.2 3.5 9.6 C3.5 6.8 5.6 5 8 5 C9.6 5 11.1 5.9 12 7.2 C12.9 5.9 14.4 5 16 5 C18.4 5 20.5 6.8 20.5 9.6 C20.5 13.2 18 16.5 12 20.5 Z"
            fill={filled ? color : 'none'}
            stroke={color}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'comment':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 5.5 C4 4.7 4.7 4 5.5 4 H18.5 C19.3 4 20 4.7 20 5.5 V15 C20 15.8 19.3 16.5 18.5 16.5 H9 L4.8 20.2 C4.4 20.5 4 20.3 4 19.8 Z" stroke={color} strokeWidth={1.8} fill="none" strokeLinejoin="round" />
        </Svg>
      );
    case 'share':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 3.5 V15 M7.5 7.5 L12 3.5 L16.5 7.5 M5 12.5 V19 C5 20 5.7 20.5 6.5 20.5 H17.5 C18.3 20.5 19 20 19 19 V12.5" stroke={color} strokeWidth={1.9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4.5 12.5 L9.8 17.5 L19.5 6.5" stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'down':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M5 9.5 L12 16.5 L19 9.5" stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'star':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polygon
            points="12,2.8 14.9,8.9 21.5,9.7 16.6,14.3 18,20.8 12,17.5 6,20.8 7.4,14.3 2.5,9.7 9.1,8.9"
            fill={filled ? color : 'none'}
            stroke={color}
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'lock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x={5} y={10.5} width={14} height={9.5} rx={2.6} fill={filled ? color : 'none'} stroke={color} strokeWidth={1.8} />
          <Path d="M8 10.5 V8 C8 5.2 9.8 3.5 12 3.5 C14.2 3.5 16 5.2 16 8 V10.5" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" />
          <Circle cx={12} cy={15.2} r={1.7} fill={color} />
        </Svg>
      );
  }
}

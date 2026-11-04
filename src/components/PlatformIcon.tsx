import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { PlatformId } from '../types';

/**
 * Real platform brand icons: the authentic brand glyph, drawn in SVG, on a
 * rounded tile in the platform's solid brand color. No gradient tiles.
 * Glyph paths are the standard Simple Icons / Font Awesome brand marks.
 */
export const BRAND_COLORS: Record<PlatformId, string> = {
  instagram: '#E1306C',
  youtube: '#FF0000',
  facebook: '#1877F2',
  snapchat: '#FFFC00',
};

const WHITE = '#FFFFFF';
const DARK = '#151515'; // ghost needs a dark glyph on Snapchat yellow

function InstagramGlyph({ s }: { s: number }) {
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24">
      <Rect x={3.1} y={3.1} width={17.8} height={17.8} rx={4.9} stroke={WHITE} strokeWidth={1.9} fill="none" />
      <Circle cx={12} cy={12} r={3.9} stroke={WHITE} strokeWidth={1.9} fill="none" />
      <Circle cx={17.2} cy={6.8} r={1.3} fill={WHITE} />
    </Svg>
  );
}

function YoutubeGlyph({ s }: { s: number }) {
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24">
      <Path
        fill={WHITE}
        fillRule="evenodd"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </Svg>
  );
}

function FacebookGlyph({ s }: { s: number }) {
  // Font Awesome facebook-f mark, viewBox 0 0 320 512 (taller than wide).
  return (
    <Svg width={s * 0.625} height={s} viewBox="0 0 320 512">
      <Path
        fill={WHITE}
        d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-39.22 38.44-39.22 7.1 0 15.24.96 22.24 2.66V56.31c-12.86-1.75-28.51-2.81-45.74-2.81-45.23 0-76.48 27.6-76.48 76.52v62.61H92.35V288h67.42v224h100.59V288z"
      />
    </Svg>
  );
}

function SnapchatGlyph({ s }: { s: number }) {
  // Ghost silhouette drawn symmetric on the 24 grid: domed head, ear bumps,
  // arms out at mid height, scalloped skirt.
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24">
      <Path
        fill={DARK}
        d="M12 2.4 C14.9 2.4 17.0 4.3 17.5 6.9 C17.7 7.9 18.1 8.7 18.9 9.0 C19.9 8.7 20.9 9.3 21.2 10.3 C21.5 11.3 20.9 12.3 19.9 12.5 C18.9 12.7 18.3 13.5 18.2 14.7 L18.2 19.0 C17.2 18.0 16.0 18.0 15.1 19.1 C14.2 18.1 12.9 18.1 12.0 19.3 C11.1 18.1 9.8 18.1 8.9 19.1 C8.0 18.0 6.8 18.0 5.8 19.0 L5.8 14.7 C5.7 13.5 5.1 12.7 4.1 12.5 C3.1 12.3 2.5 11.3 2.8 10.3 C3.1 9.3 4.1 8.7 5.1 9.0 C5.9 8.7 6.3 7.9 6.5 6.9 C7.0 4.3 9.1 2.4 12 2.4 Z"
      />
    </Svg>
  );
}

export default function PlatformIcon({
  id,
  size = 30,
  style,
}: {
  id: PlatformId;
  size?: number;
  style?: ViewStyle;
}) {
  const glyph = Math.round(size * 0.68);
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: Math.round(size * 0.31), backgroundColor: BRAND_COLORS[id] },
        style,
      ]}
    >
      {id === 'instagram' && <InstagramGlyph s={glyph} />}
      {id === 'youtube' && <YoutubeGlyph s={glyph} />}
      {id === 'facebook' && <FacebookGlyph s={glyph} />}
      {id === 'snapchat' && <SnapchatGlyph s={glyph} />}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center' },
});

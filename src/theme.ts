/**
 * ReelLess visual system: a dark navy game shell in the Adventure Game
 * direction (deep navy world, chunky rounded panels, warm orange actions),
 * with Volt the battery as the hero. Original palette mapping, no assets
 * or layouts taken from any reference design.
 */
export const colors = {
  bg: '#0D1526', // navy world background
  bgDeep: '#0A1120', // deepest navy (break screen, widget preview)
  panel: '#192E4E', // raised card
  panelAlt: '#264A6E', // lighter raised card / selected fill
  line: '#33517E', // soft navy border
  cream: '#FFFFFF', // primary text (bold white titles)
  creamDim: '#C9D6EC', // pale blue-gray body text
  muted: '#6F80A1', // slate secondary text / inactive
  amber: '#F99C3D', // warm orange: primary actions, selected states
  amberSoft: '#FFBE78',
  rust: '#C35129', // danger / over-goal
  rustSoft: '#E07856',
  brown: '#5D1D0F', // deep brown shadow detail
  sage: '#3FC1B0', // teal success / cave light
  star: '#FFC53D', // XP star
  black: '#0D1526', // text on orange, pill core
};

export const fonts = {
  display: 'Nunito_900Black',
  displayBold: 'Nunito_800ExtraBold',
  body: 'Nunito_400Regular',
  bodySemi: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyBlack: 'Nunito_800ExtraBold',
};

export const radius = {
  card: 24,
  pill: 999,
  sheet: 28,
};

/** Soft diffused drop shadow used by raised game cards. */
export const cardShadow = {
  shadowColor: '#04070F',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 12,
  elevation: 6,
} as const;

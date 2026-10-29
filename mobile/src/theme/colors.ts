/**
 * Editorial brand palette, mirrored from the web app's design tokens.
 *
 * NativeWind handles colour inside `className`; these raw values are for the
 * places that need a literal colour: StatusBar, blur tints, native component
 * props (selection colour, placeholder, ActivityIndicator), and Reanimated.
 */
export const colors = {
  ink: '#0f172a',
  canvas: '#f4f4ee',
  acid: '#2ee89e',
  acidForeground: '#0f172a',
  rule: '#dcdcd4',
  white: '#ffffff',
  // Common ink opacities precomputed for native props that can't take alpha utils.
  inkMuted: 'rgba(15, 23, 42, 0.6)',
  inkSubtle: 'rgba(15, 23, 42, 0.4)',
  inkFaint: 'rgba(15, 23, 42, 0.15)',
} as const;

export type BrandColor = keyof typeof colors;

import {
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';

/**
 * Brand typefaces, matched to the web app:
 *   Archivo       → display / headings (black, editorial)
 *   Manrope       → body / UI text
 *   JetBrains Mono → micro-labels (uppercase, tracked out)
 *
 * Each weight registers under its own family name (React Native picks fonts by
 * family, not by numeric weight), and those exact names are mapped to Tailwind
 * `font-*` utilities in tailwind.config.js.
 */
export const fontMap = {
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} as const;

export function useAppFonts() {
  const [fontsLoaded, fontError] = useFonts(fontMap);
  // Render once fonts are ready, or if they failed (fall back to system rather
  // than trapping the user on the splash screen forever).
  return { fontsReady: fontsLoaded || fontError !== null };
}

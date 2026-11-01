import { View } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Interactive Google Maps embed for a vendor's coordinates — the same embed URL
 * the web app uses, rendered in a WebView (ships in Expo Go, no native build or
 * API key needed). The map pans/zooms inside its box; the screen keeps an
 * "Open in Maps" button for directions in the native app.
 */
export function VendorMap({
  latitude,
  longitude,
  height = 220,
}: {
  latitude: number;
  longitude: number;
  height?: number;
}) {
  const uri = `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  return (
    <View className="overflow-hidden border border-ink/15 bg-white" style={{ height }}>
      <WebView
        source={{ uri }}
        originWhitelist={['https://*']}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        javaScriptEnabled
        domStorageEnabled
        nestedScrollEnabled
        startInLoadingState
        androidLayerType="hardware"
      />
    </View>
  );
}

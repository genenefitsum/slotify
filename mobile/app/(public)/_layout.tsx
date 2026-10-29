import { Stack } from 'expo-router';

// Public (unauthenticated) flow: landing + auth screens. Slide transitions,
// no headers — each screen owns its own chrome.
export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#f4f4ee' },
      }}
    />
  );
}

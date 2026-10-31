import { Stack } from 'expo-router';

// Outer customer stack: the tab navigator is one screen, and detail/flow
// screens (vendor, booking flow, booking detail) push *over* it — so they're
// full-screen with no tab bar overlapping their content.
export default function CustomerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#f4f4ee' },
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

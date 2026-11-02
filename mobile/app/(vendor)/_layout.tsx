import { Stack } from 'expo-router';

// Outer vendor stack: the tab navigator is one screen, and detail/flow screens
// (booking detail, service editor) push *over* it — full-screen, no tab bar
// overlapping their content. Mirrors the customer group's structure.
export default function VendorLayout() {
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

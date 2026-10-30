import { Stack } from 'expo-router';

// Bookings tab stack: list → booking detail.
export default function BookingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f4f4ee' },
      }}
    />
  );
}

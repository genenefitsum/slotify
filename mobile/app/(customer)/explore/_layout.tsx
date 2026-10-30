import { Stack } from 'expo-router';

// Explore tab's own stack: vendor list → vendor detail pushes over it.
export default function ExploreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f4f4ee' },
      }}
    />
  );
}

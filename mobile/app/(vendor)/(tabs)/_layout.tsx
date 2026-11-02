import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { BriefcaseBusiness, CalendarCheck, LayoutGrid, Store } from 'lucide-react-native';
import { Platform, StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';

// Vendor tab shell. Same frosted bar as the customer side: iOS gets a blurred
// tab bar; Android uses a solid canvas bar (blur over content is costly there).
export default function VendorTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkSubtle,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.inkFaint,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.canvas,
          elevation: 0,
        },
        tabBarBackground:
          Platform.OS === 'ios'
            ? () => <BlurView tint="light" intensity={40} style={StyleSheet.absoluteFill} />
            : undefined,
        tabBarLabelStyle: {
          fontFamily: 'JetBrainsMono_500Medium',
          fontSize: 10,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size }) => <BriefcaseBusiness color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: 'Business',
          tabBarIcon: ({ color, size }) => <Store color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

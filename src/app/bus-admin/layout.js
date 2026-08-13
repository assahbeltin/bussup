import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';


export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'overview') iconName = 'dashboard';
          else if (route.name === 'fleet') iconName = 'directions-bus';
          else if (route.name === 'trips') iconName = 'event-note';
          else if (route.name === 'bookings') iconName = 'confirmation-number';
          else if (route.name === 'users') iconName = 'group';

          return <MaterialIcons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="overview" options={{ title: 'Overview' }} />
      <Tabs.Screen name="fleet" options={{ title: 'Fleet' }} />
      <Tabs.Screen name="trips" options={{ title: 'Schedule' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="users" options={{ title: 'Users' }} />
    </Tabs>
  );
}
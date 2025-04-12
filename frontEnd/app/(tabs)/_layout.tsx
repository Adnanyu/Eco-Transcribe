import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name={focused ? "house.fill" : "house"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          tabBarIcon: ({ color, focused }) => <IconSymbol size={30} name={focused ? "microphone.fill" : "microphone"}  color={color} />,
        }}
      />
      <Tabs.Screen
        name="recordings"
        options={{
          title: 'Recordings',
          headerTitle: 'All Recordings',
     
          // tabBarIcon: ({ color }) => <MaterialIcons name="multitrack-audio" size={24} color={color} />,
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name={focused ? "waveform" : "waveform"}  color={color} />,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'user',
          // tabBarIcon: ({ color }) => <MaterialIcons name="multitrack-audio" size={24} color={color} />,
          tabBarIcon: ({ color, focused }) => <IconSymbol size={30} name={focused ? "person.crop.circle.fill" : "person.crop.circle"}  color={color} />,
        }}
      />
    </Tabs>
  );
}

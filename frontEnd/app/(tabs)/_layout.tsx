import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, Text } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter()

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
        name="chat"
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name={focused ? "message.badge.waveform.fill" : "message.badge.waveform"} color={color} />,
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
          // headerRight: () => (
          //   <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
          //     <Text style={{ marginRight: 10, color: 'blue' }}>Edit</Text>
          //   </TouchableOpacity>),
          headerStyle: {backgroundColor: 'red'},
     
          // tabBarIcon: ({ color }) => <MaterialIcons name="multitrack-audio" size={24} color={color} />,
          tabBarIcon: ({ color, focused }) => <IconSymbol size={28} name={focused ? "waveform" : "waveform"}  color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          headerStyle: {backgroundColor: 'red'},
          // tabBarIcon: ({ color }) => <MaterialIcons name="multitrack-audio" size={24} color={color} />,
          tabBarIcon: ({ color, focused }) => <IconSymbol size={30} name={focused ? "rectangle.stack.badge.play.fill" : "rectangle.stack.badge.play"}  color={color} />,
        }}
      />
    </Tabs>
  );
}

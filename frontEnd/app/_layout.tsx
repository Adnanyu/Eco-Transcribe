import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { TouchableOpacity, View, Text } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recordings/[id]" options={({ route }) => {
          return {
          title: 'Recording Detail',
          headerBackTitle: 'Recordings',
          headerTintColor: '#FA2E47', 
          }
        }
      }/>
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="recordings/edit/[id]"
          options={{
            title: 'Edit Recording',
            headerBackTitle: 'Cancel',
            headerTintColor: '#FA2E47',
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => {}} 
                  style={{
                    paddingHorizontal: 15, 
                    paddingVertical: 5, 
                  }}
                >
                  <Text style={{ color: '#FA2E47', fontSize: 16 }}>Save</Text>
                </TouchableOpacity>
              </View>
            )
          }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

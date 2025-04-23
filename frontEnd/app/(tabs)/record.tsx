import { ThemedText } from "@/components/ThemedText";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Appearance, Button, ColorSchemeName, Pressable, SafeAreaView, StyleSheet } from "react-native";
import { Audio } from 'expo-av';
import { ThemedView } from "@/components/ThemedView";
import axios from "axios";
import * as FileSystem from 'expo-file-system';
import { Colors } from "@/constants/Colors";
import { timeFormat } from "../util/timeFormat";



type Theme = {
    text: string;
    background: string;
    tint: string;
    icon: string;
    tabIconDefault: string;
    tabIconSelected: string;
    borderColor:string
}

export default function User() {
  const [recording, setRecording] = useState<Audio.Recording>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [duration, setDuration] = useState(0);
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const uploadFile = async () => {
      if (!recording?.getURI()!) {
        Alert.alert('No file selected!');
        return;
      }
      // if (!audioRecorder.uri) {
      //   Alert.alert('No file selected!');
      //   return;
      // }
      
  
    
    
  
    try {
      const response = await FileSystem.uploadAsync('http://localhost:8080/api/recordings/file', recording?.getURI()!, {
        fieldName: 'file',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    });

      if (response.status === 201) {
        Alert.alert('Upload successful');
      } else {
        Alert.alert('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error uploading file');
    }
  };

  const startRecording = async () => {
  try {
    if (permissionResponse?.status !== 'granted') {
            const { status } = await requestPermission();
        }
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        })
    

        console.log('starting recording..');
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        recording.setOnRecordingStatusUpdate(status => {
          if (status.isRecording) {
            setDuration(status.durationMillis / 1000);
            const level = status.metering;
          }
        })
        setRecording(recording);
        console.log('Recording started');
    }catch (err) {
        console.error('Failed to start recording', err);
      }
  }
  async function stopRecording() {
      console.log('Stopping recording..');
      setRecording(undefined);
      await recording?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync(
        {
          allowsRecordingIOS: false,
        }
      );
      const uri = recording?.getURI();
      console.log('Recording stopped and stored at', uri);
      uploadFile() 
  }
  return (
      <SafeAreaView style={styles().container}>
      <ThemedView style={styles().footer}>
          {/* <Button
              title={recording ? 'Stop Recording' : 'Start Recording'}
              onPress={recording ? stopRecording : startRecording}
          /> */}
        <ThemedText>{ timeFormat(duration) }</ThemedText>
              <Pressable  onPress={recording ? stopRecording : startRecording}>
                  <ThemedView style={styles(recording, theme, colorScheme).recordButton}>
                  <ThemedView style={styles(recording, theme).redCircle} />
                  </ThemedView>
              </Pressable>
          </ThemedView>
    </SafeAreaView>
);
}

const styles = (recording?: Audio.Recording, theme?: Theme, colorScheme?: ColorSchemeName) => StyleSheet.create({
    container: {
      
    },
    footer: {
        //background color must be little different
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordButton: {
        // width: recording ? 40 : 60,
        // height: recording ? 40 : 60,
        width: 60,
        height: 60,
        borderRadius: 60,
        borderWidth: 4,
        padding: 3,
        borderColor: colorScheme === 'dark' ? 'white' : 'gray',
        alignItems: 'center',
        justifyContent: 'center'
    },
    redCircle: {
        backgroundColor: '#FF453A',
        width: recording ? '50%' : '100%',
        borderRadius: recording ? 5 : 60,
        aspectRatio: 1,
  },
  });
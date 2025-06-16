import { ThemedText } from "@/components/ThemedText";
import { useEffect, useRef, useState } from "react";
import { Alert, Text, Animated, Appearance, AppState, Button, ColorSchemeName, Pressable, SafeAreaView, StyleSheet, TouchableOpacity, View, ScrollView } from "react-native";
import { Audio } from 'expo-av';
import { ThemedView } from "@/components/ThemedView";
import axios from "axios";
import * as FileSystem from 'expo-file-system';
import { Colors } from "@/constants/Colors";
import { timeFormat } from "../../util/timeFormat";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { createRecording } from "@/store/slices/recordingsSlice";
import Spinner from "@/components/Spinner";

const WEBSOCKET_URL = 'ws://1.1.15.13:8000/ws/speech';


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
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [errorr, setError] = useState('');
  
  const fullRecordingRef = useRef<Audio.Recording | null>(null);


  const websocketRef = useRef(null);
  const recordingRef = useRef(null);
  const timerRef = useRef(null);
  const scrollViewRef = useRef(null);

  const [recording, setRecording] = useState<Audio.Recording>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [duration, setDuration] = useState(0);
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const { status, error } = useSelector((state: RootState) => state.recordings)

  const dispatch = useDispatch<AppDispatch>()

  const handleUpload = async (fileUri: string) => {
    try {
              await dispatch(createRecording({fileUri, type:'RECORDED'})).unwrap()
              Alert.alert('Recording successfully Uploaded');
          } catch (err) {
              Alert.alert('Error Uplaoding Recording: ', error!);
          }
      }

  // const uploadFile = async () => {
  //     if (!recording?.getURI()!) {
  //       Alert.alert('No file selected!');
  //       return;
  //     }
  //     // if (!audioRecorder.uri) {
  //     //   Alert.alert('No file selected!');
  //     //   return;
  //     // }
      
  
    
    
  
  //   try {
  //     const response = await FileSystem.uploadAsync('http://localhost:8080/api/recordings/file', recording?.getURI()!, {
  //       fieldName: 'file',
  //       httpMethod: 'POST',
  //       uploadType: FileSystem.FileSystemUploadType.MULTIPART,
  //   });

  //     if (response.status === 201) {
  //       Alert.alert('Upload successful');
  //     } else {
  //       Alert.alert('Upload failed');
  //     }
  //   } catch (error) {
  //     console.error('Error uploading file:', error);
  //     Alert.alert('Error uploading file');
  //   }
  // };


   // Connect to WebSocket
   const connectWebSocket = () => {
    try {
      // Close existing connection if any
      if (websocketRef.current) {
        websocketRef.current.close();
      }
  
      websocketRef.current = new WebSocket(WEBSOCKET_URL);
  
      websocketRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);  
        setError('');
      };
  
      websocketRef.current.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.type === 'transcription') {
          setTranscript(prev => prev + ' ' + response.text);
        } else if (response.type === 'error') {
          setError(response.message);
        }
      };
  
      websocketRef.current.onerror = (e) => {
        console.error('WebSocket error:', e);
        setError('Connection error. Please try again.');
        setIsConnected(false);
      };
  
      websocketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
      };
  
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setError('Failed to connect. Please check server address.');
      setIsConnected(false);
    }
  };
  

  // Initialize audio recording and WebSocket connection
  useEffect(() => {
    // Request audio recording permissions
    const getPermissions = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          setError('Microphone permission is required to record audio');
        }
      } catch (err) {
        console.error('Error requesting permissions:', err);
        setError('Failed to get microphone permissions');
      }
    };
    
    getPermissions();
    connectWebSocket();
    
    return () => {
      // Clean up on component unmount
      if (recordingRef.current) {
        stopRecording();
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);


  const resetRecordingState = async () => {
    try {
      // Stop any active timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
  
      // Stop and unload any existing recordings
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
  
      // Reset base64 offset
      lastBase64Length = 0;
  
      // Clear transcript and errors
      setTranscript('');
      setError('');
      setDuration(0);
      setRecording(undefined);
      setIsRecording(false);
  
      // Reconnect WebSocket
      if (websocketRef.current) {
        websocketRef.current.close(); 
        websocketRef.current = null;
      }
  
      connectWebSocket();
    } catch (err) {
      console.error('Error during reset:', err);
    }
  };
  

let lastBase64Length = 0;

const sendLatestChunk = async () => {
  try {
    const uri = recordingRef.current?.getURI();
    if (!uri || !websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) return;

    const fullBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Only send new base64 data
    const newData = fullBase64.slice(lastBase64Length);
    if (!newData || newData.length < 100) return; 

    websocketRef.current.send(JSON.stringify({
      type: 'audio',
      data: newData,
      format: { extension: '.wav' },
    }));

    lastBase64Length = fullBase64.length;
  } catch (e) {
    console.error('Error sending chunk:', e);
  }
};

const startRecording = async () => {
  await resetRecordingState(); // clean everything

  try {
    if (!isConnected) {
      setError('WebSocket not connected. Please reconnect.');
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    const recordingOptions = {
      android: {
        extension: '.wav',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.wav',
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    };

    const { recording } = await Audio.Recording.createAsync(recordingOptions);

    recording.setOnRecordingStatusUpdate(status => {
      if (status.isRecording) {
        setDuration(status.durationMillis / 1000);
        const level = status.metering;
      }
    })
    
    recordingRef.current = recording;
    setIsRecording(true);

    // Set interval for chunk sending
    timerRef.current = setInterval(sendLatestChunk, 2000); // every 4 seconds
  } catch (err) {
    console.error('Error starting recording:', err);
    setError('Failed to start recording: ' + err.message);
  }
};



const stopRecording = async () => {
  try {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (uri) {
        handleUpload(uri);
      }
    }

    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({ type: 'end_stream' }));
    }

    setIsRecording(false);
  } catch (err) {
    console.error('Error stopping recording:', err);
    setError('Failed to stop recording: ' + err.message);
  }
};


  // Reconnect to WebSocket server
  const reconnect = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    connectWebSocket();
  };

  // Clear transcript
  const clearTranscript = () => {
    setTranscript('');
  };

  // const startRecording = async () => {
  // try {
  //   if (permissionResponse?.status !== 'granted') {
  //           const { status } = await requestPermission();
  //       }
  //       await Audio.setAudioModeAsync({
  //           allowsRecordingIOS: true,
  //           playsInSilentModeIOS: true,
  //       })
    

  //       console.log('starting recording..');
  //       const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  //       recording.setOnRecordingStatusUpdate(status => {
  //         if (status.isRecording) {
  //           setDuration(status.durationMillis / 1000);
  //           const level = status.metering;
  //         }
  //       })
  //       setRecording(recording);
  //       console.log('Recording started');
  //   }catch (err) {
  //       console.error('Failed to start recording', err);
  //     }
  // }

  // async function stopRecording() {
  //     console.log('Stopping recording..');
  //     setRecording(undefined);
  //     await recording?.stopAndUnloadAsync();
  //     await Audio.setAudioModeAsync(
  //       {
  //         allowsRecordingIOS: false,
  //       }
  //     );
  //     const uri = recording?.getURI();
  //     console.log('Recording stopped and stored at', uri);
  //   if (uri) {
  //     handleUpload(uri);
  //     }
      
  // }

  return (
    <>
    {/* <SafeAreaView style={styles().container}>
      <View style={styles().header}>
        <Text style={styles().title}>Voice Transcriber</Text>
        <View style={styles().statusContainer}>
          <View style={[styles().statusIndicator, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles().statusText}>{isConnected ? 'Connected' : 'Disconnected'}</Text>
        </View>
        </View>
        <View>

        <TouchableOpacity
            style={[styles().button, styles().reconnectButton]}
            onPress={reconnect}
            >
            <Text style={styles().buttonText}>Reconnect</Text>
          </TouchableOpacity>
          </View>
      
      {error ? (
        <View style={styles().errorContainer}>
          <Text style={styles().errorText}>{error}</Text>
        </View>
      ) : null}
      
      <View style={styles().transcriptContainer}>
        <Text style={styles().transcriptLabel}>Transcript:</Text>
        <ScrollView 
          ref={scrollViewRef}
          style={styles().transcriptScroll}
          contentContainerStyle={styles().transcriptContent}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          <Text style={styles().transcriptText}>
            {transcript || 'Waiting for speech...'}
          </Text>
        </ScrollView>
      </View> */}
      
      {/* <View style={styles().controls}> */}
        {/* <TouchableOpacity
          style={[styles().button, styles().recordButton, isRecording && styles().stopButton]}
          onPress={isRecording ? stopRecordingLive : startRecordingLive}
        >
          <Text style={styles().buttonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity> */}
        
        {/* <View style={styles.secondaryControls}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearTranscript}
          >
            <Text style={styles.buttonText}>Clear Transcript</Text>
          </TouchableOpacity>
          
        </View> */}
      {/* </View> */}
    {/* </SafeAreaView> */}
    <SafeAreaView style={styles().container}>
        <Spinner isLoading={status === 'pending' ? true : false} text={'Uplaoding Recording...'} />
        <View style={styles().transcriptContainer}>
            <Text style={styles().transcriptLabel}>Transcript:</Text>
            <ScrollView 
              ref={scrollViewRef}
              style={styles().transcriptScroll}
              contentContainerStyle={styles().transcriptContent}
              onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
            >
              <Text style={styles().transcriptText}>
                {transcript || 'Waiting for speech...'}
              </Text>
            </ScrollView>
      </View>
      <ThemedView style={styles().footer}>
        <ThemedText>{ timeFormat(duration) }</ThemedText>
              <Pressable  onPress={recording || isRecording ? stopRecording : startRecording}>
                  <ThemedView style={styles(recording, theme, colorScheme).recordButton}>
                  <ThemedView style={styles(recording, theme).redCircle} />
                  </ThemedView>
              </Pressable>
          </ThemedView>
      </SafeAreaView>
      </>
);
}

const styles = (recording?: Audio.Recording, theme?: Theme, colorScheme?: ColorSchemeName) => StyleSheet.create({
    container: {
      flex: 1,
    // backgroundColor: '#F5F5F5',
    },
    footer: {
        //background color must be little different
        height: 200,
        alignItems: 'center',
        justifyContent: 'flex-start',
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
      header: {
        backgroundColor: '#2196F3',
        padding: 16,
        alignItems: 'center',
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
      },
      statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
      },
      statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
      },
      statusText: {
        color: 'white',
        fontSize: 14,
      },
      errorContainer: {
        backgroundColor: '#FFEBEE',
        padding: 12,
        margin: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#F44336',
      },
      errorText: {
        color: '#D32F2F',
      },
      transcriptContainer: {
        flex: 1,
        margin: 16,
        backgroundColor: '#282828',
        borderRadius: 8,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
      transcriptLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: 'white',
      },
      transcriptScroll: {
        flex: 1,
      },
      transcriptContent: {
        paddingBottom: 16,
      },
      transcriptText: {
        fontSize: 16,
        lineHeight: 24,
        color: 'white',
      },
      controls: {
        padding: 16,
      },
      button: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
      },
      stopButton: {
        backgroundColor: '#F44336',
      },
      secondaryControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      clearButton: {
        backgroundColor: '#9E9E9E',
        flex: 1,
        marginRight: 6,
      },
      reconnectButton: {
        backgroundColor: '#2196F3',
        flex: 1,
        marginLeft: 6,
      },
      buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
      },
  });



// import React, { useState, useEffect, useRef } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   ScrollView,
// } from 'react-native';
// import { Audio } from 'expo-av';
// import * as FileSystem from 'expo-file-system';

// // Changed from http:// to ws://
// const WEBSOCKET_URL = 'ws://192.168.1.100:8000/ws/speech';

// const recordingOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;
// export default function VoiceTranscriber() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [isConnected, setIsConnected] = useState(false);
//   const [error, setError] = useState('');
  
//   const websocketRef = useRef(null);
//   const recordingRef = useRef(null);
//   const timerRef = useRef(null);
//   const scrollViewRef = useRef(null);

//   // Connect to WebSocket
//   const connectWebSocket = () => {
//     try {
//       websocketRef.current = new WebSocket(WEBSOCKET_URL);
      
//       websocketRef.current.onopen = () => {
//         console.log('WebSocket connection established');
//         setIsConnected(true);
//         setError('');
//       };
      
//       websocketRef.current.onmessage = (event) => {
//         const response = JSON.parse(event.data);
//         console.log(response);
//         if (response.type === 'transcription') {
//         // Append new transcription to existing text
//         // console.log(response)
//           setTranscript(prev => prev + ' ' + response.text);
//         } else if (response.type === 'error') {
//           setError(response.message);
//         }
//       };
      
//       websocketRef.current.onerror = (e) => {
//         console.error('WebSocket error:', e);
//         setError('Connection error. Please try again.');
//         setIsConnected(false);
//       };
      
//       websocketRef.current.onclose = () => {
//         console.log('WebSocket connection closed');
//         setIsConnected(false);
//       };
      
//     } catch (error) {
//       console.error('Error connecting to WebSocket:', error);
//       setError('Failed to connect. Please check server address.');
//       setIsConnected(false);
//     }
//   };

//   // Initialize audio recording and WebSocket connection
//   useEffect(() => {
//     // Request audio recording permissions
//     const getPermissions = async () => {
//       try {
//         const { status } = await Audio.requestPermissionsAsync();
//         if (status !== 'granted') {
//           setError('Microphone permission is required to record audio');
//         }
//       } catch (err) {
//         console.error('Error requesting permissions:', err);
//         setError('Failed to get microphone permissions');
//       }
//     };
    
//     getPermissions();
//     connectWebSocket();
    
//     return () => {
//       // Clean up on component unmount
//       if (recordingRef.current) {
//         stopRecording();
//       }
//       if (websocketRef.current) {
//         websocketRef.current.close();
//       }
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }
//     };
//   }, []);

//  // Start audio recording
// const startRecording = async () => {
//   try {
//     if (!isConnected) {
//       setError('WebSocket not connected. Please reconnect.');
//       return;
//     }

//     await Audio.setAudioModeAsync({
//       allowsRecordingIOS: true,
//       playsInSilentModeIOS: true,
//       staysActiveInBackground: true,
//     });

//     // Set custom options (from Version B) for WAV format and 16kHz mono
//     const recordingOptions = {
//       android: {
//         extension: '.wav',
//         outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
//         audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
//         sampleRate: 16000,
//         numberOfChannels: 1,
//         bitRate: 128000,
//       },
//       ios: {
//         extension: '.wav',
//         audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
//         sampleRate: 16000,
//         numberOfChannels: 1,
//         bitRate: 128000,
//         linearPCMBitDepth: 16,
//         linearPCMIsBigEndian: false,
//         linearPCMIsFloat: false,
//       },
//     };

//     const { recording } = await Audio.Recording.createAsync(recordingOptions);
//     recordingRef.current = recording;
//     setIsRecording(true);
//     setError('');

//     // Set interval for chunking
//     timerRef.current = setInterval(async () => {
//       try {
//         if (recordingRef.current) {
//           const status = await recordingRef.current.getStatusAsync();
//           if (!status.isRecording) return;

//           await recordingRef.current.stopAndUnloadAsync();
//           const uri = recordingRef.current.getURI();

//           if (uri) {
//             await sendAudioChunk(uri);
//           }

//           // Start new recording for next chunk
//           const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);
//           recordingRef.current = newRecording;
//         }
//       } catch (e) {
//         console.error('Error during chunking:', e);
//       }
//     }, 4000); // Send chunk every 3 seconds (or adjust as needed)

//   } catch (err) {
//     console.error('Error starting recording:', err);
//     setError('Failed to start recording: ' + err.message);
//   }
// };


//   // Stop audio recording
//   const stopRecording = async () => {
//     try {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
      
//       if (recordingRef.current) {
//         await recordingRef.current.stopAndUnloadAsync();
        
//         // Signal end of stream to the server
//         if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
//           websocketRef.current.send(JSON.stringify({ type: 'end_stream' }));
//         }
        
//         recordingRef.current = null;
//       }
      
//       setIsRecording(false);
      
//     } catch (err) {
//       console.error('Error stopping recording:', err);
//       setError('Failed to stop recording: ' + err.message);
//       setIsRecording(false);
//     }
//   };

//   // Send audio chunk to WebSocket server

//   // Replace your old sendAudioChunk function in Version A with this
// const sendAudioChunk = async (uri) => {
//   if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
//     console.log('WebSocket not ready, skipping chunk');
//     return;
//   }

//   try {
//     const fileInfo = await FileSystem.getInfoAsync(uri);
//     if (!fileInfo.exists) return;

//     const base64 = await FileSystem.readAsStringAsync(uri, {
//       encoding: FileSystem.EncodingType.Base64,
//     });

//     console.log('Audio chunk size:', base64.length);

//     const message = JSON.stringify({
//       type: 'audio',
//       data: base64,
//       format: { extension: '.wav' },
//     });

//     websocketRef.current.send(message);
//     await FileSystem.deleteAsync(uri, { idempotent: true });
//   } catch (e) {
//     console.error('Error sending audio chunk:', e);
//     setError('Failed to send audio chunk');
//   }
// };

  

//   // Reconnect to WebSocket server
//   const reconnect = () => {
//     if (websocketRef.current) {
//       websocketRef.current.close();
//     }
//     connectWebSocket();
//   };

//   // Clear transcript
//   const clearTranscript = () => {
//     setTranscript('');
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Voice Transcriber</Text>
//         <View style={styles.statusContainer}>
//           <View style={[styles.statusIndicator, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
//           <Text style={styles.statusText}>{isConnected ? 'Connected' : 'Disconnected'}</Text>
//         </View>
//       </View>
      
//       {error ? (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//         </View>
//       ) : null}
      
//       <View style={styles.transcriptContainer}>
//         <Text style={styles.transcriptLabel}>Transcript:</Text>
//         <ScrollView 
//           ref={scrollViewRef}
//           style={styles.transcriptScroll}
//           contentContainerStyle={styles.transcriptContent}
//           onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
//         >
//           <Text style={styles.transcriptText}>
//             {transcript || 'Waiting for speech...'}
//           </Text>
//         </ScrollView>
//       </View>
      
//       <View style={styles.controls}>
//         <TouchableOpacity
//           style={[styles.button, styles.recordButton, isRecording && styles.stopButton]}
//           onPress={isRecording ? stopRecording : startRecording}
//         >
//           <Text style={styles.buttonText}>
//             {isRecording ? 'Stop Recording' : 'Start Recording'}
//           </Text>
//         </TouchableOpacity>
        
//         <View style={styles.secondaryControls}>
//           <TouchableOpacity
//             style={[styles.button, styles.clearButton]}
//             onPress={clearTranscript}
//           >
//             <Text style={styles.buttonText}>Clear Transcript</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={[styles.button, styles.reconnectButton]}
//             onPress={reconnect}
//           >
//             <Text style={styles.buttonText}>Reconnect</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   header: {
//     backgroundColor: '#2196F3',
//     padding: 16,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   statusIndicator: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginRight: 6,
//   },
//   statusText: {
//     color: 'white',
//     fontSize: 14,
//   },
//   errorContainer: {
//     backgroundColor: '#FFEBEE',
//     padding: 12,
//     margin: 16,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#F44336',
//   },
//   errorText: {
//     color: '#D32F2F',
//   },
//   transcriptContainer: {
//     flex: 1,
//     margin: 16,
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//   },
//   transcriptLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   transcriptScroll: {
//     flex: 1,
//   },
//   transcriptContent: {
//     paddingBottom: 16,
//   },
//   transcriptText: {
//     fontSize: 16,
//     lineHeight: 24,
//   },
//   controls: {
//     padding: 16,
//   },
//   button: {
//     borderRadius: 8,
//     padding: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 12,
//   },
//   recordButton: {
//     backgroundColor: '#4CAF50',
//   },
//   stopButton: {
//     backgroundColor: '#F44336',
//   },
//   secondaryControls: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   clearButton: {
//     backgroundColor: '#9E9E9E',
//     flex: 1,
//     marginRight: 6,
//   },
//   reconnectButton: {
//     backgroundColor: '#2196F3',
//     flex: 1,
//     marginLeft: 6,
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });
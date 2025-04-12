import { Image, StyleSheet, Platform, ScrollView, FlatList, View, Appearance, Button, Alert, TouchableHighlight, Pressable } from 'react-native';
import { ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { Colors } from '@/constants/Colors';
import axios from 'axios';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';

type Recording = {
  id: Number,
  recordingUrl: String,
  title: String,
  recordingType: String,
  recordedDate: String,
  duration: number,
  recordingStartTim: String,
  recordingEndTime: String,
  transcript: Number,
  subTranscripts: Number,
  translatedTranscript: Number,
};

export const TimeFormat = (duration: number): string => {
  const hrs = ~~(duration / 3600);
  const mins = ~~((duration % 3600) / 60);
  const secs = ~~duration % 60;

  let ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;

  return ret;
}

export default function HomeScreen() {
  const [audios, setAudios] = useState<Recording[]>([])
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFiletype] = useState<string | null>(null);
  const router = useRouter()
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
    
    if (!result.canceled) {
      setFileUri(result.assets[0].uri);
      setFileName(result.assets[0].fileName!);
      setFiletype(result.assets[0].type!);
      uploadFile(fileUri)
    }
  };

  const uploadFile = async (fileUri: string | null) => {
    if (!fileUri) {
      Alert.alert('No file selected!');
      return;
    }

    try {
      const response = await FileSystem.uploadAsync('http://localhost:8080/api/recordings/file', fileUri, {
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

  const getAudios = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/recordings');
      const data = await response.json();
      setAudios(data);
    } catch (error) {
      console.error(error)
    }
  }
  const handleClick = (id: string) => {
    // router.push(`/recordings/${id}`)
  }
  useEffect(() => {
      getAudios()
  }, [uploadFile])
  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;
  return (
    <ThemedView style={styles.container}>
      <Container style={{ flex: 1 }}>
        <ThemedView style={{justifyContent: 'space-between'}}>
          {/* <ThemedText>All Recordings</ThemedText> */}
        <TouchableHighlight onPress={pickImage}>
            <View style={styles.uploadRec}>
            <IconSymbol size={30} name={"icloud.and.arrow.up"}  color={theme.tabIconSelected} />
            <ThemedText style={{fontWeight: 'bold'}}> Upload Recording</ThemedText>
            </View>
        </TouchableHighlight>
              {fileUri && <ThemedText>File URI: {fileName}</ThemedText>}
          {/* <Button title="Upload Video" onPress={uploadFile} /> */}
        </ThemedView>
        {/* <ThemedText type="title">This page is for audio tracks</ThemedText> */}
        {audios && (
          <FlatList
            data={audios}
            keyExtractor={(audio) => audio.id.toString()}
            renderItem={({ item }) => (
              <Pressable onPress={() => handleClick(item.id.toString())}>
              <ThemedView style={styles.recordingContainer}>
                <ThemedText style={styles.recordingTitle}>{item.title.length > 20 ? item.title.substring(0, 20) + '...': item.title}</ThemedText>
                <View style={styles.recordingInfo}>
                  <ThemedText style={{color: '#8E8E93'}}>{item.recordedDate.replace('T', ' ').slice(0,-3)}</ThemedText>
                  <ThemedText style={{ color: '#8E8E93' }}>{TimeFormat(item.duration)}</ThemedText>
                </View>
              </ThemedView>
              </Pressable>
            )}
          />)}
      </Container>
      </ThemedView>
  );
}

const styles = StyleSheet.create({

  container: {
      flex: 1,
    },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  item: {
      padding: 20,
      fontSize: 15,
      marginTop: 5,
  },
  recordingContainer: {
    padding: 5,
    width: '100%',
    borderStyle: 'solid',
    borderColor: '#8E8E93',
    borderBottomWidth: 0.3,
  },
  recordingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 3
    },
  recordingInfo: {
    flexDirection:'row',
    justifyContent: 'space-between',
  },
  uploadRec: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    fontWeight: 'bold'
  }
  
});

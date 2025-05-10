import { Image, StyleSheet, Platform, ScrollView, FlatList, View, Appearance, Button, Alert, TouchableHighlight, Pressable, TouchableOpacity } from 'react-native';
import { ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRouter } from 'expo-router';
import { getRecordings, uploadFile } from '../api/api';
import { timeFormat } from '../util/timeFormat';
import Spinner from '@/components/Spinner';
import { Recording } from '../types/types';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecordings } from '@/store/slices/recordingsSlice';
import { AppDispatch, RootState } from '@/store/store';
import { fetchTranscripts } from '@/store/slices/transcriptsSlice';



export default function HomeScreen() {
  const [audios, setAudios] = useState<Recording[]>([])
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFiletype] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation();
  const router = useRouter()
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const dispatch = useDispatch<AppDispatch>();
  const { recordings, status, error } = useSelector((state: RootState) => state.recordings)


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
      setIsLoading(true);
      await uploadFile(fileUri);
      setIsLoading(false);
    }
  };


  

  const handleClick = (id: string) => {
    router.push(`/recordings/${id}`)
  }
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchRecordings());
      dispatch(fetchTranscripts());
    }
    // const fetchRecordings = async () => {
    //   try {
    //     const recordings: Recording[] = await getRecordings();
    //     setAudios(recordings); 
    //   } catch (error) {
    //     console.error('Error fetching recordings:', error);
    //   }
    // };

    // fetchRecordings();
  }, [uploadFile])
  // useEffect(() => { 
  //         navigation.setOptions({
  //             headerRight: () => (
  //               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  //                 <TouchableOpacity
  //                   onPress={() => {}} // Navigate to explore page
  //                   style={{
  //                     paddingHorizontal: 15, 
  //                     paddingVertical: 15, 
  //                   }}
  //                 >
  //                   <ThemedText style={{ color: '#FA2E47', fontSize: 16 }}>Edit</ThemedText>
  //                 </TouchableOpacity>
  //               </View>
  //             ),
  //         })
  //     }, [])

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;
  return (
    <ThemedView style={styles.container}>
      <Spinner isLoading={status === 'pending' ? true : false} text={'Loading Recordings'} />
      <Container style={{ flex: 1 }}>
        <Spinner isLoading={isLoading} text={'Uploading Recording'} />
        <ThemedView style={{justifyContent: 'space-between'}}>
          {/* <ThemedText>All Recordings</ThemedText> */}
        <TouchableHighlight onPress={() => pickImage()}>
            <View style={styles.uploadRec}>
            <IconSymbol size={30} name={"icloud.and.arrow.up"}  color={theme.tabIconSelected} />
            <ThemedText style={{fontWeight: 'bold'}}> Upload Recording</ThemedText>
            </View>
        </TouchableHighlight>
              {fileUri && <ThemedText>File URI: {fileName}</ThemedText>}
          {/* <Button title="Upload Video" onPress={uploadFile} /> */}
        </ThemedView>
        {/* <ThemedText type="title">This page is for audio tracks</ThemedText> */}
        {recordings && (
          <FlatList
            data={recordings}
            keyExtractor={(recording) => recording.id.toString()}
            renderItem={({ item }) => (
              <Pressable onPress={() => handleClick(item.id.toString())} onLongPress={()=>Alert.prompt('are you sure you want to delete?')}>
              <ThemedView style={styles.recordingContainer}>
                <ThemedText style={styles.recordingTitle}>{item.title.length > 20 ? item.title.substring(0, 20) + '...': item.title}</ThemedText>
                <View style={styles.recordingInfo}>
                  <ThemedText style={{color: '#8E8E93'}}>{item.recordedDate.replace('T', ' ').slice(0,-3)}</ThemedText>
                  <ThemedText style={{ color: '#8E8E93' }}>{timeFormat(item.duration)}</ThemedText>
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

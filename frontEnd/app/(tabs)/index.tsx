import { Image, StyleSheet, Platform, TouchableOpacity, Pressable, FlatList, SafeAreaView, Alert, Modal, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { createRecording, fetchRecordings, importRecordingWithUrl } from '@/store/slices/recordingsSlice';
import { fetchTranscripts } from '@/store/slices/transcriptsSlice';
import { fetchSummaries } from '@/store/slices/summariesSlice';
import { fetchTranslatedTranscripts } from '@/store/slices/translatedSlice';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import Spinner from '@/components/Spinner';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
export default function HomeScreen() {
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFiletype] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchRecordings());
      dispatch(fetchTranscripts());
      dispatch(fetchSummaries());
      dispatch(fetchTranslatedTranscripts());
    }
  }, [])

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  
  const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      toggleModal();
      console.log(result);
    
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const name = result.assets[0].fileName!;
        const type = result.assets[0].type!;
    
        setFileUri(uri);
        setFileName(name);
        setFiletype(type);
        setIsLoading(true);
    
        await dispatch(createRecording({ fileUri: uri, type: 'UPLOADED' })).unwrap();
    
        setIsLoading(false);
      }
  };
  
   const handleLink = async (): Promise<void> => {
        const response = Alert.prompt('Importing From Link', 'please enter the link', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed')
              },
            {
                text: 'submit', onPress: async (link) => {
                    if (link && link?.trim() !== '') {
                        try {
                            await dispatch(importRecordingWithUrl(link)).unwrap();
                            toggleModal()
                            Alert.alert('Recording imported successfully');
                        } catch (err) {
                            Alert.alert('Error importing Recording: ', error!);
                        }
                    }
              }}
        ])
   }
  
  const { recordings, status, error } = useSelector((state: RootState) => state.recordings)
  const { summaries } = useSelector((state: RootState) => state.summaries)
  const { transcripts } = useSelector((state: RootState) => state.transcripts)
  const { translatedTranscripts } = useSelector((state: RootState) => state.translatedTranscripts)
        
  function getLatestItemWithRecording(dataList: any) {
    if (!dataList.length) return null;
    const latest = dataList[dataList.length - 1];
    const recording = recordings.find(r => r.id === latest.recordingId);
    return recording
      ? { ...latest, recordingTitle: recording.title }
      : null;
  }

  const latestSummary = getLatestItemWithRecording(summaries);
  const latestTranscript = getLatestItemWithRecording(transcripts);
  const latestTranslation = getLatestItemWithRecording(translatedTranscripts);
  const latestRecording = recordings[0] || null;
  
  const router = useRouter();

  
  const latestItems = [
  latestRecording && {
    title: latestRecording.title,
    description: 'Latest Recording',
    icon: 'mic-outline',
    action: () => {router.navigate(`/recordings/${latestRecording.id}`)},
  },
  latestTranscript && {
    title: latestTranscript.recordingTitle,
    description: 'Latest Transcript',
    icon: 'document-text-outline',
    action: () => {router.navigate(`/transcripts/${latestTranscript.recordingId}`)},
  },
  latestTranslation && {
    description: 'Latest Translation',
    title: latestTranslation.recordingTitle,
    icon: 'language-outline',
    action: () => { router.navigate(`/translated/${latestTranslation.recordingId}`); },
  },
  latestSummary && {
    description: 'Latest Summary',
    title: latestSummary.recordingTitle,
    icon: 'bulb-outline',
    action: () => { router.navigate(`/summaries/${latestSummary.recordingId}`) },
  },
].filter(Boolean); 

  
   const name = 'Adnan';

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <ThemedView style={styles.container}>
      <Spinner isLoading={status === 'pending'} text={'Loading Recordings'} />
      <Spinner isLoading={isLoading} text={'Uploading Recording'} />
      <ThemedView style={styles.welcomeCard}>
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={styles.welcomeText}>Welcome back,</ThemedText>
          <ThemedText style={styles.userName}>{name}</ThemedText>
        </ThemedView>
        <Image
          source={require('../../profile.png')} 
          style={styles.profileImage}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Your Latest Activity</ThemedText>
          <FlatList
          data={latestItems}
          keyExtractor={(item) => item.description}
          ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          renderItem={({ item }) => (
            <Pressable onPress={item.action}>
              <ThemedView style={styles.card}>
                <ThemedView style={styles.row}>
                  <IconSymbol name={item.icon} size={24} color="#FA2E47" />
                  <ThemedView style={{ marginLeft: 12 , backgroundColor: '#1E1E1E'}} >
                    <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
                    <ThemedText style={styles.cardDescription}>{item.description}</ThemedText>
                  </ThemedView>
                </ThemedView>
                  <IconSymbol size={17} name={"chevron.right"}  color={'#FA2E47'} />
              </ThemedView>
            </Pressable>
          )}
        />
        </ThemedView>
        <ThemedView style={styles.actionCardContainer}>
            <TouchableOpacity style={styles.actionCard} onPress={() => {toggleModal()}}>
             <IconSymbol size={37} name={"icloud.and.arrow.up"}  color={'#FA2E47'} />
              <ThemedText style={styles.actionCardText}>Upload</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => { router.navigate('/(tabs)/record')}}>
             <IconSymbol size={37} name={"microphone"}  color={'#FA2E47'} />
              <ThemedText style={styles.actionCardText}>Record</ThemedText>
            </TouchableOpacity>
        </ThemedView>
      </ThemedView>
      <Modal
              animationType="slide"
              transparent={true}
              visible={isModalVisible}
              onRequestClose={toggleModal}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <TouchableOpacity style={styles.modalOption} onPress={async () => { await handleLink(); }}>
                    <IconSymbol size={37} name={"link"}  color={'#FA2E47'} />
                    <ThemedText style={styles.modalText}>Link</ThemedText>
                  </TouchableOpacity>
      
                  <TouchableOpacity style={styles.modalOption} onPress={async () => { await pickImage();  }}>
                    <IconSymbol size={37} name={"play.rectangle"}  color={'#FA2E47'} />
                    <ThemedText style={styles.modalText}>Video or Audio</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
    </SafeAreaView>
  );
  
}
const styles =  StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    
  },
  separator: {
    height: 12,
  },

  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  welcomeText: {
    backgroundColor: '#1E1E1E',
    fontSize: 16,
    color: '#FFFFFF',
  },
  userName: {
    backgroundColor: '#1E1E1E',
    fontSize: 22,
    color: '#FA2E47',
    fontWeight: 'bold',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 12,
  },

  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FA2E47',
    fontWeight: 'bold',
    marginBottom: 12,
  },

  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E'
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cardDescription: {
    color: 'gray',
    fontSize: 14,
    marginTop: 2,
  },
  actionCardContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 30,
  paddingHorizontal: 10,
},

actionCard: {
  flex: 1,
  alignItems: 'center',
  backgroundColor: '#1E1E1E',
  paddingVertical: 20,
  marginHorizontal: 8,
  borderRadius: 12,
},

actionCardText: {
  color: 'white',
  fontSize: 14,
  marginTop: 8,
  fontWeight: '500',
  },

modalOverlay: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},

modalContainer: {
  backgroundColor: '#1E1E1E',
  padding: 20,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  flexDirection: 'row',
  justifyContent: 'space-around',
},

modalOption: {
  alignItems: 'center',
},

modalIcon: {
  width: 40,
  height: 40,
  marginBottom: 8,
},

modalText: {
  color: 'white',
  fontSize: 14,
},

chooseButton: {
  backgroundColor: '#FA2E47',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignSelf: 'center',
  marginTop: 20,
},

chooseButtonText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 16,
},  
});
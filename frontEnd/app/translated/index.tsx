import { Image, StyleSheet, Platform, ScrollView, FlatList, View, Appearance, Button, Alert, TouchableHighlight, Pressable, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useNavigation, useRouter } from 'expo-router';
import Spinner from '@/components/Spinner';
import { Recording } from '../../types/types';
import { useDispatch, useSelector } from 'react-redux';
import { createRecording, fetchRecordings } from '@/store/slices/recordingsSlice';
import { AppDispatch, RootState } from '@/store/store';
import { fetchTranscripts } from '@/store/slices/transcriptsSlice';
import { timeFormat } from '@/util/timeFormat';



export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation();
  const router = useRouter()
  const colorScheme = Appearance.getColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const dispatch = useDispatch<AppDispatch>();

  const { recordings, status, error } = useSelector((state: RootState) => state.recordings)
  
  const { translatedTranscripts } = useSelector((state: RootState) => state.translatedTranscripts)
  
  const ids = new Set(translatedTranscripts.map(t => t.translatedTranscriptId))

  const filteredRecordings = recordings.filter(r => ids.has(r.translatedTranscript!))

  const handleClick = (id: string) => {
    router.push(`/translated/${id}`)
  }
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchRecordings());
      dispatch(fetchTranscripts());
    }

  }, [dispatch])

  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;
  return (
    <ThemedView style={styles.container}>
      <Spinner isLoading={status === 'pending' ? true : false} text={'Loading Recordings'} />
      <Spinner isLoading={isLoading} text={'Uploading Recording'} />
      <Container style={{ flex: 1 }}>
        {filteredRecordings && filteredRecordings.length > 0 ? (
          <FlatList
            data={filteredRecordings}
            keyExtractor={(recording) => recording.id.toString()}
            renderItem={({ item }) => (
              <Pressable onPress={() => handleClick(item.id!.toString())} onLongPress={() => Alert.prompt('Are you sure you want to delete?')}>
                <ThemedView style={styles.recordingContainer}>
                  <ThemedText style={styles.recordingTitle}>
                    {item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title}
                  </ThemedText>
                  <View style={styles.recordingInfo}>
                    <ThemedText style={{ color: '#8E8E93' }}>
                      {item.recordedDate.replace('T', ' ').slice(0, -3)}
                    </ThemedText>
                    <ThemedText style={{ color: '#8E8E93' }}>
                      {timeFormat(item.duration)}
                    </ThemedText>
                  </View>
                </ThemedView>
              </Pressable>
            )}
          />
        ) : (
          <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>
            No translation found
          </ThemedText>
        )}
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

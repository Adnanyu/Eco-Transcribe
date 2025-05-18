import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import React, { useEffect, useState } from "react";
import { Recording, Transcript, TranslatedTranscript } from "../../types/types";
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import DropDown from "@/components/Dropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteTranscriptAsync } from "@/store/slices/transcriptsSlice";
import Spinner from "@/components/Spinner";
import { deleteTranslatedTranscriptAsync } from "@/store/slices/translatedSlice";




export default function Transcripts() {
    const { id } = useLocalSearchParams();
    const { translatedTranscripts, status, error } = useSelector((state: RootState) => state.translatedTranscripts);
    console.log('translated is: ', translatedTranscripts);
    const translatedTranscriptt = translatedTranscripts.find(translatedTranscript => translatedTranscript.recordingId.toString() === id?.toString())
    console.log(translatedTranscriptt);
    const recordings = useSelector((state: RootState) => state.recordings.recordings.find(recording => recording.translatedTranscript?.toString() === translatedTranscriptt?.recordingId.toString()))
    const [translatedTranscript, setTranslatedTranscript] = useState<TranslatedTranscript>(translatedTranscriptt!)
    const [recording, setRecording] = useState<Recording>(recordings!);
    const router = useRouter();
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        // const fetchTranscript = async () => {
        //     try {
        //         const transcript: Transcript = await getTranscript(id.toString());
        //         setTranscript(transcript);
        //     } catch (error) {
        //         console.error('Error fetching recordings:', error);
        //     }
        // };
        
        // fetchTranscript();
        setTranslatedTranscript(translatedTranscriptt!);
    }, [translatedTranscriptt])

    const handleDeleteTranscript = async (translatedTranscript: TranslatedTranscript): Promise<boolean> => {
        try {
            await dispatch(deleteTranslatedTranscriptAsync(translatedTranscript)).unwrap();
            Alert.alert('Translated Transcript Deleted successfully');
            return true
            // router.push(`/transcripts/${recording.id}`);
            // router.navigate('/(tabs)/recordings')
        } catch (err) {
            Alert.alert('Error Deleting Transcript: ', error!);
            return false
        }
    }

    const dropDownMenus = [
            {
                label: 'Edit Transcript',
                action: async () => { router.push(`/translated/edit/${translatedTranscript?.recordingId}`) },
                icon: 'pencil.line'
            },
            {
                label: 'Delete Transcript',
                action: async () => {
                    const success = await handleDeleteTranscript(translatedTranscript)
                    if(success) navigation.goBack()
                },
                icon: 'trash'
            },
            {
                label: 'Export Transcript',
                action: async () => {}  ,
                icon: 'arrow.up.document'
        },
        // {
        //     label: 'Ask The Bot',
        //     action: async () => { router.push('/chat/chat')}  ,
        //     icon: 'message.badge.waveform'
        // } 
            
        ]

    // const dropDownMenus = {
    //     'Edit Transcript': () => { router.push(`/transcripts/edit/${transcript?.transcriptId}`) },
    //     'Delete Transcript': () => { deleteTrancript(id.toString()) },
    //     'Export Transcript': () => {}  
    // }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Spinner isLoading={status === 'pending' ? true: false} text={'Deleting Translated Transcript'} />
            <ThemedView style={styles.container}>
                <ScrollView style={{ padding: 13 }}>
                    <ThemedView style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                        <View>
                            <ThemedText style={{paddingBottom: 10}}>
                                {/* {recording?.title}, {recording?.duration} */}
                                Recording Title: {recording?.title}
                                Recorded Date: {recording?.recordedDate.replace('T', ' ')}
                            </ThemedText>
                        </View>
                        <DropDown menus={dropDownMenus} />
                    </ThemedView>
                    {/* <ThemedText>transcripts of id: {id}</ThemedText> */}
                    <ThemedText style={styles.longText}>{translatedTranscript && translatedTranscript?.text!}</ThemedText>
                </ScrollView>
            </ThemedView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    longText: {
      fontSize: 16,
      lineHeight: 24,
    },
  });
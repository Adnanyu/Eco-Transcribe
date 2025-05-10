import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import React, { useEffect, useState } from "react";
import { Recording, Transcript } from "../types/types";
import { deleteTrancript, getTranscript, updateTranscript } from "../api/api";
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import DropDown from "@/components/Dropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteTranscriptAsync } from "@/store/slices/transcriptsSlice";
import Spinner from "@/components/Spinner";




export default function Transcripts() {
    const { id } = useLocalSearchParams();
    const { transcripts, status, error } = useSelector((state: RootState) => state.transcripts);
    const transciptt = transcripts.find(transcript => transcript.recordingId.toString() === id.toString())
    const recordings = useSelector((state: RootState) => state.recordings.recordings.find(recording => recording.transcript?.toString() === transciptt?.transcript_id.toString()))
    const [transcript, setTranscript] = useState<Transcript>(transciptt!)
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
        setTranscript(transciptt!);
    }, [transciptt])

    const handleDeleteTranscript = async (transcript: Transcript): Promise<void> => {
        try {
            await dispatch(deleteTranscriptAsync(transcript)).unwrap();
            Alert.alert('Transcript Deleted successfully');
            navigation.goBack;
        } catch (err) {
            Alert.alert('Error Deleting Transcript: ', error!);
        }
    }

    const dropDownMenus = [
            {
                label: 'Edit Transcript',
                action: () => { router.push(`/transcripts/edit/${transcript?.recordingId}`) },
                icon: 'pencil.line'
            },
            {
                label: 'Delete Transcript',
                action: () => { handleDeleteTranscript(transcript) },
                icon: 'trash'
            },
            {
                label: 'Export Transcript',
                action: () => {}  ,
                icon: 'arrow.up.document'
            },
            {
                label: 'Translate Transcript',
                action: () => {}  ,
                icon: 'text.badge.plus'
            },
            {
                label: 'Ask The Bot',
                action: () => { router.push('/chat/chat')}  ,
                icon: 'message.badge.waveform'
            } 
            
        ]

    // const dropDownMenus = {
    //     'Edit Transcript': () => { router.push(`/transcripts/edit/${transcript?.transcript_id}`) },
    //     'Delete Transcript': () => { deleteTrancript(id.toString()) },
    //     'Export Transcript': () => {}  
    // }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Spinner isLoading={status === 'pending' ? true: false} text={'Deleting Transcript'} />
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
                    <ThemedText style={styles.longText}>{transcript && transcript?.text!}</ThemedText>
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
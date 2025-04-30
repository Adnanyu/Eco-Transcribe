import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useState } from "react";
import { Transcript } from "../types/types";
import { deleteTrancript, getTranscript, updateTranscript } from "../api/api";
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native'
import DropDown from "@/components/Dropdown";




export default function Transcripts() {
    const [transcript, setTranscript] = useState<Transcript>()
    const { id } = useLocalSearchParams();
    const router = useRouter()
    useEffect(() => {
        const fetchTranscript = async () => {
            try {
                const transcript: Transcript = await getTranscript(id.toString());
                setTranscript(transcript); 
            } catch (error) {
                console.error('Error fetching recordings:', error);
            }
        };
        
        fetchTranscript();
        
    }, [])

    const dropDownMenus = [
            {
                label: 'Edit Transcript',
                action: () => { router.push(`/transcripts/edit/${transcript?.recordingId}`) },
                icon: 'pencil.line'
            },
            {
                label: 'Delete Transcript',
                action: () => { deleteTrancript(id.toString()) },
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
        <SafeAreaView style={{ flex: 1}}>
            <ThemedView style={styles.container}>
                <ScrollView style={{ padding: 13 }}>
                    <ThemedView style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                        <ThemedText>
                            {/* {recording?.title}, {recording?.duration} */}
                            transcripts of id: {id}
                        </ThemedText>
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
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import React, { useEffect, useState } from "react";
import { Recording, Summary, Transcript } from "../../types/types";
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import DropDown from "@/components/Dropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteTranscriptAsync } from "@/store/slices/transcriptsSlice";
import Spinner from "@/components/Spinner";
import { deleteSummaryAsync } from "@/store/slices/summariesSlice";




export default function SummaryPage() {
    const { id } = useLocalSearchParams();
    const { summaries, status, error } = useSelector((state: RootState) => state.summaries);
    console.log(summaries)
    const summaryy = summaries.find(summary => summary.recordingId.toString() === id.toString())
    const recordings = useSelector((state: RootState) => state.recordings.recordings.find(recording => recording.id.toString() === summaryy?.recordingId.toString()))
    const [summary, setSummary] = useState<Summary>(summaryy!)
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
        setSummary(summaryy!);
    }, [summaryy])

    const handleDeleteSummary = async (summary: Summary): Promise<boolean> => {
        try {
            await dispatch(deleteSummaryAsync(summary)).unwrap();
            // navigation.goBack();
            Alert.alert('Summary Deleted successfully');
            return true
        } catch (err) {
            Alert.alert('Error Deleting Transcript: ', error!);
            return false
        }
    }

    const dropDownMenus = [
            {
                label: 'Edit Summary',
                action: async () => { router.push(`/summaries/edit/${summary?.recordingId}`) },
                icon: 'pencil.line'
            },
            {
                label: 'Delete Summary',
                action: async () => {
                    const success = await handleDeleteSummary(summary);
                    if (success) navigation.goBack();
                },
                icon: 'trash'
            },
            {
                label: 'Export Summary',
                action: async () => {}  ,
                icon: 'arrow.up.document'
        },
        ]

    // const dropDownMenus = {
    //     'Edit Transcript': () => { router.push(`/transcripts/edit/${transcript?.transcriptId}`) },
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
                    <ThemedText style={styles.longText}>{summary && summary?.text!}</ThemedText>
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
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import React, { useEffect, useState } from "react";
import { Recording, Summary, Transcript } from "../../../types/types";
import { Alert, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Text} from 'react-native'
import DropDown from "@/components/Dropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteTranscriptAsync } from "@/store/slices/transcriptsSlice";
import Spinner from "@/components/Spinner";
import { deleteSummaryAsync, updateSummaryAsync } from "@/store/slices/summariesSlice";




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
        // setSummary(summaryy!);
    }, [summaryy])

    const handleSave = async (summary: Summary): Promise<boolean> => {
        try {
            await dispatch(updateSummaryAsync(summary)).unwrap()
            Alert.alert('Summary Updated Successfully')
            return true
        } catch (error) {
            Alert.alert('Error Updating Summary')
            return false
        }
    }

    useEffect(() => { 
                navigation.setOptions({
                    headerRight: () => (
                        <TouchableOpacity onPress={async () => {
                            // handleSave()
                            // updateTranscript(transcript!);
                            // handleSave(transcript!);
                            // if (response === 201) {
                            //     router.push(`/recordings/${id}`)
                            // }
                            const success = await handleSave(summary);
                            if(success) navigation.goBack()
                            
                      }} style={{ paddingHorizontal: 15, paddingVertical: 5 }}>
                        <Text style={{ color: '#FA2E47', fontSize: 16 }}>Save</Text>
                      </TouchableOpacity>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => { router.back() }}>
                            <Text style={{ color: '#FA2E47', fontSize: 16 }}>Cancel</Text>
                        </TouchableOpacity>
                    )
                  });
            },[summary])


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
                    </ThemedView>
                    {/* <ThemedText>transcripts of id: {id}</ThemedText> */}
                    {/* <ThemedText style={styles.longText}>{summary && summary?.text!}</ThemedText> */}
                    <TextInput style={{color: 'white'}} value={summary && summary.text!} onChangeText={(value)=> setSummary((prev) => ({...prev, text: value}))}  multiline editable/>
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
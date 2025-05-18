import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useLocalSearchParams, useNavigation } from "expo-router"
import React, { useEffect, useState } from "react";
import { Transcript, TranslatedTranscript } from "../../../types/types";
import { SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, Text, Alert, AppState } from 'react-native'
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { updateTranscriptAsync } from "@/store/slices/transcriptsSlice";
import Spinner from "@/components/Spinner";
import { updateTranslatedTranscriptAsync } from "@/store/slices/translatedSlice";




export default function Transcripts() {
    const { id } = useLocalSearchParams();
    const translatedTranscriptt = useSelector((state: RootState) => state.translatedTranscripts.translatedTranscripts.find(translatedTranscript => translatedTranscript.recordingId.toString() === id.toString()));
    const [translatedTranscript, setTranslatedTranscript] = useState<TranslatedTranscript>(translatedTranscriptt!)
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>()
    
    const {status, error} = useSelector((state: RootState) => state.transcripts)
    
    const handleSave = async (translatedTranscript: TranslatedTranscript):Promise<void> => {
        try {
            await dispatch(updateTranslatedTranscriptAsync(translatedTranscript));
            Alert.alert('Transcript Edited Succesfuly');
            navigation.goBack();
        } catch (e) {
            Alert.alert('Something Went Wrong Editing Transcript', error?.toString());
        }
    }
    
    useEffect(() => {
        // const fetchTranscript = async () => {
        //     try {
        //         const transcript: Transcript = await getTranscript(id.toString());
        //         setTranscript(transcript); 
        //         console.log('id is: ', id);
        //         console.log('trnascript object is: ', transcript)
        //     } catch (error) {
        //         console.error('Error fetching recordings:', error);
        //     }
        // };
        
        // fetchTranscript();
        
    }, [])
    useEffect(() => { 
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity onPress={() => {
                        // handleSave()
                        // updateTranscript(transcript!);
                        handleSave(translatedTranscript!);
                        console.log('transcript: ', translatedTranscript)
                        // if (response === 201) {
                        //     router.push(`/recordings/${id}`)
                        // }
                  }} style={{ paddingHorizontal: 15, paddingVertical: 5 }}>
                    <Text style={{ color: '#FA2E47', fontSize: 16 }}>Save</Text>
                  </TouchableOpacity>
                ),
                headerLeft: () => (
                    <TouchableOpacity onPress={() => { navigation.goBack() }}>
                        <Text style={{ color: '#FA2E47', fontSize: 16 }}>Cancel</Text>
                    </TouchableOpacity>
                )
              });
        },[translatedTranscript])
    console.log(translatedTranscript)

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Spinner isLoading={status === 'pending' ? true : false} text={'Updating Transcript'} />
            <ThemedView style={styles.container}>
                <ScrollView style={{ padding: 13 }}>
                    <ThemedView style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                        <ThemedText>
                            {/* {recording?.title}, {recording?.duration} */}
                            transcripts of id: {id}
                        </ThemedText>
                    </ThemedView>
                    {/* <ThemedText>transcripts of id: {id}</ThemedText> */}
                    {/* <ThemedText style={styles.longText}>{transcript && transcript?.text!}</ThemedText> */}
                    <TextInput style={{color: 'white'}} value={translatedTranscript && translatedTranscript?.text!} onChangeText={(value)=> setTranslatedTranscript((prev) => ({...prev, text: value}))}  multiline editable/>
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
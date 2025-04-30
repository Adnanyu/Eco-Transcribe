import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useLocalSearchParams, useNavigation } from "expo-router"
import React, { useEffect, useState } from "react";
import { Transcript } from "../../types/types";
import { deleteTrancript, getTranscript, updateTranscript } from "../../api/api";
import { SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native'




export default function Transcripts() {
    const [transcript, setTranscript] = useState<Transcript>()
    const { id } = useLocalSearchParams();
    const navigation = useNavigation();
    
    useEffect(() => {
        const fetchTranscript = async () => {
            try {
                const transcript: Transcript = await getTranscript(id.toString());
                setTranscript(transcript); 
                console.log('id is: ', id);
                console.log('trnascript object is: ', transcript)
            } catch (error) {
                console.error('Error fetching recordings:', error);
            }
        };
        
        fetchTranscript();
        
    }, [])
    useEffect(() => { 
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity onPress={() => {
                        // handleSave()
                        updateTranscript(transcript!);
                        console.log('transcript: ', transcript)
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
        },[transcript])
    console.log(transcript)

    return (
        <SafeAreaView style={{ flex: 1}}>
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
                    <TextInput style={{color: 'white'}} value={transcript && transcript?.text!} onChangeText={(value)=> setTranscript((prev) => ({...prev, text: value}))}  multiline editable/>
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
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import { View, StyleSheet, Pressable, Platform, ScrollView, SafeAreaView, FlatList, Dimensions, TextInput, Alert } from "react-native";

import {
    Text,
    Image,
    TouchableOpacity,
} from 'react-native';
import { Recording, Segments, Transcript } from "../../types/types";
import { getRecording, getSegments, getTranscript, updateRecording, updateTranscript } from "../../api/api";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { updateRecordingAsync } from "@/store/slices/recordingsSlice";
import Spinner from "@/components/Spinner";


const FlatListHeader = ({handleSectionChange}: {handleSectionChange: (section: string) => void}) => {
    return (
        <View style={styles.buttonWrapper}>
            <Pressable onPress={() => handleSectionChange('segments')} >
                <View style={styles.buttons}>
                    <Text style={[{ color: 'white' }]}>
                        Segments
                    </Text>
                </View>
            </Pressable>

            <Pressable onPress={() => handleSectionChange('transcripts')} >
                <View style={styles.buttons}>
                    <Text style={[{ color: 'white' }]}>
                        Transcript
                    </Text>
                </View>
            </Pressable>
        </View>
    )
}

const TranscripComp = ({ text, mode, setTranscript }: { text: string, mode: 'edit' | 'view', setTranscript?: Dispatch<SetStateAction<Transcript | undefined>>}) => {
    return (
        <View>
            <TextInput style={styles.transcriptText} value={text} editable={ mode === 'edit' ? true : false} onChangeText={(value)=> setTranscript((prev) => ({...prev, text: value}))}  multiline/>
        </View>
    )
}

export default function RecordingDetail() {
    const { id } = useLocalSearchParams();
    const recordingg = useSelector((state: RootState) => state.recordings.recordings.find(recording => recording.id.toString() === id.toString()));
    const [recording, setRecording] = useState<Recording>(recordingg!);
    const [segments, setSegments] = useState<Segments[]>([]); 
    const [transcript, setTranscript] = useState<Transcript>(); 
    const [selectedItem, setSelectedItem] = useState({}); 
    const segmentRef = useRef<FlatList>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(1)
    const [textContent, setTextContent] = useState<string>('segments')
    console.log(transcript)

    const { status, error } = useSelector((state: RootState) => state.recordings)
    
    const navigation = useNavigation();
    const router = useRouter();
    
    console.log(recording)
    
    const dispatch = useDispatch<AppDispatch>();
    const handleSectionChange = (current: string): void => {
        // setTextContent((prev) => (prev === 'segment' ? 'segment' : 'transcript'))
        // current === 'segments' ? setTextContent('transcript') : setTextContent('segments')
        setTextContent(current)
        console.log(textContent)
    }

    // const handleSave = async () => {
    //     try {

    //         updateRecording(recording!);
    //         updateTranscript(transcript!);
    //         // router.push(`/recordings/${id}`); 
            
    //     } catch (error) {
    //       console.error('Error during save operation:', error);

    //     }
    // };
    
    const handleSave = async (recording: Recording):Promise<void>  => {
        try {
            await dispatch(updateRecordingAsync(recording!)).unwrap();
            Alert.alert('Recording updated successfully');
            navigation.goBack();
        } catch (err) {
          Alert.alert('Error during save operation:');
        }
      };
    
    
    useEffect(() => {
        const fetchApis = async () => {
            try {
                  console.log('id is: ', typeof(id.toString()))
                // const recording: Recording = await getRecording(id.toString());
                const segments: Segments[] = await getSegments(id.toString());
                const transcript: Transcript  = await getTranscript(id.toString());
                // setRecording(recording); 
                setSegments(segments); 
                setTranscript(transcript); 
                console.log(recording?.title)
              } catch (error) {
                console.error('Error fetching recordings:', error);
              }
            };
        fetchApis()
        
        
    }, [])
    useEffect(() => { 
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    // handleSave()
                    // updateRecording(recording!);
                    // await dispatch(updateRecordingAsync(recording!)).unwrap();
                    handleSave(recording!)

                    // updateTranscript(transcript!);
                    console.log('recording: ', recording)
                    console.log('transcript: ', transcript)
                    // if (response === 201) {
                    //     router.push(`/recordings/${id}`)
                    // }
              }} style={{ paddingHorizontal: 15, paddingVertical: 5 }}>
                <Text style={{ color: '#FA2E47', fontSize: 16 }}>Save</Text>
              </TouchableOpacity>
            ),
          });
    },[recording, transcript])

    const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;
    return (
        <View >
            <Spinner isLoading={status === 'pending' ? true : false} text={"Updating Recording"} />
            <View >
                <TextInput style={styles.TitleInput} value={recording?.title.toString()} onChangeText={(value) => setRecording((prev => ({...prev, title: value})))} />
            </View>
            {/* <Text style={{backgroundColor: 'white'}}>{ selectedIndex }</Text> */}
            <FlatListHeader handleSectionChange={ handleSectionChange } />
            <Container style={styles.segmentContainer}>

            {
                    textContent !== 'segments' ? (
                        <TranscripComp text={transcript?.text!} mode={'edit'} setTranscript={setTranscript} />
                    ) : (
                        segments && (
                            <FlatList
                                ref={segmentRef}
                                data={segments}
                                keyExtractor={(segment) => segment.id.toString()}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={async () => {
                                            setSelectedIndex(item.id + 1);
                                            setSelectedItem(item);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.segmentText
                                            ]}
                                        >
                                            {item.text.trim()}
                                        </Text>
                                    </Pressable>
                                )}
                                // getItemLayout={(data, index) => ({
                                //     length: 40, // height of each item (adjust as necessary)
                                //     offset: 100 * index, // offset of each item (adjust as necessary)
                                //     index,
                                // })}
                                contentContainerStyle={{ paddingBottom: 100 }}
                            />
                        )
                    )
                }
            </Container>
            

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 10,
        color: 'red',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    //new styles
    slider: {
        marginTop: -12,
      },
      scrollContainer: {
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 16,
      },
      track: {
        height: 2,
        borderRadius: 1,
      },
      thumb: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'white',
      },
      text: {
        color: 'rgba(255, 255, 255, 0.72)',
        fontSize: 12,
        textAlign: 'center',
    },
    segmentContainer: {
        color: 'red',
        backgroundColor: '#282828',
        padding: 50,
    },
    segmentText: {
        // color: '#DEDEDE',
        color: '#666666',
        paddingVertical: 30,
        paddingHorizontal: 15,
        fontSize: 30,
        fontWeight: '700'
    },
    buttons: {
        fontSize: 20,
        borderRadius: 10,
        color: 'red',
        backgroundColor: '#282828',
        width: 200,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center', 
        marginHorizontal: 4,
    },
    buttonWrapper: {
        // alignItems: 'center',
        // borderRadius: 5,
        // marginHorizontal: 4,
        // paddingVertical: 9,
        // flex: 1, // takes up 50% of the space when there are two
        // margin: 5, // optional, for spacing between buttons,
        // color: 'white'
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 4,
        justifyContent: 'center',
    },
    transcriptText: {
        color: 'white',
        fontSize: 22
    },
    TitleInput: {
        backgroundColor: '#1c1c1f',
        color: 'white',
        borderColor: "gray",
        width: '100%',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
    }
})


// import { ThemedText } from "@/components/ThemedText";
// import { SafeAreaView } from "react-native";

// export default function User() {
//     return (
//       <SafeAreaView>
//           <ThemedText>hello world from edit page</ThemedText>
//       </SafeAreaView>
//   );
// }
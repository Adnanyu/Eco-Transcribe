import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { Button, View, StyleSheet, Pressable, Platform, ScrollView, SafeAreaView, FlatList, Dimensions, TextInput } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { timeFormat } from "../util/timeFormat";


  import React, { Component } from 'react';

import {
    Text,
    Image,
    TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Recording, Segments, Transcript } from "../types/types";
import { getRecording, getSegments, getTranscript } from "../api/api";

const screenHeight = Dimensions.get('window').height;

const FlatListHeader = ({ handleSectionChange }: { handleSectionChange: (section: string) => void }) => {
    useEffect(() => {
        handleSectionChange('segments')
      }, []);
    return (
        <View style={styles.buttonWrapper}>
        <Pressable onPress={() => handleSectionChange('segments')}>
            <View style={styles.buttons}>
            <Text style={{color: 'white'}}>
                Segments
            </Text>
            </View>
        </Pressable>

        <Pressable onPress={() => handleSectionChange('transcripts')}>
            <View style={styles.buttons}>
            <Text style={{color: 'white'}}>
                Transcript
            </Text>
            </View>
        </Pressable>
        </View>
    )
}

const TranscripComp = ({ text, mode }: { text: string, mode: 'edit' | 'view' }) => {
    // console.log(text.length)
    return (
        <View>
            {text && text.trim().length <= 0 ? (<Text style={{color: 'white'}}>you dont have transcript yet</Text>)
                :  
                (<TextInput style={styles.transcriptText} value={text} editable={ mode === 'edit' ? true : false} multiline/>)
                }
        </View>
    )
}

export default function RecordingDetail() {
    const [recording, setRecording] = useState<Recording>();
    const { id } = useLocalSearchParams();
    const [sound, setSound] = useState<Sound>();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0); 
    const [segments, setSegments] = useState<Segments[]>([]); 
    const [transcript, setTranscript] = useState<Transcript>(); 
    const [isSeeking, setIsSeeking] = useState(false); 
    const [selectedItem, setSelectedItem] = useState({}); 
    const segmentRef = useRef<FlatList>(null);
    const [selectedIndex, setSelectedIndex] = useState<number>(1)
    const [textContent, setTextContent] = useState<string>('segments')

    const [itemHeights, setItemHeights] = useState({});

    const navigation = useNavigation();
    const router = useRouter()

    const onItemLayout = (event: { nativeEvent: { layout: { height: any; }; }; }, index: any) => {
        const { height } = event.nativeEvent.layout;
        setItemHeights((prev) => ({
          ...prev,
          [index]: height,
        }));
      };

    
    const playSound = async () => {
        console.log('loading sound');
        const { sound, status  } = await Audio.Sound.createAsync({
            uri: recording?.recordingUrl!
        })
        setSound(sound);
        console.log('Playing Sound');
        sound.setPositionAsync(position)
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate(onPlayBackStatusUpdate);
        setDuration(recording?.duration!);
        setIsPlaying(true)
    }
    const stopSound = async () => {
        await sound?.setPositionAsync(position);
        await sound?.pauseAsync()
        setIsPlaying(false)
    }

  

    const onPlayBackStatusUpdate = (status: any) => {
        if (status.isPlaying) {
            setPosition(status.positionMillis);
        }
        if (status.didJustFinish) {
            setIsPlaying(false);
          }
    }

    const handleSeek = async (value: number) => {
        if (sound) {
            setIsSeeking(true);
            await sound.setPositionAsync(value*1000)
            setPosition(value)
            setIsSeeking(false)
        }
    }

    const rewind = async (seconds: number):Promise<void> => {
        if (sound) {
            const newPosition = Math.max(position - seconds * 1000, recording?.duration!);
            await sound.setPositionAsync(newPosition)
        }
    }
    const skip = async (seconds: number): Promise<void> => {
        if (sound) {
            const newPosition = Math.max(position + seconds * 1000, 0);
            await sound.setPositionAsync(newPosition)
        }
    }

    const JumpToSegment = async (start: number): Promise<void> => {
        if (sound) {
            await sound.setPositionAsync(Math.round(start * 1000 ) + 1);
        }
    }

    const logPosition = (value: number) => {
        console.log("value:", value)
        console.log("position: " + position)
        setPosition(position)
    }

   
  

    const handleSectionChange = (current: string): void => {
        // setTextContent((prev) => (prev === 'segment' ? 'segment' : 'transcript'))
        // current === 'segments' ? setTextContent('transcript') : setTextContent('segments')
        setTextContent(current)
        console.log(textContent)
    }
    const centerSegment = () => {
        if (segmentRef.current) {
            segmentRef.current.scrollToIndex({
                index: selectedIndex,
                animated: true,
                viewPosition:0.5
           })
       }
   }
      
      

    const elapsed = timeFormat(position/1000);
    const remaining = '-' + timeFormat(recording?.duration! - position/1000)

    useEffect(() => {
        const fetchApis = async () => {
            try {
                  console.log('id is: ', typeof(id.toString()))
                const recording: Recording = await getRecording(id.toString());
                const segments: Segments[] = await getSegments(id.toString());
                const transcript: Transcript | string = await getTranscript(id.toString());
                setRecording(recording); 
                setSegments(segments); 
                setTranscript(transcript); 
              } catch (error) {
                console.error('Error fetching recordings:', error);
              }
            };
            fetchApis()
        return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
        
    }, [])

    useEffect(() => { 
        navigation.setOptions({
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => {router.push(`/recordings/edit/${id}`)}} // Navigate to explore page
                  style={{
                    paddingHorizontal: 15, 
                    paddingVertical: 15, 
                  }}
                >
                  <ThemedText style={{ color: '#FA2E47', fontSize: 16 }}>Edit</ThemedText>
                </TouchableOpacity>
              </View>
            ),
        })
    }, [])


    useEffect(() => {
        if (segmentRef.current && segments.length > 0) {
            console.log(selectedIndex)
            // segmentRef.current.scrollToIndex({
            //     index: selectedIndex,
            //     animated: true,
            //     viewPosition: 0.5, // 👈 puts the item in the center
            // });
            segmentRef.current.scrollToItem({
                animated: true,
                item: selectedItem
            });
            // params: {
            //     animated?: ?boolean,
            //     item: Item,
            //     viewPosition?: number,
            //   }
       }
    },[position])

    const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;
    return (
        <SafeAreaView>
        <View style={{}}>
            <ThemedText>
                {recording?.title}, {recording?.duration}
            </ThemedText>
            <View style={styles.scrollContainer}>
                <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.text]}>
                    {elapsed}
                </Text>
                <View style={{ flex: 1 }} />
                        <Text style={[styles.text, { width: 40 }]}>
                    {remaining}
                </Text>
                </View>
            <Slider
                style={{ width: '100%', marginTop: 20 }}
                minimumValue={0}
                maximumValue={duration}
                value={position/1000}
                onSlidingComplete={(value) => handleSeek(value)}
                onValueChange={(value) => logPosition(value)}
                disabled={isSeeking} 
                />
            </View>
            <View style={styles.controlsContainer}>
                <Pressable onPress={async () => await rewind(10)}>
                     {/* TODO: fix the icon color when toggled */}
                    <IconSymbol size={35} name={isPlaying ? `10.arrow.trianglehead.counterclockwise` : `10.arrow.trianglehead.counterclockwise`} color={'white'} />
                </Pressable>
                <Pressable onPress={async () => isPlaying ? await stopSound() : await playSound()}>
                     {/* TODO: fix the icon color when toggled */}
                    <IconSymbol size={35} name={isPlaying ? "pause.fill" : "play.fill"} color={'white'} />
                </Pressable>
                <Pressable onPress={async () => await skip(10)}>
                    {/* TODO: fix the icon color when toggled */}
                    <IconSymbol size={35} name={isPlaying ? `10.arrow.trianglehead.clockwise` : `10.arrow.trianglehead.clockwise`} color={'white'} /> 
                </Pressable>
            </View>
            {/* <Text style={{backgroundColor: 'white'}}>{ selectedIndex }</Text> */}
            <FlatListHeader handleSectionChange={ handleSectionChange } />
            <Container style={styles.segmentContainer}>

            {
                    textContent !== 'segments' ? (
                        <TranscripComp text={transcript?.text!} mode={'view'} />
                    ) : (
                                segments && (
                                    <SafeAreaView>
                                        <FlatList
                                            style={{height: '80%'}}
                                ref={segmentRef}
                                data={segments}
                                keyExtractor={(segment) => segment.id.toString()}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={async () => {
                                            await JumpToSegment(item.start);
                                            setSelectedIndex(item.id + 1);
                                            setSelectedItem(item);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.segmentText,
                                                (position / 1000) >= item.start &&
                                                (position / 1000) <= item.end
                                                    ? { color: '#DEDEDE', justifyContent: 'center' }
                                                    : {},
                                            ]}
                                        >
                                            {item.text.trim()}
                                        {(position / 1000) >= item.start &&
                                            (position / 1000) <= item.end
                                                ? setSelectedItem(item)
                                                : ''}
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
                                        </SafeAreaView>
                        )
                    )
                }
            </Container>
            

            </View>
            </SafeAreaView>
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
        marginTop:40,
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 4,
        justifyContent: 'center',
    },
    transcriptText: {
        color: 'white',
        fontSize: 22
    }
})
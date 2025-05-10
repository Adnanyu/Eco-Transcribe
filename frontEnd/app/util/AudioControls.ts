import { Recording } from "../types/types";

export const playSound = async (sound:any, setIsPlaying: (isPlaying: boolean) => void): Promise<void>  => {
        // console.log('loading sound');
        // const { sound, status  } = await Audio.Sound.createAsync({
        //     uri: recording?.recordingUrl!
        // })
        // setSound(sound);
        // console.log('Playing Sound');
        // sound.setPositionAsync(position)
        await sound.playAsync();
        // sound.setOnPlaybackStatusUpdate(onPlayBackStatusUpdate);
        // setDuration(recording?.duration!);
        setIsPlaying(true)
}
    
export const stopSound = async (sound: any, setIsPlaying: (isPlaying: boolean) => void, position: number): Promise<void> => {

    await sound?.setPositionAsync(position);
    await sound?.pauseAsync();
    setIsPlaying(false);
    
    }

  

// export const onPlayBackStatusUpdate = (status: any, setPosition: (positon: number) => void, setIsPlaying: (isPlaying: boolean) => void): void => {
//     if (status.isPlaying) {
//         setPosition(status.positionMillis);
//     }
//     if (status.didJustFinish) {
//         setIsPlaying(false);
//         }
// }

export const handleSeek = async (value: number, sound: any, setIsSeeking: (isSeeking: boolean) => void, setPosition: (positon: number) => void): Promise<void> => {
    if (sound) {
        setIsSeeking(true);
        await sound.setPositionAsync(value * 1000);
        setPosition(value);
        setIsSeeking(false);
    }
}

export const rewind = async (seconds: number, sound:any, position: number, recording: Recording | undefined): Promise<void> => {
    if (sound) {
        const newPosition = Math.max(position - seconds * 1000, recording?.duration!);
        await sound.setPositionAsync(newPosition)
    }
}
export const skip = async (seconds: number, sound:any, position:number): Promise<void> => {
    if (sound) {
        const newPosition = Math.max(position + seconds * 1000, 0);
        await sound.setPositionAsync(newPosition);
    }
}

export const JumpToSegment = async (start: number, sound:any): Promise<void> => {
    if (sound) {
        await sound.setPositionAsync(Math.round(start * 1000 ) + 1);
    }
}
import { Alert } from "react-native";
import * as FileSystem from 'expo-file-system';
import { Recording, Segments, Transcript } from "../types/types";
import axios from "axios";

export const getRecordings = async (): Promise<Recording[]> => {
    try {
        const response = await fetch('http://localhost:8080/api/recordings');
        if (!response.ok) {
            throw new Error('Failed to fetch recordings');
            }
        const data = await response.json();
        return data; 
    } catch (e) {
        console.error(e)
        throw e;
    }
  }

export const getRecording = async (id: string): Promise<Recording> => {
    try {
        const response = await fetch(`http://localhost:8080/api/recordings/${id}`)
        if (!response.ok) {
            throw new Error('Failed to fetch recording');
        }
        const data = await response.json();
        return data; 
    } catch (e) {
        console.log(e)
        throw e;
    }
}

export const getSegments = async (id: string): Promise<Segments[]> => {
    try {
        const response = await fetch(`http://localhost:8080/api/segments/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch segments');
        }
        const data = await response.json();
        return data["segments"];
    } catch (e) {
        console.log(e);
        throw e;
    }
}
export const getTranscript = async (id: string): Promise<Transcript | string> => {
    try {
        const response = await fetch(`http://localhost:8080/api/transcripts/${id}`);
        if (!response.ok) {
            throw new Error('g');
        }
        const data = await response.json();
        return data; 
    } catch (e) {
        console.log(e);
        return ''
    }
}

export const uploadFile = async (fileUri: string | null): Promise<void> => {
    if (!fileUri) {
      Alert.alert('No file selected!');
      return;
    }

    try {
      const response = await FileSystem.uploadAsync('http://localhost:8080/api/recordings/file', fileUri, {
        fieldName: 'file',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      });

      if (response.status === 201) {
        Alert.alert('Upload successful');
      } else {
        Alert.alert('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error uploading file');
    }
};
  
export const updateRecording = async (recording: Recording): Promise<void> => {
    try {
        const response = await axios.put(`http://localhost:8080/api/recordings/${recording.id}`, recording);
        if (response.status == 204) {
            Alert.alert('Recording updated Successfuly');
        } else {
            Alert.alert('updating recording failed');
        }
        
    } catch (e) {
        console.log(e)
        throw e
    }
};

export const updateTranscript = async (transcript: Transcript): Promise<number> => {
    try {
        const response = await axios.put(`http://localhost:8080/api/transcripts/${transcript.recordingId}`, transcript);
        if (response.status == 204) {
            Alert.alert('Transcripts updated Successfuly');
            return response.status
        } else {
            Alert.alert('updating transcript failed');
            return response.status
        }
    } catch (e) {
        console.log(e)
        throw e;
    }
};

export const createTranscript = async (recording: Recording): Promise<void> => {
    try {
        const response = await axios.post(`http://localhost:8080/api/transcripts/${recording.id}`)
        if (response.status === 201) {
            Alert.alert(`transcript is created succesfully for ${recording.title}`)
        } else {
            Alert.alert('createding transcript failed');
        }
    } catch (e){
        console.log(e);
        throw e;
    }
}

export const deleteTrancript = async (TranscriptId: string): Promise<void> => {
    try {
        console.log(`http://localhost:8080/api/transcripts/${TranscriptId}`)
        const response = await axios.delete(`http://localhost:8080/api/transcripts/${TranscriptId}`)
        if (response.status === 204) {
            Alert.alert(`transcript is deleted succesfully for ${TranscriptId}`);
        } else {
            Alert.alert('deleting transcript failed');
        }
    } catch (e){
        console.log(e);
        throw e;
    }
}
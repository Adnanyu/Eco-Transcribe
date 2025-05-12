import { Alert } from "react-native";
import * as FileSystem from 'expo-file-system';
import { Recording, Segments, Summary, Transcript } from "../types/types";
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

export const getTranscripts = async (): Promise<Transcript[]> => {
    try {
        const response = await fetch(`http://localhost:8080/api/transcripts`);
        if (!response.ok) {
            throw new Error('g');
        }
        const data = await response.json();
        return data; 
    } catch (e) {
        console.log(e);
        throw e
    }
}

export const uploadFile = async (fileUri: string | null): Promise<Recording | undefined> => {
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

        if (response.status !== 201) {
            throw new Error(response.toString());
        }
        console.log(response.headers)
        console.log('location is: ', response.headers['Location'])
        const newRecoringResponse = await fetch(response.headers['Location']);
        const data = await newRecoringResponse.json();
        return data; 
    } catch (error) {
      console.error('Error uploading file:');
        Alert.alert('Error uploading file');
        throw error
    }
};
  
export const updateRecording = async (recording: Recording): Promise<number> => {
    try {
        const response = await axios.put(`http://localhost:8080/api/recordings/${recording.id}`, recording);
        return response.status
    } catch (e) {
        console.log(e)
        throw e
    }
};

export const updateTranscript = async (transcript: Transcript): Promise<number> => {
    try {
        const response = await axios.put(`http://localhost:8080/api/transcripts/${transcript.recordingId}`, transcript);
        return response.status
    } catch (e) {
        console.log(e)
        throw e;
    }
};

export const createTranscript = async (recording: Recording): Promise<Transcript> => {
    try {
        const response = await axios.post(`http://localhost:8080/api/transcripts/${recording.id}`)
        if (response.status !== 201) {
            throw new Error(response.toString());
        }
        console.log('location is: ', response.headers.location)
        const transcriptResponse = await fetch(response.headers.location);
        const data = await transcriptResponse.json();
        return data; 
        // console.log(response);
    } catch (e){
        console.log(e);
        throw e;
    }
}

export const deleteTrancript = async (transcript: Transcript): Promise<number> => {
    try {
        const response = await axios.delete(`http://localhost:8080/api/transcripts/${transcript.recordingId}`)
        return response.status
    } catch (e){
        console.log(e);
        throw e;
    }
}

export const getSummaries = async (): Promise<Summary[]> => {
    try {
        const response = await fetch(`http://localhost:8080/api/summaries`);
        if (!response.ok) {
            throw new Error('g');
        }
        const data = await response.json();
        return data; 
    } catch (e) {
        console.log(e);
        throw e
    }
}

export const createSummary = async (recording: Recording): Promise<Summary> => {
    try {
        const response = await axios.post(`http://localhost:8080/api/summaries/${recording.id}`)
        if (response.status !== 201) {
            throw new Error(response.toString());
        }
        console.log('location is: ', response.headers.location)
        const summaryResponse = await fetch(response.headers.location);
        const data = await summaryResponse.json();
        return data; 
        // console.log(response);
    } catch (e){
        console.log(e);
        throw e;
    }
}

export const updateSummary = async (summary: Summary): Promise<number> => {
    try {
        const response = await axios.put(`http://localhost:8080/api/summaries/${summary.recordingId}`, summary);
        return response.status
    } catch (e) {
        console.log(e)
        throw e;
    }
};

export const deleteSummary = async (summary: Summary): Promise<number> => {
    try {
        const response = await axios.delete(`http://localhost:8080/api/transcripts/${summary.recordingId}`)
        return response.status
    } catch (e){
        console.log(e);
        throw e;
    }
}
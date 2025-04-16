import { Alert } from "react-native";
import * as FileSystem from 'expo-file-system';
import { Recording, Segments, Transcript } from "../types/types";

export const getRecordings = async (): Promise<Recording[]> => {
    try {
        const response = await fetch('http://localhost:8080/api/recordings');
        if (!response.ok) {
            throw new Error('Failed to fetch recording');
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
            throw new Error('Failed to fetch recording');
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
            throw new Error('Failed to fetch recording');
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
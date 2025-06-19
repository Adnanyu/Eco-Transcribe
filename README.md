# Eco-Transcribe

Eco Transcribe is a mobile app for recording and uploading audio to make transcript text
of it. This audio of can be from a meeting, class, conversations, personal ideas or even a
video. We all participate in these activities as academics or professionals on a daily basis
and some of us like to take notes to come back and check them later, some of us to make
reports and others to not forget and record our thoughts after a walk to clear our mind or
gain inspiration.

This project is designed to help these kinds of people or even the average user to record
audios and make text transcription of it which they can read later or even export and make
a report of it. Additionally, it will provide live transcription of the audio they record, also
it comes with an AI chat bot powered by Llama LLM that they can ask questions about a
specific audio or all audios in their library. These questions range from simple ones like
which kind of tasks are discussed in the recording to more complex ones such as making
reports from the audio or asking which audio contained which information.

# System Workflow and Data Flow

The architecture consists of five main components: a mobile frontend, a backend built with
Spring Boot, a transcription microservice using FastAPI and OpenAI’s Whisper model, AI
functionality and chat microservice using Llama 3, Cloudinary for cloud-based file storage,
and a hybrid database system using PostgreSQL and MongoDB.
The application workflow begins on the mobile frontend as it shows in figure 4.1, where
users can record or upload audio. The frontend sends a POST request to the backend API,
which receives the file and uploads it to Cloudinary. Cloudinary then returns a URL
pointing to the audio file. This URL is forwarded to the transcription microservice, which
processes the file and returns a full transcript along with segmented portions of the audio
(including timestamps). The backend then saves this data in the appropriate databases and
sends a confirmation response to the client.

This system design allows each component to focus on a specific task, enabling high
scalability and easier maintenance. It also promotes a decoupled architecture, where the
transcription logic is isolated from the main application logic and similarly the AI
functionalities.

<img width="471" alt="image" src="https://github.com/user-attachments/assets/822e0582-3fc8-4fe3-9df9-a51e27f84bd1" />

# React Native for Mobile Application

The mobile application was developed using React Native, allowing for a single codebase
that runs on both Android and iOS platforms. The app interface includes modules for
recording audio, displaying processed text (transcription, summaries, translations), and
viewing the history of past recordings. The Expo framework was initially used to speed up
development and manage dependencies. The audio recording functionality uses the expo-
av library, which provides access to native audio APIs and expo-file-system to select
videos and audios from phone library for uploading.

# State management

To efficiently manage the application's state, Redux Toolkit was integrated. Redux
Toolkit provides a standardized and scalable approach to managing complex application
state, particularly in applications with asynchronous operations and shared data between
components. In this project, it is responsible for handling the state of key features such
as the current recording session, the transcript, generated summaries, and any translations.
Each of these features is organized into separate slices, enabling clean modularization and
easy maintenance of the state logic.
Since the resources are not changing over time and the user being the only entity able to
edit it, continues fetching will be useless and just overload our backend. With the current
approach, when user records a new recording the state gets the relevant transcript, summary
and store it in the state. The same works for editing and deleting across all the resources.
Asynchronous operations, such as backend calls for transcription and AI processing, are
handled using middleware like Redux Thunk, which allows for side effects in action
creators. This architecture ensures a consistent and traceable state flow throughout the
application, supporting better debugging and testing during development.

# Backend Services with Spring Boot

The main backend service is developed using Spring Boot and acts as the central API layer
for user management, audio file metadata storage, and coordination between microservices.
It handles HTTP requests from the mobile client, performs authentication and triggers
requests to the AI and transcription services. This service also manages file uploads and
forwards audio data to Cloudinary storage.
Recordings, transcripts, summaries and translation each have their own class for managing
the database, JDBC repository to manage database and act as ORM and controller for Rest
Api endpoints.

# Transcription microservice

A dedicated FastAPI microservice is responsible for speech recognition. This service uses
OpenAI’s Whisper model to convert audio files into text. Whisper is run as a Python
subprocess within the service, using the whisper Python package and a REST interface for
communication. A request is received from the main backend with the URL of the
recording and then the microservice downloads the audio file from Cloudinary storage,
convert it to temporary wave file and pass it to the Whisper model, processed
asynchronously, and the transcription and segments is sent back to the main backend.

# AI Microservice

Another Spring Boot microservice handles summarization and translation using Meta’s
Llama model. The microservice interfaces with it through a REST API. When triggered,
the service receives the id of the transcript and retrieve the text from the database. This is
to avoid sending large amount of text through Http requests. The microservice performs
the requested AI task (summarization, translation or QA), and sends the output back to the
API service which uses that information and store it with the relevant information.
5.5 Database Integration
The backend uses a hybrid database setup. PostgreSQL is used for structured data such as
recordings, transcriptions, translations and summaries. MongoDB stores unstructured
content like segments of audio and user information. This separation improves
performance and simplifies query design based on the data’s structure.

<img width="432" alt="image" src="https://github.com/user-attachments/assets/d858492a-2f7a-4604-8ce6-ae007bc305f5" style="margin: 100px"/>

<br>


<img width="432" alt="image" src="https://github.com/user-attachments/assets/9f83db96-375a-4c04-a6e1-5b04fff75db0" style="margin: 100px"/>

# Usage


<img width="232" alt="image" src="https://github.com/user-attachments/assets/3b71e70e-0ebc-4753-b225-a8c5f9d14362" style="margin: 100px"/>

<img width="232" alt="image" src="https://github.com/user-attachments/assets/8991f15b-c440-4ce0-92d4-3db7c1801fbe" style="margin: 100px"/>

<img width="232" alt="image" src="https://github.com/user-attachments/assets/7da26f23-6197-4fde-a9f4-53fede3a6947" style="margin: 100px"/>

<img width="232" alt="image" src="https://github.com/user-attachments/assets/25ea0bec-0673-4800-99e4-60f0802b4a0c" style="margin: 100px"/>

<img width="232" alt="image" src="https://github.com/user-attachments/assets/940fea4b-0638-4ffa-9653-200d530af6d5" style="margin: 100px"/>

<img width="232" alt="image" src="https://github.com/user-attachments/assets/aa6fe771-8cef-47c4-9545-64613fb31c7a" style="margin: 100px"/>

<img width="232" alt="image" src="https://github.com/user-attachments/assets/814d4c71-173b-41f2-bea9-f7d8a5e218d4" style="margin: 100px"/>

<img width="232" alt="image" src="https://github.com/user-attachments/assets/deeb1647-3f59-4869-b506-08153a7aa42e" style="margin: 100px"/>


// YOU SHOULD MODIFY THIS OBJECT BELOW
import * as fs from 'fs';

export enum colours {
  RED = 'red', 
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  BROWN = 'brown',
  ORANGE = 'orange',
}

export interface Token {
  sessionId: string;
  userId: number; // Associate a user from a inputted token.
}

export interface User {
  userId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  password: string;
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number,
  ownedQuizzes: number[],
  oldPasswords: string[], // Added a list of old passwords, so we can check the previous passwords of the user
  tokens: Token[], // If we have a user, we can check what token they are assigned.
}
export interface Answer {
  answerId: number;
  answer: string;
  colour: colours;
  correct: boolean;
}
export interface Question {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
}
export interface Quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
  duration: number;
}
export interface AnswerBody {
  answer: string;
  correct: boolean;
}
export interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: AnswerBody[];
}
export interface QuestionToken {
  questionId: number;
  quizId: number;
}
export interface AnswerToken {
  answerId: number;
  questionId: number;
}
// The name for the dataStoreFile
export const dataStoreFile = process.cwd() + '/dataStorage.json';

export interface DataStore {
  users: User[];
  quizzes: Quiz[]; // Quizzes, allows server to generate unique quizId
  tokens: Token[]; // Valid tokens, allows server to search existing tokens.
  questions: QuestionToken[]; // Easy identifiers of question, not to be confused
  answers: AnswerToken[]; // with token.
}

// 
// UserId - Number
// Token - String
// QuizId - Number
// QuestionId - Number
// AnswerId - Number
// 

let data: DataStore = {
  users: [],
  quizzes: [],
  tokens: [],
  questions: [],
  answers: [],
};

// Converts data into JSON and writes it into the dataStorage file
export function setData(newData: DataStore) {
  const serializedData = JSON.stringify(newData, null, 2);
  fs.writeFileSync(dataStoreFile, serializedData);
  data = newData;
}
// Opens the dataStorage JSON file and translates it back into typescript
export function getData(): DataStore {
  // const serializedData = fs.readFileSync(dataStoreFile, 'utf8');
  // return JSON.parse(serializedData);
  return data;
}

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// YOU SHOULD MODIFY THIS OBJECT BELOW
import * as fs from 'fs';
import { NumberLiteralType } from 'typescript';

export const MAX_COLOUR_VAL = 6;

export enum colours {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  BROWN = 'brown',
  ORANGE = 'orange',
}

export type states =
  'LOBBY' |
  'QUESTION_COUNTDOWN' |
  'QUESTION_CLOSE' |
  'QUESTION_OPEN' |
  'ANSWER_SHOW' |
  'FINAL_RESULTS' |
  'END';

export type actions =
  'NEXT_QUESTION' |
  'SKIP_COUNTDOWN' |
  'GO_TO_ANSWER' |
  'GO_TO_FINAL_RESULTS' |
  'END';

export interface Token {
  sessionId: string;
  userId: number; // Associate a user from a inputted token.
}

// Store timeOuts in memory to prevent JSON.stringify errors
export interface NodeJS {
  Timeout: number;
}
export interface timerIDs {
  sessionId: number;
  timeout: NodeJS.Timeout;
}
export interface Timers {
  timeouts: timerIDs[];
}
const Timers: Timers = {
  timeouts: []
};

export const getTimers = (): Timers => Timers;
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
  trash: number[], // Similar to ownedQuizzes, the user has the Ids of all the quizzes in their trash
  tokens: Token[], // If we have a user, we can check what token they are assigned.
}
export interface MessageBody {
  messageBody: string;
}
export interface Message {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number;
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
  thumbnailUrl: string;
  points: number;
  answers: Answer[];
}

export interface Player {
  playerId: number;
  name: string;
  score: number;
  questionResults: PlayerQuestionResults
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
  thumbnailUrl?: string;
}

export interface PlayerQuestionResults {
  questionScore: number[];
  questionRank: number[];
}

export interface SessionQuestionResults {
  questionId: number;
  playersCorrectList: string[];
  AnswersTimes: number[];
}

export interface Session {
  sessionId: number;
  quiz: Quiz;
  players: Player[];
  atQuestion: number;
  state: states;
  questionResults: SessionQuestionResults[];
  autoStartNum: number;
  qnStartTime?: number;
  messages: Message[];
}

export interface AnswerBody {
  answer: string;
  correct: boolean;
}
export interface AnswerToken {
  answerId: number;
  questionId: number;
}
export interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: AnswerBody[];
  thumbnailUrl?: string;
}
export interface QuestionToken {
  questionId: number;
  quizId: number;
}
// The name for the dataStoreFile
export const dataStoreFile = process.cwd() + '/dataStorage.json';

export interface DataStore {
  users: User[];
  quizzes: Quiz[]; // Quizzes, allows server to generate unique quizId
  tokens: Token[]; // Valid tokens, allows server to search existing tokens.
  questions: QuestionToken[]; // Easy identifiers of question, not to be confused
  answers: AnswerToken[]; // with token.
  sessions: Session[];
  players: Player[];
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
  sessions: [],
  players: [],
};

// Converts data into JSON and writes it into the dataStorage file
export function setData(newData: DataStore) {
  const serializedData = JSON.stringify(newData, null, 2);
  fs.writeFileSync(dataStoreFile, serializedData);
  data = newData;
}
// Opens the dataStorage JSON file and translates it back into typescript
export function getData(): DataStore {
  return data;
}

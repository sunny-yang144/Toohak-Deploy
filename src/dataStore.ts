// YOU SHOULD MODIFY THIS OBJECT BELOW
import * as fs from 'fs';

export interface Token {
  sessionId: number;
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
  tokens: Token[], // If we have a user, we can check what token they are assigned.
}
export interface Quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
}
interface Answer {
  answer: string;
  correct: boolean;
}
export interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
}
// The name for the dataStoreFile
export const dataStoreFile = process.cwd() + '/dataStorage.json';
// We need to add array of questions and array of answers Iteration 2 functions
//
/*
"numQuestions": 1,
  "questions": [
    {
      "questionId": 5546,
      "question": "Who is the Monarch of England?",
      "duration": 4,
      "points": 5,
      "answers": [
        {
          "answerId": 2384,
          "answer": "Prince Charles",
          "colour": "red",
          "correct": true
        }
      ]
    }
  ],
  "duration": 44
*/

export interface DataStore {
  users: User[],
  quizzes: Quiz[] // Quizzes, allows server to generate unique quizId
  tokens: Token[] // Valid tokens, allows server to search existing tokens.
}

let data: DataStore = {
  users: [
    // {
    //   userId: 0,
    //   email: 'helloworld@gmail.com',
    //   nameFirst: 'Jack',
    //   nameLast: 'Rizzella',
    //   password: '1234UNSW',
    //   numSuccessfulLogins: 0,
    //   numFailedPasswordsSinceLastLogin: 0,
    //   ownedQuizzes: [],
    //   tokens: [Array]
    // }
  ],
  quizzes: [],
  tokens: [
  // { sessionId: 0, userId: 0 }
  ]
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

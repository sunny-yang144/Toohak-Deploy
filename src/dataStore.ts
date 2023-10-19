// YOU SHOULD MODIFY THIS OBJECT BELOW
import * as fs from 'fs';

export interface User {
  userId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  password: string;
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number,
  ownedQuizzes: number[],
  tokens: Token[],       // If we have a user, we can check what token they are assigned.
}
export interface Quiz {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
}

const dataStoreFile = process.cwd() + '/dataStorage.json';
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

export interface Token {
  sessionId: number;
  userId: number;     // Associate a user from a inputted token.
}

export interface DataStore {
  users: User[],
  quizzes: Quiz[]     // Quizzes, allows server to generate unique quizId
  tokens: Token[]     // Valid tokens, allows server to search existing tokens.
}
// let dataStore: DataStore = {
//   users: [],
//   quizzes: [],
//   tokens: [],
// }

export function setData(data: DataStore) {
  const serializedData = JSON.stringify(data);
  fs.writeFileSync(dataStoreFile, serializedData);
}

export function getData(): DataStore {
  const serializedData = fs.readFileSync(dataStoreFile, 'utf8');
  return JSON.parse(serializedData);
}
// function setData(newData: DataStore) {
//   dataStore = newData;
// }

// export const getData = (): DataStore => dataStore;
// export {setData};


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


import { getData, setData, User, Quiz } from './dataStore'
import { generateQuizId } from './other'

interface ErrorObject {
  error: string;
  statusCode: number;
}
interface quizObject {
  quizId: number;
  name: string;
}

interface adminQuizListReturn {
  quizzes: quizObject[];
}
interface adminQuizCreateReturn {
  quizId: number
}
interface adminQuizInfoReturn {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
}
interface adminQuizRemoveReturn {}
interface adminQuizNameUpdateReturn {} // Record<string, never>
interface adminQuizDescriptionUpdateReturn {}

/**
 * Lists out all of the Quizzes a user owns
 * 
 * Gives an error when:
 * 1. Token is not a valid
 *
 * @param {number} token
 * @returns {{ quizzes: 
*      Array<{
  *        quizId: number,
  *        name: string
  *      }>
  * }} | errorMessage
  */
export const adminQuizList = ( token: string ): adminQuizListReturn | ErrorObject => {
  let data = getData();
  // Find user with the inputted Id
  const tokenNum = parseInt(token);
  const validToken = data.tokens.find((item) => item.sessionId === tokenNum);
  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
  };
  const quizzes = [];
  const user = data.users.find((user) => user.userId === validToken.userId);
  // Iterate through users quizzes and add their information to an array
  for (const quiz of user.ownedQuizzes) {
    const quizObject = {
      quizId: quiz.quizId,
      name: quiz.name,
    }
    // Add this object to the quizzes array
    quizzes.push(quizObject);
  }
  return { quizzes };
}

export const adminQuizCreate = ( token: string, name: string, description: string ): adminQuizCreateReturn | ErrorObject => {
  let data = getData();
  const tokenNum = parseInt(token);
  const validToken = data.tokens.find((item) => item.sessionId === tokenNum);
  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
  };
  // Checks for invalid characters
  if (!isAlphanumericWithSpaces(name)) {
    return { error: `The quiz name ${name} contains invalid characters.`, statusCode: 400 };
  }
  // Check if name is less than 3 characters long, or more than 30
  // characters long
  if (name.length < 3 || name.length > 30) {
    return { error: `The quiz name ${name} is of invalid length.`, statusCode: 400 };
  }
  // Check if the quiz name is already used by the current logged in user for
  // another quiz
  const user = data.users.find((user) => user.userId === validToken.userId);
  
  if (user.ownedQuizzes.find(quiz => quiz.name === name)) {
    return { error: `The name ${name} is already used by another quiz!`, statusCode: 400 };
  };
  // Check if description length is more than 100 characters
  if (description.length > 100) {
    return { error: `Description is more than 100 characters.`, statusCode: 400 };
  }

  // Add new quiz
  // Get time in Unix format
  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
  const quizId = generateQuizId(data.quizzes);
  let newQuiz = { 
    quizId: quizId,
    ownerId: user.userId,
    name: name,
    description: description,
    timeCreated: unixtimeSeconds,
    timeLastEdited: unixtimeSeconds
  };

  user.ownedQuizzes.push(newQuiz);
  data.quizzes.push(newQuiz);
  setData(data);
  return {
    quizId: newQuiz.quizId
  };
}

/**
 * Shows information relating to a specific quiz
 * 
 * Gives an error when:
 * 1. AuthUserId is not a valid user
 * 2. Quiz ID does not refer to a valid quiz
 * 3. Quiz ID does not refer to a quiz that this user owns
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {{
*   quizId: number,
*   name: string,
*   timeCreated: number,
*   timeLastEdited: number,
*   description: string
* }} | errorMessage
*/
export const adminQuizInfo = ( token: string, quizId: number ): adminQuizInfoReturn | ErrorObject => {
  let data = getData();
  const tokenNum = parseInt(token);
  const validToken = data.tokens.find((item) => item.sessionId === tokenNum);
  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
  };
  // Check whether quiz with quizId exists
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `The quiz Id ${quizId} is invalid!`, statusCode: 400};
  };
  const user = data.users.find((user) => user.userId === validToken.userId);
  // Check whether quiz with quizId is owned by user with authUserId
  if (!user.ownedQuizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403};
  };
  // Find quiz with the inputted Id
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const quizInfo = {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
  }
  return quizInfo;
}
/*
  Permanently remove quiz given a quizId, removes from
    - Owned quizzes array
    - Quizzes array

  Returns error if:
    - AuthUserId is not valid
    - QuizId does not refer to a valid quiz
    - QuizId does not refer to a quiz the user owns
*/
export const adminQuizRemove = ( token: string, quizId: number ): adminQuizRemoveReturn | ErrorObject => {
  let data = getData();
  const tokenNum = parseInt(token);
  const validToken = data.tokens.find((item) => item.sessionId === tokenNum);
  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
  };
  // Error, no quizId found in quizzes
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    return { error: `Given quizId ${quizId} is not valid`, statusCode: 400}   
  };
  // Error, userId does not own quizId
  const user = data.users.find(user => user.userId === validToken.userId);
  const ownQuizIndex = user.ownedQuizzes.findIndex(ownQuiz => ownQuiz.quizId === quizId);
  if (ownQuizIndex === -1) {
    return { error: `Given authUserId ${user.userId} does not own quiz ${quizId}`, statusCode: 403 }
  };
  // Success, remove quiz then return empty
  data.quizzes.splice(quizIndex, 1);
  user.ownedQuizzes.splice(ownQuizIndex, 1);
  setData(data);
  return {};
}

/**
 * Updates the name of a quiz
 * 
 * Helper functions:
 * 1. isAlphanumericWithSpaces()
 *    Used to check if name uses valid characters.
 * 
 * Gives an error when:
 * 1. AuthUserId is not a valid user
 * 2. Quiz ID does not refer to a valid quiz
 * 3. Quiz ID does not refer to a quiz that this user owns
 * 4. Name contains invalid characters. Valid characters are alphanumeric and spaces
 * 5. Name is either less than 3 characters long or more than 30 characters long
 * 6. Name is already used by the current logged in user for another quiz
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} name
 * @returns {{}} | errorMessage
 */

export const adminQuizNameUpdate = ( token: string, quizId: number, name: string ): adminQuizNameUpdateReturn | ErrorObject => {
  let data = getData();

  const tokenNum = parseInt(token);
  const validToken = data.tokens.find((item) => item.sessionId === tokenNum);
  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
  };

  const user = data.users.find((user) => user.userId === validToken.userId);

  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `The quiz Id ${quizId} is invalid!`, statusCode: 400 };
  };
  if (!user.ownedQuizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403};
  };
  if (!isAlphanumericWithSpaces(name)) {
    return { error: `The name ${name} contains invalid characters`, statusCode: 400 };
  };
  if (name.length < 3) {
    return { error: `The name ${name} is too short (>2).`, statusCode: 400 };
  };
  if (name.length > 30) {
    return { error: `The name ${name} is too long (<30).`, statusCode: 400 };
  };

  if (user.ownedQuizzes.find(quiz => quiz.name === name)) {
    return { error: `The name ${name} is already used by another quiz!`, statusCode: 400 };
  };

  // goto the quiz object with matching id, and change name.
  let editedQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  editedQuiz.name = name;
  // Get and update the time edited
  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime()/1000);
  editedQuiz.timeLastEdited = unixtimeSeconds;

  // update this change in the users ownedQuizzes
  let editedQuizUser = user.ownedQuizzes.find(quiz => quiz.quizId === quizId);
  editedQuizUser = editedQuiz;

  setData(data);
  return {};
}

/**
 * Checks if characters in the string are alphanumeric
 * or spaces
 * 
 * @param {string} str 
 * @returns {boolean}
 */
function isAlphanumericWithSpaces(str: string) {
  return /^[A-Za-z0-9\s]+$/.test(str);
}

/**
 * Updates the description of a quiz
 * 
 * Gives an error when:
 * 1. AuthUserId is not a valid user
 * 2. Quiz ID does not refer to a valid quiz
 * 3. Quiz ID does not refer to a quiz that this user owns
 * 4. Description is more than 100 characters in length (note: empty strings are OK)
 * 
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} name
 * @returns {{}} | errorMessage
 */

export const adminQuizDescriptionUpdate = ( token: string, quizId: number, description: string ): adminQuizDescriptionUpdateReturn | ErrorObject => {
  let data = getData();

  const tokenNum = parseInt(token);
  const validToken = data.tokens.find((item) => item.sessionId === tokenNum);
  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
  };

  const user = data.users.find((user) => user.userId === validToken.userId);

  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `The quiz Id ${quizId} is invalid!`, statusCode: 400 };
  };
  if (!user.ownedQuizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403};
  };
  if (description.length > 100) {
    return { error: 'Description is too long (<100)!', statusCode: 400 };
  }

  // goto the quiz object with matching id, and change description.
  let editedQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  editedQuiz.description = description;
  // Get and update the time edited
  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime()/1000);
  editedQuiz.timeLastEdited = unixtimeSeconds;

  // update this change in the users ownedQuizzes
  let editedQuizUser = user.ownedQuizzes.find(quiz => quiz.quizId === quizId);
  editedQuizUser = editedQuiz;
  setData(data);
  return {};
}

import {
  getData,
  setData,
  Question,
  QuestionBody,
  Quiz,
  Answer,
  AnswerToken,
  QuestionToken,
  // colours,
  Session,
  actions,
  Player,
  SessionQuestionResults,
  getTimers,
  // Message
} from './dataStore';
import {
  generateQuizId,
  generateQuestionId,
  generateAnswerId,
  getRandomColour,
  getUserViaToken,
  isImageSync,
  moveStates,
  generateSessionId,
  calculateRoundedAverage,
  arraytoCSV
} from './other';
import isImage from 'is-image-header';
import HTTPError from 'http-errors';
import * as fs from 'fs';
import path from 'path';
import { port, url } from './config.json';
// import { Session } from 'inspector';

type EmptyObject = Record<string, never>;

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
export interface adminQuizInfoReturn {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  numQuestions: number,
  questions: Question[],
  duration: number,
  thumbnailUrl?: string
}
interface adminQuizTrashReturn {
  quizzes: quizObject[];
}
interface adminQuizQuestionCreateReturn {
  questionId: number;
}
interface adminQuizQuestionDuplicateReturn {
  newQuestionId: number;
}
interface viewSessionActivityReturn {
  activeSessions: number[];
  inactiveSessions: number[];
}
interface newSessionQuizReturn {
  sessionId: number;
}

interface getSessionStatusReturn {
  state: string;
  atQuestion: number;
  players: string[];
  metadata: Quiz;
}

export interface UserScore {
  name: string;
  score: number;
}

export interface QuestionResult {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

interface getQuizSessionResultsReturn {
  usersRankedByScore: UserScore[];
  questionResults: QuestionResult[];
}

interface getQuizSessionResultsCSVReturn {
  url: string;
}

interface playerResults {
  name: string;
  questionScore: number[];
  questionRank: number[];
}

/**
 * Lists out all of the Quizzes a user owns
 *
 * Gives an error when:
 * 1. Token is not a valid
 *
 * @param {number} token
 * @returns adminQuizListReturn | errorMessage
 */
export const adminQuizList = (token: string): adminQuizListReturn | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }

  const quizzes: quizObject[] = [];
  // Iterate through users quizzes and add their information to an array
  user.ownedQuizzes.forEach((quizId) => {
    const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

    if (quiz) {
      const quizObject = {
        quizId: quiz.quizId,
        name: quiz.name,
      };

      quizzes.push(quizObject);
    }
  });
  return { quizzes };
};

/**
 * Creates a quiz and adds it to the database.
 * Then gives a reference to the quiz to the user.
 *
 * @param token
 * @param name
 * @param description
 * @returns adminQuizCreateReturn | ErrorObject
 */
export const adminQuizCreate = (token: string, name: string, description: string): adminQuizCreateReturn | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  // Checks for invalid characters
  if (!isAlphanumericWithSpaces(name)) {
    return { error: `The quiz name ${name} contains invalid characters.`, statusCode: 400 };
  }
  // Check if name is less than 3 characters long, or more than 30
  // characters long
  if (name.length < 3 || name.length > 30) {
    return { error: `The quiz name ${name} is of invalid length.`, statusCode: 400 };
  }

  for (const ownedQuizId of user.ownedQuizzes) {
    const ownedQuiz = data.quizzes.find((q: Quiz) => q.quizId === ownedQuizId);

    if (ownedQuiz !== undefined && ownedQuiz.name === name) {
      return { error: `The name ${name} is already used by another quiz!`, statusCode: 400 };
    }
  }

  // Check if description length is more than 100 characters
  if (description.length > 100) {
    return { error: 'Description is more than 100 characters.', statusCode: 400 };
  }

  // Add new quiz
  // Get time in Unix format
  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
  const quizId = generateQuizId(data.quizzes);
  const newQuiz: Quiz = {
    quizId: quizId,
    name: name,
    description: description,
    timeCreated: unixtimeSeconds,
    timeLastEdited: unixtimeSeconds,
    numQuestions: 0,
    questions: [] as Question[],
    duration: 0,
    thumbnailUrl: '',
  };

  user.ownedQuizzes.push(newQuiz.quizId);
  data.quizzes.push(newQuiz);
  setData(data);
  return {
    quizId: newQuiz.quizId
  };
};

/**
 * Given a valid user token and a valid QuizId to inspect,
 * return the details of the quiz to the user.
 *
 * @param token
 * @param quizId
 * @returns adminQuizInfoReturn | ErrorObject
 */

export const adminQuizInfo = (token: string, quizId: number): adminQuizInfoReturn | ErrorObject | undefined => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  // Check whether quiz with quizId exists
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `The quiz Id ${quizId} is invalid!`, statusCode: 400 };
  }
  // Check whether quiz with quizId is owned by user with authUserId
  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403 };
  }
  // Find quiz with the inputted Id
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz !== undefined) {
    const quizInfo: adminQuizInfoReturn = {
      quizId: quiz.quizId,
      name: quiz.name,
      timeCreated: quiz.timeCreated,
      timeLastEdited: quiz.timeLastEdited,
      description: quiz.description,
      numQuestions: quiz.numQuestions,
      questions: quiz.questions,
      duration: quiz.duration,
      thumbnailUrl: quiz.thumbnailUrl,
    };
    return quizInfo;
  }
};

/**
 * Moves the users reference to the quiz, from their
 * ownedQuizzes to their trash.
 *
 * @param token
 * @param quizId
 * @returns Empty | ErrorObject
 */

export const adminQuizRemove = (token: string, quizId: number): Record<string, never> | ErrorObject | undefined => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  // Error, no quizId found in quizzes
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    return { error: `Given quizId ${quizId} is not valid`, statusCode: 400 };
  }
  const ownQuizIndex = user.ownedQuizzes.findIndex(ownQuiz => ownQuiz === quizId);
  if (ownQuizIndex === -1) {
    return { error: `Given authUserId ${user.userId} does not own quiz ${quizId}`, statusCode: 403 };
  }
  // Success, remove quiz then return array
  user.ownedQuizzes.splice(ownQuizIndex, 1);
  // Since the trash hasnt been remove, the quiz still exists, instead we just move it to the user's trash.
  user.trash.push(quizId);
  // Also need to update the timeLastEdited on the quiz
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz !== undefined) {
    const currentTime = new Date();
    const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
    quiz.timeLastEdited = unixtimeSeconds;

    setData(data);
    return {};
  }
};

/**
 * Given a valid user token, updates the name of a quiz and also updating the
 * time an edit has occured.
 *
 * Helper functions:
 * 1. isAlphanumericWithSpaces()
 *    Used to check if name uses valid characters.
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} name
 * @returns Empty | errorMessage
 */

export const adminQuizNameUpdate = (token: string, quizId: number, name: string): Record<string, never> | ErrorObject | undefined => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `The quiz Id ${quizId} is invalid!`, statusCode: 400 };
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403 };
  }
  if (!isAlphanumericWithSpaces(name)) {
    return { error: `The name ${name} contains invalid characters`, statusCode: 400 };
  }
  if (name.length < 3) {
    return { error: `The name ${name} is too short (>2).`, statusCode: 400 };
  }
  if (name.length > 30) {
    return { error: `The name ${name} is too long (<30).`, statusCode: 400 };
  }

  for (const ownedQuizId of user.ownedQuizzes) {
    const ownedQuiz = data.quizzes.find((q: Quiz) => q.quizId === ownedQuizId);
    if (ownedQuiz !== undefined && ownedQuiz.name === name) {
      return { error: `The name ${name} is already used by another quiz!`, statusCode: 400 };
    }
  }

  // goto the quiz object with matching id, and change name.
  const editedQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (editedQuiz !== undefined) {
    editedQuiz.name = name;
    // Get and update the time edited
    const currentTime = new Date();
    const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
    editedQuiz.timeLastEdited = unixtimeSeconds;

    setData(data);
    return {};
  }
};

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
 * Updates the description of a quiz given that a valid
 * user token is provided.
 *
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} name
 * @returns Empty | errorMessage
 */

export const adminQuizDescriptionUpdate = (token: string, quizId: number, description: string): Record<string, never> | ErrorObject | undefined => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `The quiz Id ${quizId} is invalid!`, statusCode: 400 };
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403 };
  }
  if (description.length > 100) {
    return { error: 'Description is too long (<100)!', statusCode: 400 };
  }

  // goto the quiz object with matching id, and change description.
  const editedQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (editedQuiz !== undefined) {
    editedQuiz.description = description;
    // Get and update the time edited
    const currentTime = new Date();
    const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
    editedQuiz.timeLastEdited = unixtimeSeconds;
    setData(data);
    return {};
  }
};

/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////////////// ITERATION 2 //////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Given a valid user token, display the trash of the user
 * associated with the token.
 *
 * @param token
 * @returns adminQuizTrashReturn | ErrorObject
 */
export const adminQuizTrash = (token: string): adminQuizTrashReturn | ErrorObject | undefined => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  const quizzes: quizObject[] = [];
  // Iterate through users quizzes and add their information to an array

  for (const quizId of user.trash) {
    const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
    if (quiz) {
      const quizObject = {
        quizId: quiz.quizId,
        name: quiz.name,
      };
      quizzes.push(quizObject);
    }
  }
  return { quizzes };
};

/**
 * Given a valid user token, if possible moves quiz from the
 * users trash back to their ownedQuizzes.
 *
 * @param token
 * @param quizId
 * @returns Empty | ErrorObject
 */

export const adminQuizRestore = (token: string, quizId: number): Record<string, never> | ErrorObject | undefined => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  // Check whether quiz with quizId exists in the trash
  if (!user.trash.some(quiz => quiz === quizId) && !user.ownedQuizzes.some(quiz => quiz === quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403 };
  }
  // get the quizId and compare with the userId
  // Check if we can find quiz with quizId is owned quizzes
  if (!user.trash.some(quiz => quiz === quizId)) {
    return { error: 'Quiz is not in users trash', statusCode: 400 };
  }
  // Find the quiz object with the inputted Id
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  if (quiz !== undefined) {
    // Check if the name of the restored quiz is already used by another active quiz
    for (const existingQuiz of data.quizzes) {
      if (existingQuiz.name === quiz.name && existingQuiz.quizId !== quizId) {
        return { error: `The name ${quiz.name} is already used by another quiz!`, statusCode: 400 };
      }
    }

    // Restore the quiz by removing it from the trash and updating ownership
    user.trash = user.trash.filter((trashQuizId) => trashQuizId !== quizId);
    user.ownedQuizzes.push(quizId);
    // update timeLastEdited
    const currentTime = new Date();
    const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
    quiz.timeLastEdited = unixtimeSeconds;

    setData(data);
    return {};
  }
};

/**
 * Given an array of desired quizzes to remove. Permanently
 * delete the quizzes from the database as well as the users reference
 * to the quizzes.
 *
 * @param token
 * @param quizIds
 * @returns Empty | ErrorObject
 */

export const adminQuizTrashRemove = (token: string, quizIds: number[]): Record<string, never> | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  // Checking if all quizIds are owned by this user.
  for (const quizId of quizIds) {
    if (!user.trash.some(quiz => quiz === quizId) && !user.ownedQuizzes.some(quiz => quiz === quizId)) {
      return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403 };
    }
  }
  // Checking if the quiz is in the users trash
  for (const quizId of quizIds) {
    if (!user.trash.some(quiz => quiz === quizId)) {
      return { error: 'Quiz is not in users trash', statusCode: 400 };
    }
  }
  // Remove all the questions and answers in every quiz (after all quizIds
  // have been checked to be valid).
  let newAnswers;
  let newQuestions;
  for (const quizId of quizIds) {
    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (quiz !== undefined) {
      if (quiz.questions.length > 0) {
        for (const question of quiz.questions) {
          newAnswers = data.answers.filter(answerToken => answerToken.questionId !== question.questionId);
        }
        newQuestions = data.questions.filter(questionToken => questionToken.quizId !== quizId);
      }
    }
  }
  data.answers = newAnswers;
  data.questions = newQuestions;

  // After questions and answers associated with the quiz has been remove,
  // the quiz itself can be removed.

  for (const quizId of quizIds) {
    const userQuizIndex = user.trash.findIndex(ownQuiz => ownQuiz === quizId);
    if (userQuizIndex >= 0) {
      user.trash.splice(userQuizIndex, 1);
    }
    const dataQuizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
    if (dataQuizIndex >= 0) {
      data.quizzes.splice(dataQuizIndex, 1);
    }
  }
  return {};
};

/**
 * Transfer ownership of a quiz from one user to another.
 * i.e. gives the reference to the quiz to the other user
 * based on their email.
 *
 * @param quizId
 * @param token
 * @param userEmail
 * @returns Empty | ErrorObject
 */

export const adminQuizTransfer = (quizId: number, token: string, userEmail: string): Record<string, never> | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  const quiz = data.quizzes.find((q: Quiz) => q.quizId === quizId);

  if (!quiz) {
    return { error: `The quiz Id ${quizId} is invalid!`, statusCode: 400 };
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403 };
  }
  // The user that will gain the new quiz
  const userTransfer = data.users.find((user) => user.email === userEmail);
  if (!userTransfer) {
    return { error: 'This email does not exist', statusCode: 400 };
  }
  if (user.email === userEmail) {
    return { error: `The email ${userEmail} already owns this quiz`, statusCode: 400 };
  }

  // Check if user with email userEmail has a quiz with the same name as quiz with quizId
  for (const ownedQuizId of userTransfer.ownedQuizzes) {
    const ownedQuiz = data.quizzes.find((quizObject) => quizObject.quizId === ownedQuizId);

    if (ownedQuiz !== undefined && ownedQuiz.name === quiz.name) {
      return { error: `Target user already has a quiz named ${quiz.name}`, statusCode: 400 };
    }
  }

  // Checking if all sessions are in END state
  for (const session of data.sessions) {
    if (session.quiz.quizId === quizId) {
      if (session.state !== 'END') {
        return { error: 'Not all sessions are in end state', statusCode: 400 };
      }
    }
  }
  // Remove quizId from token holder
  const indexToRemove = user.ownedQuizzes.indexOf(quizId);
  if (indexToRemove !== -1) {
    user.ownedQuizzes.splice(indexToRemove, 1);
  }

  userTransfer.ownedQuizzes.push(quizId);

  setData(data);
  return {};
};

/**
 * Adds a question reference to the database, then attaches the
 * question itself to the quiz.
 * A question contains, its answer aswell.
 *
 * @param quizId
 * @param token
 * @param userEmail
 * @returns adminQuizQuestionCreateReturn | ErrorObject
 */

export const adminQuizQuestionCreate = async (quizId: number, token: string, questionBody: QuestionBody): Promise<ErrorObject | adminQuizQuestionCreateReturn> => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (!quiz) {
    return { error: `Given quizId ${quizId} is not valid`, statusCode: 400 };
  }

  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403 };
  }
  if (questionBody.question.length < 5) {
    return { error: `The question ${questionBody.question} is too short (>5).`, statusCode: 400 };
  }
  if (questionBody.question.length > 50) {
    return { error: `The question ${questionBody.question} is too long (<50).`, statusCode: 400 };
  }
  if (questionBody.answers.length < 2) {
    return { error: `The number of answers ${questionBody.answers.length} is too small (>2).`, statusCode: 400 };
  }
  if (questionBody.answers.length > 6) {
    return { error: `The number of answers ${questionBody.answers.length} is too large (<6).`, statusCode: 400 };
  }
  if (questionBody.duration < 0) {
    return { error: `The duration ${questionBody.duration} is not valid.`, statusCode: 400 };
  }

  let totalQuizDuration = quiz.duration;
  totalQuizDuration += questionBody.duration;
  if (totalQuizDuration > 180) {
    return { error: `The quiz duration ${totalQuizDuration}s is too long (<180) when adding this question.`, statusCode: 400 };
  }
  if (questionBody.points > 10) {
    return { error: `The points ${questionBody.points} awarded are too high (<10).`, statusCode: 400 };
  }
  if (questionBody.points < 1) {
    return { error: `The points ${questionBody.points} awarded are too low (>1).`, statusCode: 400 };
  }

  // Checks if answer is too long or short, if it has duplicates or if there are no correct answers
  let numCorrectAnswers = 0;
  for (const answer of questionBody.answers) {
    if (answer.answer.length > 30) {
      return { error: `The answer "${answer.answer}" is too long (<30).`, statusCode: 400 };
    }
    if (answer.answer.length < 1) {
      return { error: `The answer "${answer.answer}" is too short (>1).`, statusCode: 400 };
    }
    // Find if any answers are duplicates
    const numberOfDuplicates = questionBody.answers.reduce((accumulator: number, currentValue) => {
      if (currentValue.answer === answer.answer) {
        return accumulator + 1;
      }
      return accumulator;
    }, 0);

    if (numberOfDuplicates > 1) {
      return { error: `The answer "${answer.answer}" has duplicates.`, statusCode: 400 };
    }
    if (answer.correct) {
      numCorrectAnswers++;
    }
  }

  if (numCorrectAnswers < 1) {
    return { error: 'No answers are correct.', statusCode: 400 };
  }

  if (questionBody.thumbnailUrl === undefined) {
    return { error: 'No thumbnail url provided', statusCode: 400 };
  }
  try {
    const result = await isImage(questionBody.thumbnailUrl);
    if (!result.isImage) {
      return { error: 'This thumbnail is not a JPEG/PNG', statusCode: 400 };
    }
  } catch (error) {
    return { error: 'This is not a valid URL', statusCode: 400 };
  }

  const questionId = generateQuestionId(data.questions);
  let imgUrl: string;
  if (questionBody.thumbnailUrl === undefined) {
    imgUrl = '';
  } else {
    imgUrl = questionBody.thumbnailUrl;
  }
  const questionObject: Question = {
    questionId: questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: [],
    thumbnailUrl: imgUrl,
  };

  for (const answer of questionBody.answers) {
    const answerId = generateAnswerId(data.answers);
    const answerObject: Answer = {
      answerId: answerId,
      answer: answer.answer,
      colour: getRandomColour(),
      correct: answer.correct,
    };
    // Must also add answerToken to answers array in data
    const answerTokenObject: AnswerToken = {
      answerId: answerId,
      questionId: questionId,
    };

    data.answers.push(answerTokenObject);
    questionObject.answers.push(answerObject);
  }
  quiz.questions.push(questionObject);
  // Must also add questionToken to questions array in data
  const questionTokenObject: QuestionToken = {
    questionId: questionId,
    quizId: quizId,
  };
  data.questions.push(questionTokenObject);
  // Must change timeLastEditied due to adding a question
  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
  quiz.timeLastEdited = unixtimeSeconds;

  quiz.duration += questionBody.duration;

  quiz.numQuestions++;
  setData(data);
  return { questionId: questionId };
};

/**
 * Updates a question in a respective quiz, also updates
 * the last edited time for the quiz.
 *
 * @param quizId
 * @param questionId
 * @param token
 * @param questionBody
 * @returns Empty | ErrorObject
 */
export const adminQuizQuestionUpdate = (quizId: number, questionId: number, token: string, questionBody: QuestionBody): Record<string, never> | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403 };
  }
  const validQuestionId = data.questions.find((question) => question.questionId === questionId);
  if (!validQuestionId) {
    return { error: 'The question Id refers to an invalid question within this quiz.', statusCode: 400 };
  }

  if (questionBody.question.length < 5) {
    return { error: 'The question is too short (>5).', statusCode: 400 };
  }
  if (questionBody.question.length > 50) {
    return { error: 'The question is too long (<50).', statusCode: 400 };
  }
  if (questionBody.answers.length > 6) {
    return { error: 'The question has too many answers (<6).', statusCode: 400 };
  }
  if (questionBody.answers.length < 2) {
    return { error: 'The question does not have enough answers (>2).', statusCode: 400 };
  }
  if (questionBody.duration <= 0) {
    return { error: 'The question duration is not a positive number.', statusCode: 400 };
  }

  const quiz = data.quizzes[quizId];
  const otherQuestionsDuration = quiz.duration - quiz.questions[questionId].duration;
  const newQuizDuration = otherQuestionsDuration + questionBody.duration;

  if (newQuizDuration > 180) {
    return { error: 'Quiz duration exceeds 3 minutes.', statusCode: 400 };
  }
  if (questionBody.points < 1) {
    return { error: 'The points are less than 1 (>1).', statusCode: 400 };
  }
  if (questionBody.points > 10) {
    return { error: 'The points are greater than 10 (<10).', statusCode: 400 };
  }

  let numCorrectAnswers = 0;
  for (const index in questionBody.answers) {
    if (questionBody.answers[index].answer.length < 1) {
      return { error: 'Answer length is less than 1 (>1).', statusCode: 400 };
    }
    if (questionBody.answers[index].answer.length > 30) {
      return { error: 'Answer length is greater than 3 (<30).', statusCode: 400 };
    }
    // Check for correct answer
    if (questionBody.answers[index].correct) {
      numCorrectAnswers++;
    }
  }

  if (numCorrectAnswers < 1) {
    return { error: 'No correct answers.', statusCode: 400 };
  }

  if (questionBody.thumbnailUrl === undefined) {
    return { error: 'No thumbnail url provided', statusCode: 400 };
  }
  try {
    isImageSync(questionBody.thumbnailUrl);
  } catch (error) {
    return { error: 'This is not a valid URL', statusCode: 400 };
  }

  // Check for duplicates
  for (let i = 0; i < questionBody.answers.length; i++) {
    for (let j = i + 1; j < questionBody.answers.length; j++) {
      if (questionBody.answers[i].answer === questionBody.answers[j].answer) {
        return { error: 'Duplicate answers', statusCode: 400 };
      }
    }
  }

  const currentData = data.quizzes[quizId].questions[questionId];

  let tempAnswer: Answer;
  const newAnswers: Answer[] = [];
  for (let index = 0; index < questionBody.answers.length; index++) {
    tempAnswer = {
      answerId: index,
      answer: questionBody.answers[index].answer,
      colour: getRandomColour(),
      correct: questionBody.answers[index].correct
    };
    newAnswers.push(tempAnswer);
  }
  currentData.answers = newAnswers;
  currentData.duration = questionBody.duration;
  currentData.points = questionBody.points;
  currentData.question = questionBody.question;

  data.quizzes[quizId].questions[questionId] = currentData;
  data.quizzes[quizId].duration = newQuizDuration;

  // Must change timeLastEditied due to updating a question
  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
  quiz.timeLastEdited = unixtimeSeconds;

  setData(data);
  return {};
};

/**
 * Deletes a question from a quiz, removes the reference from the
 * database.
 *
 * @param quizId
 * @param questionId
 * @param token
 * @returns Empty | ErrorObject
 */
export const adminQuizQuestionDelete = (quizId: number, questionId: number, token: string): Record<string, never> | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403 };
  }
  const validQuestionId = data.questions.find((id) => id.questionId === questionId && id.quizId === quizId);
  if (!validQuestionId) {
    return { error: 'This is not a valid question within this quiz.', statusCode: 400 };
  }

  for (const session of data.sessions) {
    if (session.quiz.quizId === quizId) {
      if (session.state !== 'END') {
        return { error: 'Not all sessions are in end state', statusCode: 400 };
      }
    }
  }

  const currentData = data.quizzes[quizId].questions[questionId];
  const newQuizDuration = data.quizzes[quizId].duration - currentData.duration;

  // Find and return object matching questionId
  const question = data.quizzes[quizId].questions.find((question) => question.questionId === questionId);
  let questionIndex;
  if (question !== undefined) {
    // Find index of the object in the array
    questionIndex = data.quizzes[quizId].questions.indexOf(question);
  }
  // Remove object at index
  if (questionIndex !== -1) {
    data.quizzes[quizId].questions.splice(questionIndex, 1);
  }
  // Find question token and delete
  const quizQuestionIndex = data.questions.indexOf(validQuestionId);
  data.questions.splice(quizQuestionIndex, 1);
  data.quizzes[quizId].duration = newQuizDuration;

  setData(data);
  return {};
};

/**
 * Moves a question from its original location to its new position
 * then shifts the trailing questions down.
 *
 * @param quizId
 * @param questionId
 * @param token
 * @param newPosition
 * @returns Empty | ErrorObject
 */

export const adminQuizQuestionMove = (quizId: number, questionId: number, token: string, newPosition: number): Record<string, never> | ErrorObject | undefined => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token.', statusCode: 401 };
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403 };
  }
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (!quiz) {
    return { error: 'This quizId is invalid.', statusCode: 401 };
  }
  const question = quiz.questions.find((q) => q.questionId === questionId);
  if (!question) {
    return { error: 'The question Id is invalid', statusCode: 400 };
  }

  if (quiz !== undefined) {
    // Check if the new position is within bounds
    if (newPosition < 0 || newPosition >= quiz.questions.length) {
      return { error: 'Invalid new position', statusCode: 400 };
    }

    // Move the question to the new position
    const currentIndex = quiz.questions.indexOf(question);
    if (currentIndex === newPosition) {
      return { error: 'newPosition is the position of the current question', statusCode: 400 };
    }
    quiz.questions.splice(currentIndex, 1);
    quiz.questions.splice(newPosition, 0, question);

    // Update the quiz's timeLastEdited since questions have been reordered
    const currentTime = new Date();
    const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
    quiz.timeLastEdited = unixtimeSeconds;

    setData(data);
    return {};
  }
};

/**
 * Duplicates a question and adds it right after.
 * This creates a new QuestionId.
 *
 * @param quizId
 * @param questionId
 * @param token
 * @returns adminQuizQuestionDuplicateReturn | ErrorObject
 */

export const adminQuizQuestionDuplicate = async (quizId: number, questionId: number, token: string): Promise<ErrorObject | adminQuizQuestionDuplicateReturn | undefined> => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token.', statusCode: 401 };
  }
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (quiz !== undefined) {
    const question = quiz.questions.find((question) => question.questionId === questionId);
    if (!question) {
      return { error: `The question Id ${question} does not refer to a valid quiz!`, statusCode: 400 };
    }

    if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
      return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403 };
    }

    // Find index of QuizQuestion to duplicate
    const questionIndex = quiz.questions.indexOf(question);
    // Create duplicate of question (will go to end of array)
    const newQuestion = await adminQuizQuestionCreate(quizId, token, question) as unknown as adminQuizQuestionCreateReturn;
    // Move new question to directly after index of original quesiton
    adminQuizQuestionMove(quizId, newQuestion.questionId, token, questionIndex + 1);

    // Update timeLastEdited
    const currentTime = new Date();
    const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
    quiz.timeLastEdited = unixtimeSeconds;

    setData(data);
    return { newQuestionId: newQuestion.questionId };
  }
};

/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////// ITERATION 3 NEW ///////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////

/**
  * Updates the thumbnail for the quiz.
  * Ensures the image url does not end with file types: jpg, jpeg, png
  * 
  * @param { number } quizId - Identifies the quiz to change the thumbnail of.
  * @param { number } token 
  * @param { string } imgUrl 
  * 
  * @returns {} 
*/
export const updateQuizThumbNail = (quizId: number, token: string, imgUrl: string): EmptyObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    throw HTTPError(401, 'Empty or invalid user token');
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId) && !user.trash.some(quiz => quiz === quizId)) {
    if (data.quizzes.some((q: Quiz) => q.quizId === quizId)) {
      throw HTTPError(403, 'Quiz is not owned by this user');
    }
  }
  isImageSync(imgUrl);
  const quiz = data.quizzes.find((q: Quiz) => q.quizId === quizId);
  quiz.thumbnailUrl = imgUrl;
  return {};
};

/**
  * Gets sessionId from both active and inactive sessions.
  * 
  * @param {string} token - session token
  * @param {number} quizId - 
  * ...
  * 
  * @returns {object} quizSessions  
*/

export const viewSessionActivity = (token: string, quizId: number): viewSessionActivityReturn | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    throw HTTPError(401, 'Empty or invalid user token');
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId) && !user.trash.some(quiz => quiz === quizId)) {
    if (data.quizzes.some((q: Quiz) => q.quizId === quizId)) {
      throw HTTPError(403, 'Quiz is not owned by this user');
    }
  }
  const quizSessions: viewSessionActivityReturn = {
    activeSessions: [],
    inactiveSessions: [],
  };
  for (const session of data.sessions) {
    if (session.quiz.quizId === quizId) {
      if (session.state === 'END') {
        quizSessions.inactiveSessions.push(session.sessionId);
      } else {
        quizSessions.activeSessions.push(session.sessionId);
      }
    }
  }
  return quizSessions;
};

/**
  * Creates a new session for quizzes.
  * 
  * @param {number} quizId
  * @param {string} token
  * @param {number} autoStartNum
  * 
  * @returns {number} sessionId
*/

export const newSessionQuiz = (quizId: number, token: string, autoStartNum: number): newSessionQuizReturn | ErrorObject => {
  const data = getData();
  const quiz = data.quizzes.find((q: Quiz) => q.quizId === quizId);
  const user = getUserViaToken(token, data);
  if (!user) {
    throw HTTPError(401, 'Empty or invalid user token');
  }
  if (!quiz) {
    throw HTTPError(400, 'Quiz is not owned by this user');
  }

  if (!user.ownedQuizzes.some(quiz => quiz === quizId) && !user.trash.some(quiz => quiz === quizId)) {
    if (data.quizzes.some((q: Quiz) => q.quizId === quizId)) {
      throw HTTPError(403, 'Valid token is provided, but user is not an owner of this quiz');
    }
  }

  if (autoStartNum > 50) {
    throw HTTPError(400, 'autoStartNum is a number greater than 50');
  }

  if (
    data.sessions.reduce((accumulator, currentSession) => {
      if (currentSession.quiz.quizId === quiz.quizId && currentSession.state !== 'END') {
        return accumulator + 1;
      } else {
        return accumulator; // Return the accumulator if the condition isn't met
      }
    }, 0) >= 10
  ) {
    throw HTTPError(400, 'A maximum of 10 sessions that are not in END state currently exist');
  }

  if (quiz.questions.length === 0) {
    throw HTTPError(400, 'The quiz does not have any questions in it');
  }
  // This initialises a default value for questionResults to access in other functions
  // ASSUMPTION: QuestionId is not a negative number
  const defaultResults: SessionQuestionResults = {
    questionId: -1,
    playersCorrectList: [],
    AnswersTimes: []
  };
  const questionResults: SessionQuestionResults[] = [];
  for (let i = 0; i < quiz.numQuestions; i++) {
    questionResults.push(defaultResults);
  }

  const newSessionId = generateSessionId(data.sessions);
  const sessionObject: Session = {
    sessionId: newSessionId,
    quiz: quiz,
    players: [],
    atQuestion: 0,
    state: 'LOBBY',
    questionResults: questionResults,
    autoStartNum: autoStartNum,
    messages: []
  };

  data.sessions.push(sessionObject);
  setData(data);
  return {
    sessionId: newSessionId,
  };
};

/**
  * Changes the state of the session while a quiz is running.
  * 
  * @param {number} quizId
  * @param {number} sessionId
  * @param {string} token
  * @param {string} action
  * 
  * @returns {}
*/

export const updateSessionState = (quizId: number, sessionId: number, token: string, action: string): EmptyObject | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    throw HTTPError(401, 'Empty or invalid user token');
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId) && !user.trash.some(quiz => quiz === quizId)) {
    if (data.quizzes.some((q: Quiz) => q.quizId === quizId)) {
      throw HTTPError(403, 'Quiz/Session cannot be modified by this user. ');
    }
  }
  const session = data.sessions.find((s: Session) => s.sessionId === sessionId);
  if (session === undefined || session.quiz.quizId !== quizId) {
    throw HTTPError(400, 'Session ID does not refer to a valid session within this quiz or is invalid');
  }
  const timers = getTimers();
  moveStates(timers, session, action as actions);
  return {};
};

/**
  * Get the status of a quiz session.
  * 
  * @param {number} quizId
  * @param {number} sessionId
  * @param {string} token
  * 
  * @returns {object} - containing properties: state, atQuestion, players, metadata
*/

export const getSessionStatus = (quizId: number, sessionId: number, token: string): getSessionStatusReturn | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    throw HTTPError(401, 'Empty or invalid user token');
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId) && !user.trash.some(quiz => quiz === quizId)) {
    if (data.quizzes.some((q: Quiz) => q.quizId === quizId)) {
      throw HTTPError(403, 'Quiz/Session cannot be modified by this user. ');
    }
  }
  const session = data.sessions.find((s: Session) => s.sessionId === sessionId);
  if (session === undefined || session.quiz.quizId !== quizId) {
    throw HTTPError(400, 'Session ID does not refer to a valid session within this quiz or is invalid');
  }

  const sessionPlayers = session.players.map((p: Player) => p.name);
  return {
    state: session.state,
    atQuestion: session.atQuestion,
    players: sessionPlayers,
    metadata: session.quiz
  };
};

/**
  * Get the results for the quiz in the session.
  * 
  * @param {number} quizId
  * @param {number} sessionId
  * @param {string} token
  * 
  * @returns {object} - SesResult, containing objects: usersRankedByScore, questionResults
*/

export const getQuizSessionResults = (quizId: number, sessionId: number, token: string): getQuizSessionResultsReturn | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    throw HTTPError(401, 'Empty or invalid user token');
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId) && !user.trash.some(quiz => quiz === quizId)) {
    if (data.quizzes.some((q: Quiz) => q.quizId === quizId)) {
      throw HTTPError(403, 'Quiz/Session cannot be modified by this user. ');
    }
  }
  const session = data.sessions.find((s: Session) => s.sessionId === sessionId);
  if (session === undefined || session.quiz.quizId !== quizId) {
    throw HTTPError(400, 'Session ID does not refer to a valid session within this quiz or is invalid');
  }
  if (session.state !== 'FINAL_RESULTS') {
    throw HTTPError(400, 'Session is not in FINAL_RESULTS state');
  }

  const SesResult: getQuizSessionResultsReturn = {
    usersRankedByScore: [],
    questionResults: []
  };

  for (let i = 0; i < session.atQuestion; i++) {
    SesResult.questionResults.push({
      questionId: session.questionResults[i].questionId,
      playersCorrectList: session.questionResults[i].playersCorrectList,
      averageAnswerTime: Math.floor(calculateRoundedAverage(session.questionResults[i].AnswersTimes) / 1000),
      percentCorrect: Math.round((session.questionResults[i].playersCorrectList.length / session.players.length) * 100)
    });
  }

  const unsortedScores: UserScore[] = session.players.map((p: Player) => ({ name: p.name, score: p.score }));
  SesResult.usersRankedByScore = unsortedScores.sort((a, b) => b.score - a.score);

  return SesResult;
};

/**
  * Get the results for the quiz in the session in a CSV format.
  * 
  * @param {number} quizId
  * @param {number} sessionId
  * @param {string} token
  * 
  * @returns {object} - Containing property: url 
*/
export const getQuizSessionResultsCSV = (quizId: number, sessionId: number, token: string): getQuizSessionResultsCSVReturn | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    throw HTTPError(401, 'Empty or invalid user token');
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId) && !user.trash.some(quiz => quiz === quizId)) {
    if (data.quizzes.some((q: Quiz) => q.quizId === quizId)) {
      throw HTTPError(403, 'Quiz/Session cannot be modified by this user. ');
    }
  }
  const session = data.sessions.find((s: Session) => s.sessionId === sessionId);
  if (session === undefined || session.quiz.quizId !== quizId) {
    throw HTTPError(400, 'Session ID does not refer to a valid session within this quiz or is invalid');
  }
  if (session.state !== 'FINAL_RESULTS') {
    throw HTTPError(400, 'Session is not in FINAL_RESULTS state');
  }

  // Create and convert array into CSV
  const resArray: string[][] = [];
  resArray[0][0] = 'Player';
  // Establishes a header e.g. Player, question1score, question1rank...
  for (let i = 0; i < 2 * session.questionResults.length; i += 2) {
    resArray[0][i + 1] = `question${i + 1}score`;
    resArray[0][i + 2] = `question${i + 1}rank`;
  }
  const playerResults: playerResults[] = [];
  for (const player of session.players) {
    const result: playerResults = {
      name: player.name,
      questionScore: [...player.questionResults.questionScore],
      questionRank: [...player.questionResults.questionRank],
    };
    playerResults.push(result);
  }
  const sortedPlayerResults = playerResults.slice().sort((a, b) => a.name.localeCompare(b.name));

  for (let i = 0; i < sortedPlayerResults.length; i++) {
    for (let j = 0; j < 2 * session.questionResults.length + 1; j++) {
      if (j === 0) {
        resArray[i][j] = sortedPlayerResults[i].name;
      }
      if (j % 2 === 1) {
        resArray[i][j] = sortedPlayerResults[i].questionScore[j].toString();
      }
      if (j % 2 === 0) {
        resArray[i][j] = sortedPlayerResults[i].questionRank[j].toString();
      }
    }
  }

  const csv = arraytoCSV(resArray);
  const filename = `csv-${Date.now()}.csv`;
  const filepath = path.join(__dirname, 'src', 'csv_files', filename);
  fs.writeFileSync(filepath, csv);
  setData(data);
  return {
    url: `${url}:${port}/csv/uploads/${filename}`,
  };
};

import HTTPError from 'http-errors';
import { getData, setData, Question, QuestionBody, Quiz, Answer, AnswerToken, QuestionToken, colours } from './dataStore';
import { generateQuizId, generateQuestionId, generateAnswerId, getRandomColour } from './other';

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
interface adminQuizInfoReturn {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  numQuestions: number,
  questions: Question[],
  duration: number,
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
  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    throw HTTPError(401, `The token ${token} is invalid!`);
  }
  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token');
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
  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    throw HTTPError(401, `The token ${token} is invalid!`);
  }
  // Checks for invalid characters
  if (!isAlphanumericWithSpaces(name)) {
    throw HTTPError(400, `The quiz name ${name} contains invalid characters.`);
  }
  // Check if name is less than 3 characters long, or more than 30
  // characters long
  if (name.length < 3 || name.length > 30) {
    throw HTTPError(400, `The quiz name ${name} is of invalid length.`);
  }
  // Check if the quiz name is already used by the current logged in user for
  // another quiz
  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token');
  }

  for (const ownedQuizId of user.ownedQuizzes) {
    const ownedQuiz = data.quizzes.find((quizObject) => quizObject.quizId === ownedQuizId);
    if (!ownedQuiz) {
      throw HTTPError(400, 'There are no quizzes!');
    }

    if (ownedQuiz.name === name) {
      throw HTTPError(400, `The name ${name} is already used by another quiz!`);
    }
  }

  // Check if description length is more than 100 characters
  if (description.length > 100) {
    throw HTTPError(400, 'Description is more than 100 characters.');
  }

  // Add new quiz
  // Get time in Unix format
  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
  const quizId = generateQuizId(data.quizzes);
  const newQuiz = {
    quizId: quizId,
    ownerId: user.userId,
    name: name,
    description: description,
    timeCreated: unixtimeSeconds,
    timeLastEdited: unixtimeSeconds,
    numQuestions: 0,
    questions: [] as Question[],
    duration: 0,
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

export const adminQuizInfo = (token: string, quizId: number): adminQuizInfoReturn | ErrorObject => {
  const data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    throw HTTPError(401, `The token ${token} is invalid!`);
  }
  // Check whether quiz with quizId exists
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    throw HTTPError(400, `The quiz Id ${quizId} is invalid!`);
  }
  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token');
  }
  // Check whether quiz with quizId is owned by user with authUserId
  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    throw HTTPError(403, `This quiz ${quizId} is not owned by this User!`);
  }
  // Find quiz with the inputted Id
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    throw HTTPError(400, 'This is not a valid quizId');
  }
  const quizInfo = {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    duration: quiz.duration,
  };
  return quizInfo;
};

/**
 * Moves the users reference to the quiz, from their
 * ownedQuizzes to their trash.
 *
 * @param token
 * @param quizId
 * @returns Empty | ErrorObject
 */

export const adminQuizRemove = (token: string, quizId: number): Record<string, never> | ErrorObject => {
  const data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    throw HTTPError(401, `The token ${token} is invalid!`);
  }
  // Error, no quizId found in quizzes
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    throw HTTPError(400, `Given quizId ${quizId} is not valid`);
  }
  // Error, userId does not own quizId
  const user = data.users.find(user => user.userId === validToken.userId);
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token');
  }
  const ownQuizIndex = user.ownedQuizzes.findIndex(ownQuiz => ownQuiz === quizId);
  if (ownQuizIndex === -1) {
    throw HTTPError(403, `Given authUserId ${user.userId} does not own quiz ${quizId}`);
  }
  // Success, remove quiz then return array
  user.ownedQuizzes.splice(ownQuizIndex, 1);
  // Since the trash hasnt been remove, the quiz still exists, instead we just move it to the user's trash.
  user.trash.push(quizId);
  // Also need to update the timeLastEdited on the quiz
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    throw HTTPError(400, `Given quizId ${quizId} is not valid`);
  }

  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
  quiz.timeLastEdited = unixtimeSeconds;

  setData(data);
  return {};
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

export const adminQuizNameUpdate = (token: string, quizId: number, name: string): Record<string, never> | ErrorObject => {
  const data = getData();

  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    throw HTTPError(401, `The token ${token} is invalid!`);
  }
  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token');
  }
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    throw HTTPError(400, `The quiz Id ${quizId} is invalid!`);
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    throw HTTPError(403, `This quiz ${quizId} is not owned by this User!`);
  }
  if (!isAlphanumericWithSpaces(name)) {
    throw HTTPError(400, `The name ${name} contains invalid characters`);
  }
  if (name.length < 3) {
    throw HTTPError(400, `The name ${name} is too short (>2).`);
  }
  if (name.length > 30) {
    throw HTTPError(400, `The name ${name} is too long (<30).`);
  }

  for (const ownedQuizId of user.ownedQuizzes) {
    const ownedQuiz = data.quizzes.find((quizObject) => quizObject.quizId === ownedQuizId);
    if (!ownedQuiz) {
      throw HTTPError(400, 'There are no quizzes!');
    }

    if (ownedQuiz.name === name) {
      throw HTTPError(400, `The name ${name} is already used by another quiz!`);
    }
  }

  // goto the quiz object with matching id, and change name.
  const editedQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!editedQuiz) {
    throw HTTPError(400, `The quiz Id ${quizId} is invalid!`);
  }
  editedQuiz.name = name;
  // Get and update the time edited
  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
  editedQuiz.timeLastEdited = unixtimeSeconds;

  setData(data);
  return {};
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

export const adminQuizDescriptionUpdate = (token: string, quizId: number, description: string): Record<string, never> | ErrorObject => {
  const data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    throw HTTPError(401, `The token ${token} is invalid!`);
  }
  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token');
  }
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    throw HTTPError(400, `The quiz Id ${quizId} is invalid!`);
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    throw HTTPError(403, `This quiz ${quizId} is not owned by this User!`);
  }
  if (description.length > 100) {
    throw HTTPError(400, 'Description is too long (<100)!');
  }

  // goto the quiz object with matching id, and change description.
  const editedQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!editedQuiz) {
    throw HTTPError(400, `The quiz Id ${quizId} is invalid!`);
  }

  editedQuiz.description = description;
  // Get and update the time edited
  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
  editedQuiz.timeLastEdited = unixtimeSeconds;
  setData(data);
  return {};
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
export const adminQuizTrash = (token: string): adminQuizTrashReturn | ErrorObject => {
  const data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);
  if (!validToken) {
    throw HTTPError(401, 'This is not a valid user token');
  }
  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token');
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

export const adminQuizRestore = (token: string, quizId: number): Record<string, never> | ErrorObject => {
  const data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);
  if (!validToken) {
    throw HTTPError(401, 'This is not a valid user token');
  }
  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token');
  }

  // Check whether quiz with quizId exists in the trash
  if (!user.trash.some(quiz => quiz === quizId) && !user.ownedQuizzes.some(quiz => quiz === quizId)) {
    throw HTTPError(403, `This quiz ${quizId} is not owned by this User!`);
  }
  // get the quizId and compare with the userId

  // Check if we can find quiz with quizId is owned quizzes
  if (!user.trash.some(quiz => quiz === quizId)) {
    throw HTTPError(400, 'Quiz is not in users trash');
  }

  // Find the quiz object with the inputted Id
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  if (!quiz) {
    throw HTTPError(400, 'This is not a valid quizId');
  }
  // Check if the name of the restored quiz is already used by another active quiz
  for (const existingQuiz of data.quizzes) {
    if (existingQuiz.name === quiz.name && existingQuiz.quizId !== quizId) {
      throw HTTPError(400, `The name ${quiz.name} is already used by another quiz!`);
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
  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    throw HTTPError(401, `The token ${token} is invalid!`);
  }
  const user = data.users.find((user) => user.userId === validToken.userId);
  // Check whether user exists and is valid
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token');
  }

  // Checking if all quizIds are owned by this user.
  for (const quizId of quizIds) {
    if (!user.trash.some(quiz => quiz === quizId) && !user.ownedQuizzes.some(quiz => quiz === quizId)) {
      throw HTTPError(403, `This quiz ${quizId} is not owned by this User!`);
    }
  }

  // Checking if the quiz is in the users trash
  for (const quizId of quizIds) {
    if (!user.trash.some(quiz => quiz === quizId)) {
      throw HTTPError(400, 'Quiz is not in users trash');
    }
  }

  // Remove all the questions and answers in every quiz (after all quizIds
  // have been checked to be valid).
  let newAnswers;
  let newQuestions;
  for (const quizId of quizIds) {
    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    if (!quiz) {
      throw HTTPError(400, `Given quizId ${quizId} is not valid`);
    }
    if (quiz.questions.length > 0) {
      for (const question of quiz.questions) {
        newAnswers = data.answers.filter(answerToken => answerToken.questionId !== question.questionId);
      }
      newQuestions = data.questions.filter(questionToken => questionToken.quizId !== quizId);
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

  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    throw HTTPError(401, `The token ${token} is invalid!`);
  }

  const user = data.users.find((user) => user.userId === validToken.userId);
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token');
  }
  if (!quiz) {
    throw HTTPError(400, `Given quizId ${quizId} is not valid`);
  }
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    throw HTTPError(400, `The quiz Id ${quizId} is invalid!`);
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    throw HTTPError(403, `This quiz ${quizId} is not owned by this User!`);
  }
  // The user that will gain the new quiz
  const userTransfer = data.users.find((user) => user.email === userEmail);

  if (!userTransfer) {
    throw HTTPError(400, 'This email does not exist');
  }

  if (user.email === userEmail) {
    throw HTTPError(400, `The email ${userEmail} already owns this quiz`);
  }

  // Check if user with email userEmail has a quiz with the same name as quiz with quizId
  for (const ownedQuizId of userTransfer.ownedQuizzes) {
    const ownedQuiz = data.quizzes.find((quizObject) => quizObject.quizId === ownedQuizId);
    if (!ownedQuiz) {
      throw HTTPError(400, 'There are no quizzes!');
    }

    if (ownedQuiz.name === quiz.name) {
      throw HTTPError(400, `Target user already has a quiz named ${quiz.name}`);
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

export const adminQuizQuestionCreate = (quizId: number, token: string, questionBody: QuestionBody): adminQuizQuestionCreateReturn | ErrorObject => {
  const data = getData();

  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    throw HTTPError(401, `The token ${token} is invalid!`);
  }

  const user = data.users.find((user) => user.userId === validToken.userId);
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token');
  }
  if (!quiz) {
    throw HTTPError(400, `Given quizId ${quizId} is not valid`);
  }
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    throw HTTPError(400, `The quiz Id ${quizId} is invalid!`);
  }
  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    throw HTTPError(403, `This quiz ${quizId} is not owned by this User!`);
  }
  if (questionBody.question.length < 5) {
    throw HTTPError(400, `The question ${questionBody.question} is too short (>5).`);
  }
  if (questionBody.question.length > 50) {
    throw HTTPError(400, `The question ${questionBody.question} is too long (<50).`);
  }
  if (questionBody.answers.length < 2) {
    throw HTTPError(400, `The number of answers ${questionBody.answers.length} is too small (>2).`);
  }
  if (questionBody.answers.length > 6) {
    throw HTTPError(400, `The number of answers ${questionBody.answers.length} is too large (<6).`);
  }
  if (questionBody.duration < 0) {
    throw HTTPError(400, `The duration ${questionBody.duration} is not valid.`);
  }

  let totalQuizDuration = quiz.duration;
  totalQuizDuration += questionBody.duration;
  if (totalQuizDuration > 180) {
    throw HTTPError(400, `The quiz duration ${totalQuizDuration}s is too long (<180) when adding this question.`);
  }

  if (questionBody.points > 10) {
    throw HTTPError(400, `The points ${questionBody.points} awarded are too high (<10).`);
  }

  if (questionBody.points < 1) {
    throw HTTPError(400, `The points ${questionBody.points} awarded are too low (>1).`);
  }

  // Checks if answer is too long or short, if it has duplicates or if there are no correct answers
  let numCorrectAnswers = 0;
  for (const answer of questionBody.answers) {
    if (answer.answer.length > 30) {
      throw HTTPError(400,  `The answer "${answer.answer}" is too long (<30).`);
    }

    if (answer.answer.length < 1) {
      throw HTTPError(400, `The answer "${answer.answer}" is too short (>1).`);
    }
    // Find if any answers are duplicates
    const numberOfDuplicates = questionBody.answers.reduce((accumulator: number, currentValue) => {
      if (currentValue.answer === answer.answer) {
        return accumulator + 1;
      }
      return accumulator;
    }, 0);

    if (numberOfDuplicates > 1) {
      throw HTTPError(400, `The answer "${answer.answer}" has duplicates.`);
    }
    if (answer.correct) {
      numCorrectAnswers++;
    }
  }

  if (numCorrectAnswers < 1) {
    throw HTTPError(400, 'No answers are correct.');
  }

  const questionId = generateQuestionId(data.questions);
  const questionObject: Question = {
    questionId: questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: [],
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
  const validToken = data.tokens.find((item) => item.sessionId === token);
  if (!validToken) {
    throw HTTPError(401, 'This is not a valid user token.');
  }

  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token.');
  }

  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    throw HTTPError(403, `This quiz ${quizId} is not owned by this User!`);
  }

  const validQuestionId = data.questions.find((question) => question.questionId === questionId);
  if (!validQuestionId) {
    throw HTTPError(400, 'The question Id refers to an invalid question within this quiz.');
  }

  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    throw HTTPError(400, `The quiz Id ${quizId} is invalid!`);
  }

  if (questionBody.question.length < 5) {
    throw HTTPError(400, 'The question is too short (>5).')
  }

  if (questionBody.question.length > 50) {
    throw HTTPError(400, 'The question is too long (<50).');
  }

  if (questionBody.answers.length > 6) {
    throw HTTPError(400, 'The question has too many answers (<6).');
  }

  if (questionBody.answers.length < 2) {
    throw HTTPError(400, 'The question does not have enough answers (>2).');
  }

  if (questionBody.duration <= 0) {
    throw HTTPError(400, 'The question duration is not a positive number.');
  }

  // Calculating quiz duration with new question duration
  const quiz = data.quizzes[quizId];
  const otherQuestionsDuration = quiz.duration - quiz.questions[questionId].duration;
  const newQuizDuration = otherQuestionsDuration + questionBody.duration;

  if (newQuizDuration > 180) {
    throw HTTPError(400, 'Quiz duration exceeds 3 minutes.');
  }

  if (questionBody.points < 1) {
    throw HTTPError(400, 'The points are less than 1 (>1).');
  }

  if (questionBody.points > 10) {
    throw HTTPError(400, 'The points are greater than 10 (<10).');
  }

  let flag = false;
  for (const index in questionBody.answers) {
    if (questionBody.answers[index].answer.length < 1) {
      throw HTTPError(400, 'Answer length is less than 1 (>1).');
    }

    if (questionBody.answers[index].answer.length > 30) {
      throw HTTPError(400, 'Answer length is greater than 3 (<30).');
    }
    // Check for correct answer
    if (questionBody.answers[index].correct) {
      flag = true;
    }
  }

  if (!flag) {
    throw HTTPError(401, 'No correct answers.');
  }

  // Check for duplicates
  for (let i = 0; i < questionBody.answers.length; i++) {
    for (let j = i + 1; j < questionBody.answers.length; j++) {
      if (questionBody.answers[i].answer === questionBody.answers[j].answer) {
        throw HTTPError(400, 'Duplicate answers');
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
  const validToken = data.tokens.find((item) => item.sessionId === token);
  if (!validToken) {
    throw HTTPError(401, 'This is not a valid user token.');
  }

  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token.');
  }

  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    throw HTTPError(403, `This quiz ${quizId} is not owned by this User!`);
  }

  const validQuestionId = data.questions.find((id) => id.questionId === questionId && id.quizId === quizId);
  if (!validQuestionId) {
    throw HTTPError(400, 'This is not a valid question within this quiz.');
  }

  const currentData = data.quizzes[quizId].questions[questionId];
  const newQuizDuration = data.quizzes[quizId].duration - currentData.duration;

  // Find and return object matching questionId
  const question = data.quizzes[quizId].questions.find((question) => question.questionId === questionId);
  if (!question) {
    throw HTTPError(400, 'This questionId does not exist.');
  }
  // Find index of the object in the array
  const questionIndex = data.quizzes[quizId].questions.indexOf(question);
  // Remove object at index
  if (questionIndex === -1) {
    throw HTTPError(400, 'This is not a valid question within this quiz.');
  }
  data.quizzes[quizId].questions.splice(questionIndex, 1);
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

export const adminQuizQuestionMove = (quizId: number, questionId: number, token: string, newPosition: number): Record<string, never> | ErrorObject => {
  const data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);

  if (!validToken) {
    throw HTTPError(401, 'This is not a valid user token.');
  }

  const user = data.users.find((user) => user.userId === validToken.userId);

  if (!user) {
    throw HTTPError(401, 'This is not a valid user token.');
  }

  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    throw HTTPError(403, `This quiz ${quizId} is not owned by this User!`);
  }
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (!quiz) {
    throw HTTPError(400, `Given quizId ${quizId} is not valid`);
  }

  const question = quiz.questions.find((q) => q.questionId === questionId);

  if (!question) {
    throw HTTPError(400, 'The question Id is invalid');
  }

  // Check if the new position is within bounds
  if (newPosition < 0 || newPosition >= quiz.questions.length) {
    throw HTTPError(400, 'Invalid new position');
  }

  // Move the question to the new position
  const currentIndex = quiz.questions.indexOf(question);
  if (currentIndex === newPosition) {
    throw HTTPError(400, 'newPosition is the position of the current question');
  }
  quiz.questions.splice(currentIndex, 1);
  quiz.questions.splice(newPosition, 0, question);

  // Update the quiz's timeLastEdited since questions have been reordered
  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
  quiz.timeLastEdited = unixtimeSeconds;

  setData(data);
  return {};
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

export const adminQuizQuestionDuplicate = (quizId: number, questionId: number, token: string): adminQuizQuestionDuplicateReturn | ErrorObject => {
  const data = getData();

  const validToken = data.tokens.find((item) => item.sessionId === token);
  if (!validToken) {
    throw HTTPError(401, `The token ${token} is invalid!`);
  }

  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    throw HTTPError(401, 'This is not a valid user token.');
  }

  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (!quiz) {
    throw HTTPError(400, `Given quizId ${quizId} is not valid`);
  }

  const question = quiz.questions.find((question) => question.questionId === questionId);
  if (!question) {
    throw HTTPError(400, `The question Id ${question} does not refer to a valid quiz!`);
  }

  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    throw HTTPError(403, `This quiz ${quizId} is not owned by this User!`);
  }

  // Find index of QuizQuestion to duplicate
  const questionIndex = quiz.questions.indexOf(question);
  // Create duplicate of question (will go to end of array)
  const newQuestion = adminQuizQuestionCreate(quizId, token, question) as adminQuizQuestionCreateReturn;
  // Move new question to directly after index of original quesiton
  adminQuizQuestionMove(quizId, newQuestion.questionId, token, questionIndex + 1);

  // Update timeLastEdited
  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
  quiz.timeLastEdited = unixtimeSeconds;

  setData(data);
  return { newQuestionId: newQuestion.questionId };
};

/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////// ITERATION 3 NEW ///////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////

export const updateQuizThumbNail = (quizId: number, token: string, imgUrl: string): Record<string, never> | ErrorObject => {
  // throw HTTPError(400, 'imgUrl when fetched does not return a valid file');
  // throw HTTPError(400, 'imgUrl when fetched is not a JPG or PNG image');
  // throw HTTPError(401, 'Token is empty');
  // throw HTTPError(401, 'Token is invalid');
  // throw HTTPError(403, 'Valid token is provided, but user is not an owner of this quiz');
  return {};
};

export const viewSessionActivity = (token: string, quizId: number): viewSessionActivityReturn | ErrorObject => {
  // throw HTTPError(401, 'Token is empty');
  // throw HTTPError(401, 'Token is invalid');
  // throw HTTPError(403, 'Valid token is provided, but user is not an owner of this quiz');
  return {
    activeSessions: [
      247,
      566,
      629,
      923
    ],
    inactiveSessions: [
      422,
      817
    ]
  };
};

export const newSessionQuiz = (quizId: number, token: string, autoStartNum: number): newSessionQuizReturn | EmptyObject => {
  // throw HTTPError(400, 'autoStartNum is a number greater than 50');
  // throw HTTPError(400, 'A maximum of 10 sessions that are not in END state currently exist');
  // throw HTTPError(400, 'The quiz does not have any questions in it');
  // throw HTTPError(401, 'Token is empty');
  // throw HTTPError(401, 'Token is invalid');
  // throw HTTPError(403, 'Valid token is provided, but user is not an owner of this quiz');
  return {
    sessionId: 5546
  };
};

export const updateSessionState = (quizId: number, sessionId: number, token: string, action: string): Record<string, never> | ErrorObject => {
  // throw HTTPError(400, 'Session ID does not refer to a valid session qithin this quiz');
  // throw HTTPError(400, 'Action provided is not a valid Action enum');
  // throw HTTPError(400, 'Action enum cannot be applied in the current state);
  // throw HTTPError(401, 'Token is empty');
  // throw HTTPError(401, 'Token is invalid');
  // throw HTTPError(403, 'Valid token is provided, but user is not authorised to modify this sesion');
  return {};
};

export const getSessionStatus = (quizId: number, sessionId: number, token: string): getSessionStatusReturn | ErrorObject => {
  // throw HTTPError(400, 'Session ID does not refer to a valid session qithin this quiz');
  // throw HTTPError(401, 'Token is empty');
  // throw HTTPError(401, 'Token is invalid');
  // throw HTTPError(403, 'Valid token is provided, but user is not authorised to view this sesion');
  return {
    state: 'LOBBY',
    atQuestion: 3,
    players: [
      'Hayden'
    ],
    metadata: {
      quizId: 5546,
      name: 'This is the name of the quiz',
      timeCreated: 1683019484,
      timeLastEdited: 1683019484,
      description: 'This quiz is so we can have a lot of fun',
      numQuestions: 1,
      questions: [
        {
          questionId: 5546,
          question: 'Who is the Monarch of England?',
          duration: 4,
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
          points: 5,
          answers: [
            {
              answerId: 2384,
              answer: 'Prince Charles',
              colour: colours.RED,
              correct: true
            }
          ]
        }
      ],
      duration: 44,
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    }
  };
};

export const getQuizSessionResults = (quizId: number, sessionId: number, token: string): getQuizSessionResultsReturn | ErrorObject => {
  // throw HTTPError(400, 'Session ID does not refer to a valid session qithin this quiz');
  // throw HTTPError(400, 'Session is not in FINAL_RESULTS state');
  // throw HTTPError(401, 'Token is empty');
  // throw HTTPError(401, 'Token is invalid');
  // throw HTTPError(403, 'Valid token is provided, but user is not authorised to view this sesion');
  return {
    usersRankedByScore: [
      {
        name: 'Hayden',
        score: 45
      }
    ],
    questionResults: [
      {
        questionId: 5546,
        playersCorrectList: [
          'Hayden'
        ],
        averageAnswerTime: 45,
        percentCorrect: 54
      }
    ]
  };
};

export const getQuizSessionResultsCSV = (quizId: number, sessionId: number, token: string): getQuizSessionResultsCSVReturn | ErrorObject => {
  // throw HTTPError(400, 'Session ID does not refer to a valid session qithin this quiz');
  // throw HTTPError(400, 'Session is not in FINAL_RESULTS state');
  // throw HTTPError(401, 'Token is empty');
  // throw HTTPError(401, 'Token is invalid');
  // throw HTTPError(403, 'Valid token is provided, but user is not authorised to view this sesion');
  return {
    url: 'http://google.com/some/image/path.csv'
  };
};

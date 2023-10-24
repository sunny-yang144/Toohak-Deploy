import { getData, setData, Question, QuestionBody, Answer, colours } from './dataStore';
import { generateQuizId, generateQuestionId, generateAnswerId, getRandomColour } from './other';

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

interface adminQuizQuestionDuplicateReturn{
  newQuestionId: number;
}
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
export const adminQuizList = (token: string): adminQuizListReturn | ErrorObject => {
  const data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
  }
  const user = data.users.find((user) => user.userId === validToken.userId);
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

export const adminQuizCreate = (token: string, name: string, description: string): adminQuizCreateReturn | ErrorObject => {
  const data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
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
  // Check if the quiz name is already used by the current logged in user for
  // another quiz
  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }

  for (const quiz of data.quizzes) {
    if (quiz.name === name) {
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
export const adminQuizInfo = (token: string, quizId: number): adminQuizInfoReturn | ErrorObject => {
  const data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
  }
  // Check whether quiz with quizId exists
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `The quiz Id ${quizId} is invalid!`, statusCode: 400 };
  }
  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  // Check whether quiz with quizId is owned by user with authUserId
  if (!user.ownedQuizzes.some(quiz => quiz === quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`, statusCode: 403 };
  }
  // Find quiz with the inputted Id
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return { error: 'This is not a valid quizId', statusCode: 400 };
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
/*
  Permanently remove quiz given a quizId, removes from
    - Owned quizzes array
    - Quizzes array

  Returns error if:
    - AuthUserId is not valid
    - QuizId does not refer to a valid quiz
    - QuizId does not refer to a quiz the user owns
*/
export const adminQuizRemove = (token: string, quizId: number): Record<string, never> | ErrorObject => {
  const data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
  }
  // Error, no quizId found in quizzes
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    return { error: `Given quizId ${quizId} is not valid`, statusCode: 400 };
  }
  // Error, userId does not own quizId
  const user = data.users.find(user => user.userId === validToken.userId);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  const ownQuizIndex = user.ownedQuizzes.findIndex(ownQuiz => ownQuiz === quizId);
  if (ownQuizIndex === -1) {
    return { error: `Given authUserId ${user.userId} does not own quiz ${quizId}`, statusCode: 403 };
  }
  // Success, remove quiz then return empty
  data.quizzes.splice(quizIndex, 1);
  user.ownedQuizzes.splice(ownQuizIndex, 1);
  setData(data);
  return {};
};

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

export const adminQuizNameUpdate = (token: string, quizId: number, name: string): Record<string, never> | ErrorObject => {
  const data = getData();

  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
  }

  const user = data.users.find((user) => user.userId === validToken.userId);
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

  for (const quiz of data.quizzes) {
    if (quiz.name === name) {
      return { error: `The name ${name} is already used by another quiz!`, statusCode: 400 };
    }
  }

  // goto the quiz object with matching id, and change name.
  const editedQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!editedQuiz) {
    return { error: `The quiz Id ${quizId} is invalid!`, statusCode: 400 };
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

export const adminQuizDescriptionUpdate = (token: string, quizId: number, description: string): Record<string, never> | ErrorObject => {
  const data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
  }

  const user = data.users.find((user) => user.userId === validToken.userId);
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
  if (!editedQuiz) {
    return { error: `The quiz Id ${quizId} is invalid!`, statusCode: 400 };
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

export const adminQuizTrash = (token: string): adminQuizTrashReturn | ErrorObject => {
  const data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);
  if (!validToken) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }

  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }

  const quizzes: quizObject[] = [];
  // Iterate through users quizzes and add their information to an array
  user.trash.forEach((quizId) => {
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

export const adminQuizRestore = (quizId: number, token: string): Record<string, never> | ErrorObject => {
  return {};
};

export const adminQuizTrashRemove = (token: string, quizIds: number[]): Record<string, never> | ErrorObject => {
  return {};
};

export const adminQuizTransfer = (quizId: number, token: string, userEmail: string): Record<string, never> | ErrorObject => {
  return {};
};

export const adminQuizQuestionCreate = (quizId: number, token: string, questionBody: QuestionBody): adminQuizQuestionCreateReturn | ErrorObject => {
  const data = getData();
  // console.log(questionBody);
  const validToken = data.tokens.find((item) => item.sessionId === token);
  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
  }

  const user = data.users.find((user) => user.userId === validToken.userId);
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }

  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `The quiz Id ${quizId} is invalid!`, statusCode: 400 };
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

  const questionId = generateQuestionId(data.questions);
  const questionObject: Question = {
    questionId: questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: [],
  };
  for (const answer of questionBody.answers) {
    const answerObject: Answer = {
      answerId: generateAnswerId(data.answers),
      answer: answer.answer,
      colour: getRandomColour(),
      correct: answer.correct,
    };
    questionObject.answers.push(answerObject);
  }
  quiz.questions.push(questionObject);
  // Must change timeLastEditied due to adding a question
  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
  quiz.timeLastEdited = unixtimeSeconds;

  quiz.duration += questionBody.duration;

  quiz.numQuestions++;

  console.log(questionObject);
  return { questionId: questionId };
};

export const adminQuizQuestionUpdate = (quizId: number, questionId: number, token: string, questionBody: QuestionBody): Record<string, never> | ErrorObject => {
  return {};
};

export const adminQuizQuestionDelete = (quizId: number, questionId: number, token: string): Record<string, never> | ErrorObject => {
  return {};
};

export const adminQuizQuestionMove = (quizId: number, questionId: number, token: string, newPosition: number): Record<string, never> | ErrorObject => {
  return {};
};

export const adminQuizQuestionDuplicate = (quizId: number, questionId: number, token: string): adminQuizQuestionDuplicateReturn | ErrorObject => {
  return { newQuestionId: 5546 };
};

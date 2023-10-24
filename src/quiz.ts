import { getData, setData, Question, QuestionBody, colours, Answer } from './dataStore';
import { generateQuizId } from './other';

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
    return { error: 'This is not a valid quizId', statusCode: 400};
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
  let data = getData();
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

export const adminQuizRestore = (token: string, quizId: number): Record<string, never> | ErrorObject => {
  const data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);

  // Check whether token is valid
  if (!validToken) {
    return { error: `The token ${token} is invalid!`, statusCode: 401 };
  }

  const user = data.users.find((user) => user.userId === validToken.userId);

  // Check whether user exists and is valid
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }

  // Check whether quiz with quizId exists in the trash
  const quizInTrash = user.trash.find((trashQuizId) => trashQuizId === quizId);

  if (!quizInTrash) {
    return { error: `The quiz Id ${quizId} is not in the trash!`, statusCode: 400 };
  }

  // Find the quiz object with the inputted Id
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  if (!quiz) {
    return { error: 'This is not a valid quizId', statusCode: 400 };
  }

  // Check if the name of the restored quiz is already used by another active quiz
  for (const existingQuiz of data.quizzes) {
    if (existingQuiz.name === quiz.name) {
      return { error: `The name ${quiz.name} is already used by another quiz!`, statusCode: 400 };
    }
  }

  // Restore the quiz by removing it from the trash and updating ownership
  user.trash = user.trash.filter((trashQuizId) => trashQuizId !== quizId);
  user.ownedQuizzes.push(quizId);

  setData(data);
  return {};
};

export const adminQuizTrashRemove = (token: string, quizIds: number[]): Record<string, never> | ErrorObject => {
  return {};
};

export const adminQuizTransfer = (quizId: number, token: string, userEmail: string): Record<string, never> | ErrorObject => {
  return {};
};

export const adminQuizQuestionCreate = (quizId: number, token: string, questionBody: QuestionBody): adminQuizQuestionCreateReturn | ErrorObject => {
  return { questionId: 5546 };
};

export const adminQuizQuestionUpdate = (quizId: number, questionId: number, token: string, questionBody: QuestionBody): Record<string, never> | ErrorObject => {
  let data = getData();
  const validToken = data.tokens.find((item) => item.sessionId === token);
  if (!validToken) {
    return { error: 'This is not a valid user token.', statusCode: 401 };
  }

  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    return { error: 'This is not a valid user token.', statusCode: 401 };
  }

  const validQuestionId = data.questions.find((question) => question.questionId === questionId);
  if (!validQuestionId) {
    return { error: 'The question Id refers to an invalid question within this quiz.', statusCode: 400 };
  }

  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `The quiz Id ${quizId} is invalid!`, statusCode: 400 };
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
  
  // Calculating quiz duration with new question duration
  const quiz = data.quizzes[quizId]; 
  const otherQuestionsDuration = quiz.duration - quiz.questions[questionId].duration;
  const newQuizDuration = otherQuestionsDuration + questionBody.duration;
  
  if (newQuizDuration > 3) {
    return { error: 'Quiz duration exceeds 3 minutes.', statusCode: 400 };
  }

  if (questionBody.points < 1) {
    return { error: 'The points are less than 1 (>1).', statusCode: 400 };
  }

  if (questionBody.points > 30) {
    return { error: 'The points are greater than 30 (<30).', statusCode: 400 };
  }

  let flag = false;
  for (let index in questionBody.answers) {
    if (questionBody.answers[index].answer.length < 1) {
      return { error: 'Answer length is less than 1 (>1).', statusCode: 400 };
    }

    if (questionBody.answers[index].answer.length > 30) {
      return { error: 'Answer length is greater than 3 (<30).', statusCode: 400 };
    }
    // Check for correct answer
    if (questionBody.answers[index].correct) {
      flag = true;
    }
  }

  if (!flag) {
    return { error: 'No correct answers.', statusCode: 401 };
  }

  // Check for duplicates
  for (let i = 0; i < questionBody.answers.length; i++) {
    for (let j = i + 1; j < questionBody.answers.length; j++) {
      if (questionBody.answers[i].answer == questionBody.answers[j].answer) {
        return { error: 'Duplicate answers.', statusCode: 400 };
      }
    }
  }

  const currentData = data.quizzes[quizId].questions[questionId];
  
  let tempAnswer: Answer; 
  const newAnswers: Answer[] = [];
  for (let index = 0; index < questionBody.answers.length; index++) {
    tempAnswer = { answerId: index, 
                   answer: questionBody.answers[index].answer, 
                   colour: colours.RED, 
                   correct: questionBody.answers[index].correct }
    newAnswers.push(tempAnswer);
  }
  currentData.answers = newAnswers;
  currentData.duration = questionBody.duration;
  currentData.points = questionBody.points;
  currentData.question = questionBody.question;
  
  data.quizzes[quizId].questions[questionId] = currentData;
  data.quizzes[quizId].duration = newQuizDuration;
  
  setData(data);
  return{};
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

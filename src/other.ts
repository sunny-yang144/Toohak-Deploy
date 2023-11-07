import { setData, getData, User, Quiz, colours, AnswerToken, QuestionToken, Token, DataStore } from './dataStore';
import { v4 as uuidv4 } from 'uuid';

export function clear (): Record<string, never> {
  setData({
    users: [],
    quizzes: [],
    tokens: [],
    questions: [],
    answers: [],
    sessions: [],
  });
  return {};
}

/**
 * @param { Quiz[] } idArray
 *
 * Takes in an array, finds the highest quizId then returns a number higher
 * than all current quizIds in the dataStore
 *
 * @returns { Number } Max + 1
 */
export function generateQuizId (idArray: Quiz[]) {
  if (idArray.length === 0) {
    return 0;
  }
  let max = idArray[0].quizId;
  for (const quiz of idArray) {
    if (quiz.quizId > max) {
      max = quiz.quizId;
    }
  }
  return max + 1;
}

/**
 * @param { Quiz[] } idArray
 *
 * Takes in an array, finds the highest Id then returns a number higher
 * than all current Ids in the array.
 *
 * @returns { Number } Max + 1
 */
export function generateQuestionId (idArray: QuestionToken[]) {
  if (idArray.length === 0) {
    return 0;
  }
  let max = idArray[0].questionId;
  for (const question of idArray) {
    if (question.questionId > max) {
      max = question.questionId;
    }
  }
  return max + 1;
}

/**
 * @param { Quiz[] } idArray
 *
 * Takes in an array, finds the highest Id then returns a number higher
 * than all current Ids in the array.
 *
 * @returns { Number } Max + 1
 */
export function generateAnswerId (idArray: AnswerToken[]) {
  if (idArray.length === 0) {
    return 0;
  }
  let max = idArray[0].answerId;
  for (const answer of idArray) {
    if (answer.answerId > max) {
      max = answer.answerId;
    }
  }
  return max + 1;
}

/**
 *
 * @param { User } user
 * Generates a sessionId, makes a new token and pushes it to the respective user,
 * then pushes to a tokens array with a reference to the user who owns the token.
 *
 * @returns { Number } Token
 */
export function generateToken (user: User) {
  const data = getData();
  const sessionId = uuidv4();
  const token = {
    sessionId: sessionId,
    userId: user.userId,
  };
  user.tokens.push(token);

  setData(data);
  return token;
}

/**
 * Returns a random colour from the enum selection
 * when called.
 *
 * @returns colours
 */
export function getRandomColour(): colours {
  const coloursObject = Object.values(colours);
  const randomIndex: number = Math.floor(Math.random() * coloursObject.length);
  return coloursObject[randomIndex];
}

export function getUserViaToken(token: string, data: DataStore): User {
  return data.users.find(u => u.tokens.some((t: Token) => t.sessionId === token));
}

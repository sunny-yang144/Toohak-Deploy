import { setData, getData, User, Quiz, colours, AnswerToken, QuestionToken, Token, DataStore, Session, actions, states } from './dataStore';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import request from 'sync-request-curl';
import HTTPError from 'http-errors';

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

export function getHashOf(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

export function isImageSync(url: string) {
  const response = request('GET', url);
  if (response.statusCode >= 400) {
    throw HTTPError(400, 'imgUrl when fetched does not return a valid file');
  }
  if (response.headers['content-type'] === 'image/jpeg' || response.headers['content-type'] === 'image/png') {
    return true;
  } else {
    throw HTTPError(400, 'imgUrl when fetch is not a JPG or PNG image');
  }
}

export function isValidAction(action: string, state: states) {
  if (!(['NEXT_QUESTION', 'SKIP_COUNTDOWN', 'GO_TO_ANSWER', 'GO_TO_FINAL_RESULTS', 'END'] as const).includes(action as actions)) {
    throw HTTPError(400, 'Action provided is not a valid Action');
  }
  let validActions: actions[];
  if (state === 'LOBBY') {
    validActions = ['NEXT_QUESTION', 'END'];
  } else if (state === 'QUESTION_COUNTDOWN') {
    validActions = ['SKIP_COUNTDOWN', 'END'];
  } else if (state === 'QUESTION_OPEN') {
    validActions = ['GO_TO_ANSWER', 'END'];
  } else if (state === 'QUESTION_CLOSE') {
    validActions = ['NEXT_QUESTION', 'GO_TO_ANSWER', 'GO_TO_FINAL_RESULTS', 'END'];
  } else if (state === 'ANSWER_SHOW') {
    validActions = ['NEXT_QUESTION', 'GO_TO_FINAL_RESULTS', 'END'];
  } else if (state === 'FINAL_RESULTS') {
    validActions = ['END'];
  } else if (state === 'END') {
    validActions = [];
  }
  if (!validActions.includes(action as actions)) {
    throw HTTPError(400, 'Action cannot be applied to current state');
  };
}

export function moveStates(session: Session, action: actions)  {
  isValidAction(action, session.state);
  if (action === 'END') {
    session.state = 'END';
    clearTimeout(session.qnTimeout);
  } else if (action === 'NEXT_QUESTION') {
    session.state = 'QUESTION_COUNTDOWN';
    session.atQuestion++;
  } else if (action === 'SKIP_COUNTDOWN') {
    session.state = 'QUESTION_OPEN';
    clearTimeout(session.qnTimeout);
  } else if (action === 'GO_TO_ANSWER') {
    session.state = 'ANSWER_SHOW';
    clearTimeout(session.qnTimeout);
  } else if (action === 'GO_TO_FINAL_RESULTS') {
    session.state = 'FINAL_RESULTS';
  }

  // Making the assumption that a quiz can only have one timeout at a time.
  if (session.state === 'QUESTION_OPEN') {
    const qnNum = session.atQuestion;
    const qnDuration = session.quiz.questions[qnNum].duration;
    const timeout = setTimeout(() => {
      session.state = 'QUESTION_CLOSE';
    }, qnDuration * 1000);
    session.qnTimeout = timeout;
  }
  if (session.state == 'QUESTION_COUNTDOWN') {
    const timeout = setTimeout(() => {
      session.state = 'QUESTION_CLOSE';
    }, 3 * 1000);
    session.qnTimeout = timeout;
  }
} 


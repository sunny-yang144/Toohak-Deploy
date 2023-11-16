
import validator from 'validator';
import HTTPError from 'http-errors';
import {
  getData,
  setData,
  User,
  Answer,
  Session,
  Message,
  MessageBody,
  Player,
} from './dataStore';
import {
  generateToken,
  getUserViaToken,
  generatePlayerId,
  getHashOf,
  verifyAndGenerateName,
  moveStates,
  round1DP,
  calculateRoundedAverage
} from './other';
import { UserScore, QuestionResult } from './quiz';

export interface ErrorObject {
  error: string;
  statusCode: number;
}
type EmptyObject = Record<string, never>;
interface adminUserDetailsReturn {
  user: {
    userId: number,
    name: string,
    email: string,
    numSuccessfulLogins: number,
    numFailedPasswordsSinceLastLogin: number,
  }
}
export interface adminAuthRegisterReturn {
  token: string
}
interface adminAuthLoginReturn {
  token: string
}

interface guestPlayerJoinReturn {
  playerId: number
}

interface guestPlayerStatusReturn {
  state: string;
  numQuestions: number;
  atQuestion: number;
}

type AnswersWithoutCorrect = Omit<Answer, 'correct'>;
interface currentQuestionInfoPlayerReturn {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl: string;
  points: number;
  answers: AnswersWithoutCorrect[];
}

interface questionResultsReturn {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

interface finalResultsReturn {
  usersRankedByScore: UserScore[];
  questionResults: QuestionResult[];
}

interface allChatMessagesReturn {
  messages: Message[];
}

/**
 * Creates a new user and logins in the user, by assigning a valid token.
 * Ensures email, password, and names are correct.
 *
 * @param email
 * @param password
 * @param nameFirst
 * @param nameLast
 * @returns adminAuthRegisterReutn | ErrorObject
 */
export const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string): adminAuthRegisterReturn | ErrorObject => {
  const data = getData();

  const searchEmail = data.users.find(user => user.email === email);

  if (searchEmail) {
    return { error: 'This email is already in use', statusCode: 400 };
  }
  if (!validator.isEmail(email)) {
    return { error: 'This is not a valid email', statusCode: 400 };
  }
  const pattern = /^[a-zA-Z\s\-']+$/;
  if (!pattern.test(nameFirst)) {
    return { error: 'This is not a valid first name', statusCode: 400 };
  }
  const firstNameLength = nameFirst.length;
  if ((firstNameLength < 2) || (firstNameLength > 20)) {
    return { error: 'This is not a valid first name', statusCode: 400 };
  }
  if (!pattern.test(nameLast)) {
    return { error: 'This is not a valid last name', statusCode: 400 };
  }
  const lastNameLength = nameLast.length;
  if ((lastNameLength < 2) || (lastNameLength > 20)) {
    return { error: 'This is not a valid last name', statusCode: 400 };
  }
  const passwordLength = password.length;
  if (passwordLength < 8) {
    return { error: 'This is not a valid password', statusCode: 400 };
  }
  const letterCheck = /[a-zA-Z]/;
  const numberCheck = /\d/;
  if (!(letterCheck.test(password) && numberCheck.test(password))) {
    return { error: 'This is not a valid password', statusCode: 400 };
  }
  const userId = data.users.length;
  const user: User = {
    userId: userId,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    password: getHashOf(password),
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    ownedQuizzes: [],
    oldPasswords: [],
    trash: [],
    tokens: [],
  };
  data.users.push(user);

  const token = generateToken(user);
  data.tokens.push(token);

  setData(data);
  return { token: token.sessionId };
};

/**
 * After user logs out, if email and password is correct,
 * logs user in by generating a token.
 * Also increments successful logins and if login fails,
 * increments failed passwords.
 *
 * @param email
 * @param password
 * @returns adminAuthLoginReturn | ErrorObject
 */
export const adminAuthLogin = (email: string, password: string): adminAuthLoginReturn | ErrorObject => {
  const data = getData();
  const user = data.users.find(user => user.email === email);
  if (!user) {
    return { error: `The given email ${email} does not exist`, statusCode: 400 };
  }
  if (user.password !== getHashOf(password)) {
    user.numFailedPasswordsSinceLastLogin += 1;
    setData(data);
    return { error: 'Incorrect password', statusCode: 400 };
  } else {
    user.numFailedPasswordsSinceLastLogin = 0;
  }
  user.numSuccessfulLogins += 1;

  const token = generateToken(user);
  data.tokens.push(token);

  setData(data);
  return { token: token.sessionId };
};

/**
 * Given a token, gives the client the details of a
 * user.
 *
 * @param token
 * @returns adminUserDetailsReturn | ErrorObject
 */
export const adminUserDetails = (token: string): adminUserDetailsReturn | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }

  return {
    user: {
      userId: user.userId,
      name: `${user.nameFirst} ${user.nameLast}`,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numSuccessfulLogins,
    },
  };
};

/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////////////// ITERATION 2 //////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Logs out a user, removing their token from the database
 *
 * @param token
 * @returns Empty | ErrorObject
 */
export const adminAuthLogout = (token: string): Record<string, never> | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  user.tokens = user.tokens.filter(t => t.sessionId !== token);
  data.tokens = data.tokens.filter(t => t.sessionId !== token);

  setData(data);
  return {};
};

/**
 * Updates a users details if a valid token can be provided and new details
 * are correct.
 *
 * @param token
 * @param email
 * @param nameFirst
 * @param nameLast
 * @returns Empty | ErrorObject
 */
export const adminUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string): Record<string, never> | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }

  if (data.users.some((u: User) => (u.email === email && u.userId !== user.userId))) {
    return { error: 'Email already in use', statusCode: 400 };
  }
  if (!validator.isEmail(email)) {
    return { error: 'This is not a valid email', statusCode: 400 };
  }
  const pattern = /^[a-zA-Z\s\-']+$/;
  if (!pattern.test(nameFirst)) {
    return { error: 'This is not a valid first name', statusCode: 400 };
  }
  const firstNameLength = nameFirst.length;
  if ((firstNameLength < 2) || (firstNameLength > 20)) {
    return { error: 'This is not a valid first name', statusCode: 400 };
  }
  if (!pattern.test(nameLast)) {
    return { error: 'This is not a valid first name', statusCode: 400 };
  }
  const lastNameLength = nameLast.length;
  if ((lastNameLength < 2) || (lastNameLength > 20)) {
    return { error: 'This is not a valid last name', statusCode: 400 };
  }

  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  setData(data);
  return {};
};

/**
 * Updates a users password given that a valid token is provided
 *
 * @param token
 * @param oldPassword
 * @param newPassword
 * @returns Empty | ErrorObject
 */
export const adminUserPasswordUpdate = (token: string, oldPassword: string, newPassword: string) : Record<string, never> | ErrorObject => {
  const data = getData();
  const user = getUserViaToken(token, data);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  if (user.password !== getHashOf(oldPassword)) {
    return { error: 'Incorrect old password', statusCode: 400 };
  }
  if (oldPassword === newPassword) {
    return { error: 'New password must be different from current password', statusCode: 400 };
  }
  if (user.oldPasswords.some((item) => item === getHashOf(newPassword))) {
    return { error: 'New password must be different from a password used before', statusCode: 400 };
  }
  const passwordLength = newPassword.length;
  if (passwordLength < 8) {
    return { error: 'This is not a valid password', statusCode: 400 };
  }
  const letterCheck = /[a-zA-Z]/;
  const numberCheck = /\d/;
  if (!(letterCheck.test(newPassword) && numberCheck.test(newPassword))) {
    return { error: 'This is not a valid password', statusCode: 400 };
  }

  user.password = getHashOf(newPassword);
  user.oldPasswords.push(getHashOf(oldPassword));
  setData(data);
  return {};
};

/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////// ITERATION 3 NEW ///////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////

export const guestPlayerJoin = (sessionId: number, name: string): guestPlayerJoinReturn => {
  const data = getData();
  const session = data.sessions.find((s: Session) => s.sessionId === sessionId);
  const newName = verifyAndGenerateName(name, session.players);
  if (session.state !== 'LOBBY') {
    throw HTTPError(400, 'Session is not in lobby state');
  }
  const playerId = generatePlayerId(data.players);
  const newPlayer: Player = {
    playerId,
    name: newName,
    score: 0,
    questionResults: {
      questionScore: [],
      questionRank: []
    }
  };
  session.players.push(newPlayer);
  data.players.push(newPlayer);
  if (session.autoStartNum !== 0) {
    if (data.players.length >= session.autoStartNum) {
      moveStates(session, 'NEXT_QUESTION');
    }
  }
  return { playerId };
};

export const guestPlayerStatus = (playerId: number): guestPlayerStatusReturn => {
  const data = getData();
  const player = data.players.find((p: Player) => p.playerId === playerId);
  if (!player) {
    throw HTTPError(400, 'The player ID does not exist');
  }
  const session = data.sessions.find((s: Session) => s.players.some((p: Player) => p.playerId === playerId));
  if (session !== undefined) {
    return {
      state: session.state,
      numQuestions: session.quiz.numQuestions,
      atQuestion: session.atQuestion
    };
  }
};

export const currentQuestionInfoPlayer = (playerId: number, questionPosition: number): currentQuestionInfoPlayerReturn => {
  const data = getData();
  const player = data.players.find((p: Player) => p.playerId === playerId);
  if (!player) {
    throw HTTPError(400, 'The player ID does not exist');
  }
  const session = data.sessions.find((s: Session) => s.players.some((p: Player) => p.playerId === playerId));
  if (session !== undefined) {
    if (session.quiz.numQuestions < questionPosition) {
      throw HTTPError(400, 'The question position is invalid for the session this player is in');
    }
    if (session.atQuestion !== questionPosition) {
      throw HTTPError(400, 'The session is currently not on this question');
    }
    if (session.state === 'LOBBY' || session.state === 'END') {
      throw HTTPError(400, 'The session is in lobby or end state(invalid).');
    }
    return session.quiz.questions[questionPosition - 1];
  }
};

export const playerAnswers = (answerIds: number[], playerId: number, questionPosition: number): EmptyObject => {
  const data = getData();
  const player = data.players.find((p: Player) => p.playerId === playerId);
  if (!player) {
    throw HTTPError(400, 'The player ID does not exist');
  }
  const session = data.sessions.find((s: Session) => s.players.some((p: Player) => p.playerId === playerId));
  if (session !== undefined) {
    if (session.quiz.numQuestions < questionPosition) {
      throw HTTPError(400, 'The question position is invalid for the session this player is in');
    } else if (session.atQuestion !== questionPosition) {
      throw HTTPError(400, 'The session is currently not on this question');
    } else if (session.state !== 'QUESTION_OPEN') {
      throw HTTPError(400, 'The question is not in QUESTION_OPEN so player cannot answer.');
    } else if (answerIds.length < 1) {
      throw HTTPError(400, 'Less than 1 answer ID was submitted');
    }
    const uniqueAnswers = Array.from(new Set(answerIds));
    if (uniqueAnswers.length !== answerIds.length) {
      throw HTTPError(400, 'Duplicate answer IDs provided');
    }

    // Since array index starts at 1, questionPosition 1 is index 0;
    const qnPosition = questionPosition - 1;
    for (const answerId of answerIds) {
      if (!session.quiz.questions[qnPosition].answers.some((a: Answer) => a.answerId === answerId)) {
        throw HTTPError(400, 'The answer IDs are invalid for this particular question');
      }
    }
    // Calculate the number of correct answers
    const question = session.quiz.questions[qnPosition];
    let targetCorrect = 0;
    for (const answer of question.answers) {
      if (answer.correct === true) targetCorrect++;
    }
    // If a submitted answer is correct then decrement. At the end we should have 0 if player
    // selects all right answers
    for (const answerId of answerIds) {
      const answer = question.answers.find((a: Answer) => a.answerId === answerId);
      if (answer.correct === true) targetCorrect--;
    }
    if (targetCorrect === 0) {
      const SesResult = session.questionResults[qnPosition];
      SesResult.questionId = question.questionId;
      SesResult.playersCorrectList.push(player.name);

      const timeTaken = Math.floor((Date.now() - session.qnStartTime) * 1000);
      SesResult.AnswersTimes.push(timeTaken);

      const index = SesResult.playersCorrectList.indexOf(player.name);
      const score = round1DP(question.points / (index + 1));
      const rank = index + 1;

      const sesPlayer = session.players.find((p: Player) => p.playerId === playerId);
      sesPlayer.questionResults.questionScore[qnPosition] = score;
      sesPlayer.questionResults.questionRank[qnPosition] = rank;
      player.questionResults.questionScore[qnPosition] = score;
      player.questionResults.questionRank[qnPosition] = rank;
    }
    return {};
  }
};

export const questionResults = (playerId: number, questionPosition: number): questionResultsReturn | ErrorObject => {
  const data = getData();
  const player = data.players.find((p: Player) => p.playerId === playerId);
  if (!player) {
    throw HTTPError(400, 'The player ID does not exist');
  }
  const session = data.sessions.find((s: Session) => s.players.some((p: Player) => p.playerId === playerId));
  if (session !== undefined) {
    if (session.quiz.numQuestions < questionPosition) {
      throw HTTPError(400, 'The question position is invalid for the session this player is in');
    }
    if (session.state !== 'ANSWER_SHOW') {
      throw HTTPError(400, 'The session is not in ANSWER_SHOW state.');
    }
    if (session.atQuestion !== questionPosition) {
      throw HTTPError(400, 'The session is currently not on this question');
    }
    const qnPosition = questionPosition - 1;
    let qnResult: questionResultsReturn;
    qnResult.questionId = session.questionResults[qnPosition].questionId;
    qnResult.playersCorrectList = session.questionResults[qnPosition].playersCorrectList;
    qnResult.averageAnswerTime = calculateRoundedAverage(session.questionResults[qnPosition].AnswersTimes);
    qnResult.percentCorrect = Math.round((session.questionResults[qnPosition].playersCorrectList.length / session.players.length) * 100);
    return qnResult;
  }
};

export const finalResults = (playerId: number): finalResultsReturn | ErrorObject => {
  const data = getData();
  const player = data.players.find((p: Player) => p.playerId === playerId);
  if (!player) {
    throw HTTPError(400, 'The player ID does not exist');
  }
  const session = data.sessions.find((s: Session) => s.players.some((p: Player) => p.playerId === playerId));
  if (session !== undefined) {
    if (session.state !== 'FINAL_RESULTS') {
      throw HTTPError(400, 'The session is not in FINAL_RESULTS state.');
    }
    const SesResult: finalResultsReturn = {
      usersRankedByScore: [],
      questionResults: []
    };

    for (let i = 0; i < SesResult.questionResults.length; i++) {
      SesResult.questionResults[i].questionId = session.questionResults[i].questionId;
      SesResult.questionResults[i].playersCorrectList = session.questionResults[i].playersCorrectList;
      SesResult.questionResults[i].averageAnswerTime = calculateRoundedAverage(session.questionResults[i].AnswersTimes);
      SesResult.questionResults[i].percentCorrect = Math.round((session.questionResults[i].playersCorrectList.length / session.players.length) * 100);
    }

    const unsortedScores: UserScore[] = session.players.map((p: Player) => ({ name: p.name, score: p.score }));
    SesResult.usersRankedByScore = unsortedScores.sort((a, b) => b.score - a.score);

    return SesResult;
  }
};

export const allChatMessages = (playerId: number): allChatMessagesReturn | ErrorObject => {
  const data = getData();
  const existingPlayerId = data.players.map((p: Player) => p.playerId).includes(playerId);
  if (!existingPlayerId) {
    throw HTTPError(400, 'Player ID does not exist!');
  }
  const playerSession = data.sessions.find(session => session.players.some(player => player.playerId === playerId));
  const allMessages: allChatMessagesReturn = {
    messages: [],
  };
  for (let i = 0; i < playerSession.messages.length; i++) {
    allMessages.messages.push(playerSession.messages[i]);
  }
  return allMessages;
};

export const sendChatMessages = (playerId: number, message: MessageBody): Record<string, never> | ErrorObject => {
  //  When I run stuff it says the quiz does not have any questions in it
  const data = getData();
  const existingPlayerId = data.players.map((p: Player) => p.playerId).includes(playerId);
  if (!existingPlayerId) {
    throw HTTPError(400, 'Player ID does not exist!');
  }
  if (message.messageBody.length === 0) {
    throw HTTPError(400, 'Message body is less than 1 character');
  }
  if (message.messageBody.length > 100) {
    throw HTTPError(400, 'Message body is greater than 100 characters');
  }
  const playerSession = data.sessions.find(session => session.players.some(player => player.playerId === playerId));
  const player = playerSession.players.find((p: Player) => p.playerId === playerId);
  const currentTime = new Date();
  const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
  const newMessage: Message = {
    playerId,
    messageBody: message.messageBody,
    playerName: player.name,
    timeSent: unixtimeSeconds,
  };
  playerSession.messages.push(newMessage);

  return {};
};

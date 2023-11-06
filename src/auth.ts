import validator from 'validator';
import {
  colours,
  getData,
  setData,
  User,
  Answer,
  Message,
  MessageBody,
} from './dataStore';
import { generateToken, getUserViaToken } from './other';
import { UserScore, QuestionResult } from './quiz';

interface ErrorObject {
  error: string;
  statusCode: number;
}
interface adminUserDetailsReturn {
  user: {
    userId: number,
    name: string,
    email: string,
    numSuccessfulLogins: number,
    numFailedPasswordsSinceLastLogin: number,
  }
}
interface adminAuthRegisterReturn {
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
    password: password,
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
  if (user.password !== password) {
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
    return { error: 'This is not a valid last name', statusCode: 400 };
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

  if (user.password !== oldPassword) {
    return { error: 'Incorrect old password', statusCode: 400 };
  }
  if (oldPassword === newPassword) {
    return { error: 'New password must be different from current password', statusCode: 400 };
  }
  if (user.oldPasswords.some((item) => item === newPassword)) {
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

  user.password = newPassword;
  user.oldPasswords.push(oldPassword);
  setData(data);
  return {};
};

/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////// ITERATION 3 NEW ///////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////

// """""" MAYBE THIS SHOULD BE MOVED INTO a new folder such as players.ts """""" //

export const guestPlayerJoin = (sessionId: number, name: string): guestPlayerJoinReturn | ErrorObject => {
  return {
    playerId: 5546
  };
};

export const guestPlayerStatus = (playerId: number): guestPlayerStatusReturn | ErrorObject => {
  return {
    state: 'LOBBY',
    numQuestions: 1,
    atQuestion: 3
  };
};

export const currentQuestionInfoPlayer = (playerId: number, questionPosition: number): currentQuestionInfoPlayerReturn | ErrorObject => {
  return {
    questionId: 5546,
    question: 'Who is the Monarch of England?',
    duration: 4,
    thumbnailUrl: 'http://google.com/some/image/path.jpg',
    points: 5,
    answers: [
      {
        answerId: 2384,
        answer: 'Prince Charles',
        colour: colours.RED
      }
    ]
  };
};

export const playerAnswers = (answerIds: number[], playerId: number, questionPosition: number): Record<string, never> | ErrorObject => {
  return {};
};

export const questionResults = (playerId: number, questionPostion: number): questionResultsReturn | ErrorObject => {
  return {
    questionId: 5546,
    playersCorrectList: [
      'Hayden'
    ],
    averageAnswerTime: 45,
    percentCorrect: 54
  };
};

export const finalResults = (playerId: number): finalResultsReturn | ErrorObject => {
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

export const allChatMessages = (playerId: number): allChatMessagesReturn | ErrorObject => {
  return {
    messages: [
      {
        messageBody: 'This is a message body',
        playerId: 5546,
        playerName: 'Yuchao Jiang',
        timeSent: 1683019484
      }
    ]
  };
};

export const sendChatMessages = (playerId: number, message: MessageBody): Record<string, never> | ErrorObject => {
  return {};
};

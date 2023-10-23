import { isTemplateExpression } from 'typescript';
import validator from 'validator';
import { getData, setData, User } from './dataStore';
import { generateToken } from './other';

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
    numSuccessfulLogins: 0,
    numFailedPasswordsSinceLastLogin: 0,
    ownedQuizzes: [],
    tokens: [],
  };
  data.users.push(user);

  const token = generateToken(user);
  data.tokens.push(token);

  setData(data);
  return { token: token.sessionId };
};
/*
Returns authUserId given a valid registered user email and password
Returns error if:
  - Email address does not exist
  - Password is not correct for given email
*/
export const adminAuthLogin = (email: string, password: string): adminAuthLoginReturn | ErrorObject => {
  const data = getData();
  const user = data.users.find(user => user.email === email);
  if (!user) {
    return { error: `The given email ${email} does not exist`, statusCode: 400 };
  }
  if (user.password !== password) {
    user.numFailedPasswordsSinceLastLogin += 1;
    return { error: 'Incorrect password', statusCode: 400 };
  }
  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins += 1;

  const token = generateToken(user);

  setData(data);
  return { token: token.sessionId };
};

export const adminUserDetails = (token: string): adminUserDetailsReturn | ErrorObject => {
  const data = getData();

  const validToken = data.tokens.find((item) => item.sessionId === token);
  if (!validToken) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }

  const user = data.users.find((user) => user.userId === validToken.userId);
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

export const adminAuthLogout = (token: string): Record<string, never> | ErrorObject => {
  let data = getData();
  
  const validToken = data.tokens.find((item) => item.sessionId === token);
  if (!validToken) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }
  else {
    // We need to remove the tokens from the users and the data's tracking of tokens
    // Therefore we find the index of the item in the respective arrays.

    const user = data.users.find((item) => item.userId === validToken.userId);
    const validUserToken = user.tokens.find((item) => item.sessionId === token);
    if (!validUserToken) {
      return { error: 'This is not a valid user token', statusCode: 401 };
    }

    const tokenIndex = data.tokens.indexOf(validToken);
    const userTokenIndex = user.tokens.indexOf(validUserToken);

    // If an index exists which we assume does if the token is valid, then we splice to remove the item
    if ( tokenIndex !== -1 ) {
      data.tokens.splice(tokenIndex, 1);
    }

    if ( userTokenIndex !== -1 ) {
      user.tokens.splice(userTokenIndex, 1);
    }
  }

  setData(data);
  return {};
};

export const adminUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string): Record<string, never> | ErrorObject => {
  const data = getData();

  // Derive user from the token by that logic this error should trigger first.
  const validToken = data.tokens.find((item) => item.sessionId === token);
  if (!validToken) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }

  const user = data.users.find((user) => user.userId === validToken.userId);
  if (!user) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }

  const searchEmail = data.users.find(item => item.email === email && item.userId !== user.userId);

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

  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  setData(data);
  return {};
};

export const adminUserPasswordUpdate = (token: string, oldPassword: string, newPassword: string) : Record<string, never> | ErrorObject => {
  return {};
};

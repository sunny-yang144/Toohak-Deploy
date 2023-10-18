import validator from 'validator';
import { getData, setData, User, Quiz } from './dataStore'
import { generateToken } from './other'


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
  let data = getData();
  const searchEmail = data.users.find(searchEmail => searchEmail.email === email);
  
  if (searchEmail) {
    return {error: 'This email is already in use', statusCode: 400}
  }
  if (!validator.isEmail(email)) {
    return {error: 'This is not a valid email', statusCode: 400}
  }
  var pattern = /^[a-zA-Z\s\-']+$/;
  if (!pattern.test(nameFirst)) {
    return {error: 'This is not a valid first name', statusCode: 400}
  }
  const firstNameLength = nameFirst.length;
  if ((firstNameLength < 2) || (firstNameLength > 20)) {
    return {error: 'This is not a valid first name', statusCode: 400}
  }
  if (!pattern.test(nameLast)) {
    return {error: 'This is not a valid last name', statusCode: 400}
  }
  const lastNameLength = nameLast.length;
  if ((lastNameLength < 2) || (lastNameLength > 20)) {
    return {error: 'This is not a valid last name', statusCode: 400}
  }
  const passwordLength = password.length;
  if (passwordLength < 8) {
    return {error: 'This is not a valid password', statusCode: 400}
  }
  const letterCheck = /[a-zA-Z]/;
  const numberCheck= /\d/;
  if (!(letterCheck.test(password) && numberCheck.test(password))) {
    return {error: 'This is not a valid password', statusCode: 400}
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
  const tokenStr = token.sessionId.toString();

  setData(data);
  return { token: tokenStr }
}
/* 
Returns authUserId given a valid registered user email and password
Returns error if:
  - Email address does not exist
  - Password is not correct for given email
*/
export const adminAuthLogin = (email: string, password: string ): adminAuthLoginReturn | ErrorObject => {
  let data = getData();
  const user = data.users.find(user => user.email === email);
  if (!user) {
    return { error: `The given email ${email} does not exist`, statusCode: 400};
  }
  if (user.password !== password) {
    user.numFailedPasswordsSinceLastLogin += 1;
    return { error: 'Incorrect password', statusCode: 400};
  }
  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins += 1;
  
  const token = generateToken(user);
  const tokenStr = token.sessionId.toString();

  setData(data);
  return { token: tokenStr };
}

export const adminUserDetails = (token: string): adminUserDetailsReturn | ErrorObject => {
  const data = getData();
  console.log(token);
  const validToken = data.tokens.find((item) => item.sessionId === token);
  console.log(data.tokens);
  console.log(validToken);
  if (!validToken) {
    return { error: 'This is not a valid user token', statusCode: 401 };
  }

  const { user } = validToken;
  const { userId, nameFirst, nameLast, email, numSuccessfulLogins, numFailedPasswordsSinceLastLogin } = user;

  return {
    user: {
      userId,
      name: `${nameFirst} ${nameLast}`,
      email,
      numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin,
    },
  };
};

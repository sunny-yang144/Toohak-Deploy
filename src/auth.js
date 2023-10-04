import validator from 'validator';
import { getData, setData } from './dataStore.js'

export function adminUserDetails ( authUserId ) {
  let data = getData();
  const user = data.users.find(user => user.userId === authUserId);
  if (!user) {
    return {error: 'This is not a valid UserId'}
  } else {
    return { user:
      {
        userId: authUserId,
        name: `${user.nameFirst} ${user.nameLast}`,
        email: user.email,
        numSuccessfulLogins: user.numSuccessfulLogins,
        numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
      }
    }
  }
}

export function adminAuthRegister( email, password, nameFirst, nameLast ) {
  let data = getData();
  const searchEmail = data.users.find(searchEmail => searchEmail.email === email);
  
  if (searchEmail) {
    return {error: 'This email is already in use'}
  }
  if (!validator.isEmail(email)) {
    return {error: 'This is not a valid email'}
  }
  var pattern = /^[a-zA-Z\s\-']+$/;
  if (!pattern.test(nameFirst)) {
    return {error: 'This is not a valid first name'}
  }
  const firstNameLength = nameFirst.length;
  if ((firstNameLength < 2) || (firstNameLength > 20)) {
    return {error: 'This is not a valid first name'}
  }
  if (!pattern.test(nameLast)) {
    return {error: 'This is not a valid last name'}
  }
  const lastNameLength = nameLast.length;
  if ((lastNameLength < 2) || (lastNameLength > 20)) {
    return {error: 'This is not a valid last name'}
  }
  const passwordLength = password.length;
  if (passwordLength < 8) {
    return {error: 'This is not a valid password'}
  }
  const letterCheck = /[a-zA-Z]/;
  const numberCheck= /\d/;
  if (!(letterCheck.test(password) && numberCheck.test(password))) {
    return {error: 'This is not a valid password'}
  }
  const userId = data.users.length;
  const user = {
    userId: userId,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    password: password,
    numSuccessfulLogins: 0,
    numFailedPasswordsSinceLastLogin: 0,
    ownedQuizzes: [],
  };
  data.users.push(user);
  setData(data);
  
  return {
    authUserId: userId
  }
}

/* 
Returns authUserId given a valid registered user email and password
Returns error if:
  - Email address does not exist
  - Password is not correct for given email
*/
export function adminAuthLogin ( email, password ) {
  let data = getData();
  // Find user with email
  const userWithEmail = data.users.find(user => user.email === email);

  // First check if email is valid
  if (!userWithEmail) {
    return { error: `The given email ${email} does not exist`};
  }

  // Then check if password is correct for email
  if (userWithEmail.password !== password) {
    return { error: 'Incorrect password'};
  }

  // Return authUserId if success
  return {
    authUserId: userWithEmail.userId
  };
}
import isEmail from 'validator/lib/isEmail';

function adminUserDetails ( authUserId ) {
  let data = getData();
  const user = dataStore.users.find(user => user.authUserId === authUserId);
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

function adminAuthRegister( email, password, nameFirst, nameLast ) {
  let data = getData();
  const searchEmail = dataStore.users.find(searchEmail => searchEmail.email === email);
  
  if (!searchEmail) {
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
  let user = {
    authUserId: dataStore.users.length,
    email: email,
    nameFirst: name,
    nameLast: name,
    password: password,
  };
  dataStore.users.push(user);
  return {
    authUserId: authUserId
  }
}

function adminAuthLogin ( email, password ) {
  return {
    authUserId: 1
  }
}
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
  return {
    authUserId: 1
  }
}

function adminAuthLogin ( email, password ) {
  return {
    authUserId: 1
  }
}
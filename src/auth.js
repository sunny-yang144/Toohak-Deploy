function adminUserDetails ( authUserId ) {
    return { user:
        {
          userId: 1,
          name: 'Hayden Smith',
          email: 'hayden.smith@unsw.edu.au',
          numSuccessfulLogins: 3,
          numFailedPasswordsSinceLastLogin: 1,
        }
      }
}

function adminAuthRegister( email, password, nameFirst, nameLast ) {
    return {
        authUserId: 1
      }
}
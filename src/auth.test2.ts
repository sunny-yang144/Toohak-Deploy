import request from 'sync-request-curl';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

function requestAdminUserDetailsUpdate(token: number, email: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/details',
    {
      json: {
        token,
        email,
        nameFirst,
        nameLast,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  }
}

function requestAdminUserPasswordUpdate(token: number, oldPassword: string, newPassword: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/password',
    {
      json: {
        token,
        oldPassword,
        newPassword,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  }
}

function requestAdminQuizTransfer(token: number, userEmail: string, quizId: number) {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
    {
      json: {
        token,
        userEmail,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  }
}

enum validDetails {
  EMAIL = 'helloworld@gmail.com',
  PASSWORD = '1234UNSW',
  NAMEFIRST = 'Jack',
  NAMELAST = 'Rizzella',
  EMAIL2 = 'worldhello@gmail.com',
  PASSWORD2 = '4321UNSW',
  NAMEFIRST2 = 'Jamie',
  NAMELAST2 = 'Oliver',
  QUIZNAME = 'World Quiz',
  QUIZDESCRIPTION = 'About flags, countries and capitals!',
  QUIZNAME2 = 'Soccer Quiz',
  QUIZDESCRIPTION2 = 'GOOOAAAALLLL (Part 2)'
}

describe('Testing adminUserDetails', () => {
  test('Successful adminUserDetails Update', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(user.body.token, validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    // Check if function returns any errors
    expect(result.body).toStrictEqual({});
    expect(result.statusCode).toStrictEqual(200);
    // Check if parameters were updated
    expect(adminUserDetails(user.body.token)).toStrictEqual
    ({ user:
      {
        userId: user.authUserId,
        name: 'Jamie Oliver',
        email: 'worldhello@gmail.com',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }
    });
  });

  test('Unsuccessful call, email2 is not valid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, 'invalidEmail@fake.com', validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameFirst contains invalid characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, validDetails.EMAIL2, 'J&m!e', validDetails.NAMELAST2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameFirst contains less than 2 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, validDetails.EMAIL2, 'J', validDetails.NAMELAST2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameFirst contains more than 20 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, validDetails.EMAIL2, 'j'.repeat(21), validDetails.NAMELAST2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameLast contains invalid characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, validDetails.EMAIL2, validDetails.NAMEFIRST2, 'Ol!v#r');
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameLast contains less than 2 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, validDetails.EMAIL2, validDetails.NAMEFIRST2, 'O');
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameLast contains more than 20 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, validDetails.EMAIL2, validDetails.NAMEFIRST2, 'O'.repeat(21));
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, token is empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(parseInt(''), validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(401);
  });
  test('Unsuccessful call, token is invalid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(parseInt('-666'), validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(401);
  });
});

describe('Testing adminUserPasswordUpdate', () => {
  test('Successful adminUserPasswordUpdate', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserPasswordUpdate(userLogin.body, validDetails.PASSWORD, validDetails.PASSWORD2)
    // Check if function returns any errors
    expect(result.body).toStrictEqual({});
    expect(result.statusCode).toStrictEqual(200);
    // Check if parameters were actually updated
    expect(requestAdminAuthLogout(user.body.token)).toStrictEqual({});
    expect(requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD2)).toStrictEqual({ token: expect.any(Number) });
  });
  test('Unsuccessful call, oldPassword is not the correct oldPassword', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserPasswordUpdate(userLogin.body, 'wrongPassword1', validDetails.PASSWORD2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, oldPassword and newPassword match exactly', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserPasswordUpdate(userLogin.body, validDetails.PASSWORD, validDetails.PASSWORD);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, newPassword has already been used before by this user', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserPasswordUpdate(userLogin.body, validDetails.PASSWORD, validDetails.PASSWORD2);
    const result2 = requestAdminUserPasswordUpdate(userLogin.body, validDetails.PASSWORD2, validDetails.PASSWORD);
    expect(result2.body).toStrictEqual({ error: expect.any(String) });
    expect(result2.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, newPassword has less than 8 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserPasswordUpdate(userLogin.body, validDetails.PASSWORD, '2Short');
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, newPassword does not contain at least one number', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserPasswordUpdate(userLogin.body, validDetails.PASSWORD, 'noNumbers');
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, newPassword foes not contain at least one letter', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserPasswordUpdate(userLogin.body, validDetails.PASSWORD, '12345678');
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, token is empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserPasswordUpdate(parseInt(''), validDetails.PASSWORD, validDetails.PASSWORD);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(401);
  });
  test('Unsuccessful call, token is invalid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserPasswordUpdate(parseInt('-666'), validDetails.PASSWORD, validDetails.PASSWORD);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(401);
  });
});

describe('Testing adminQuizTransfer', () => {
  test('Successful adminQuizTransfer', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const userLogin2 = requestAdminAuthLogin(validDetails.EMAIL2, validDetails.PASSWORD2);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const result = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL2, quizId1);
    // Check if function returns any errors
    expect(result.body).toStrictEqual({});
    expect(result.statusCode).toStrictEqual(200);
    // Confirm user1 no longer has quiz while user2 does
    expect(adminQuizList(user.body.token)).toStrictEqual
    ({ quizzes: 
      {}
    });
    expect(adminQuizList(user.body.token)).toStrictEqual
    ({ quizzes: 
      {
        quizId: quizId1,
        name: validDetails.QUIZNAME
      }
    });
  });
  test('Unsuccessful adminQuizTransfer, quizId does not refer to a valid quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const userLogin2 = requestAdminAuthLogin(validDetails.EMAIL2, validDetails.PASSWORD2);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const result = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL2, parseInt('-666'));
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful adminQuizTransfer, quizId does not refer to a quiz that this user owns', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const userLogin2 = requestAdminAuthLogin(validDetails.EMAIL2, validDetails.PASSWORD2);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizId2 = requestAdminQuizCreate(user2.body.token, validDetails.QUIZNAME2, validDetails.QUIZDESCRIPTION2);
    const result = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL2, quizId2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful adminQuizTransfer, userEmail is not a real user', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const userLogin2 = requestAdminAuthLogin(validDetails.EMAIL2, validDetails.PASSWORD2);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const result = requestAdminQuizTransfer(user.body.token, 'notRealUser@gmail.com', quizId1);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful adminQuizTransfer, userEmail is the current logged in user', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const userLogin2 = requestAdminAuthLogin(validDetails.EMAIL2, validDetails.PASSWORD2);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const result = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL, quizId1);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful adminQuizTransfer, quizId refers to a quiz that has a name that is already used by the target user', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const userLogin2 = requestAdminAuthLogin(validDetails.EMAIL2, validDetails.PASSWORD2);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizId2 = requestAdminQuizCreate(user2.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION2);
    const result = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL2, quizId1);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful adminQuizTransfer, all sessions for this quiz must be in END state', () => {
  });
  test('Unsuccessful adminQuizTransfer, token is empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const userLogin2 = requestAdminAuthLogin(validDetails.EMAIL2, validDetails.PASSWORD2);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const result = requestAdminQuizTransfer(parseInt(''), validDetails.EMAIL2, quizId1);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(401);
  });
  test('Unsuccessful adminQuizTransfer, token is invalid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const userLogin2 = requestAdminAuthLogin(validDetails.EMAIL2, validDetails.PASSWORD2);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const result = requestAdminQuizTransfer(parseInt('-666'), validDetails.EMAIL2, quizId1);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(401);
  });
  test('Unsuccessful adminQuizTransfer, token is valid but user does not own this quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const userLogin2 = requestAdminAuthLogin(validDetails.EMAIL2, validDetails.PASSWORD2);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizId2 = requestAdminQuizCreate(user2.body.token, validDetails.QUIZNAME2, validDetails.QUIZDESCRIPTION2);
    const result = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL2, quizId2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(403);
  });
});
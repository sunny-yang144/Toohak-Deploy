import {
  requestAdminAuthRegister,
  requestAdminAuthLogin,
  requestAdminUserDetails,
  requestAdminUserDetailsUpdate,
  requestAdminUserPasswordUpdate,
  requestAdminAuthLogout,
  clear,
} from '../test-helpers';

import { v4 as uuidv4 } from 'uuid';

enum validDetails {
  EMAIL = 'helloworld@gmail.com',
  PASSWORD = '1234UNSW',
  NAMEFIRST = 'Jack',
  NAMELAST = 'Rizzella',
  EMAIL2 = 'helloworld1@gmail.com',
  PASSWORD2 = '4321UNSW',
  NAMEFIRST2 = 'Jamie',
  NAMELAST2 = 'Oliver',
}

// Clears any lingering data elements before each test group
// eliminates any unexpected bugs.
beforeEach(() => {
  clear();
});

afterAll(() => {
  clear();
});

describe('Tests for adminAuthLogout', () => {
  test('Successful logout', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    // check if user is logged in
    expect(userLogin.body).toStrictEqual({ token: expect.any(String) });

    // Logout user
    const logoutReturn = requestAdminAuthLogout(user.body.token);
    expect(logoutReturn.body).toStrictEqual({});
    expect(logoutReturn.statusCode).toStrictEqual(200);

    // check if user can use functions
    const getUserDetails = requestAdminUserDetails(user.body.token);
    expect(getUserDetails.body).toStrictEqual({ error: expect.any(String) });
    expect(getUserDetails.statusCode).toStrictEqual(401);
  });

  test('Token is empty or invalid', () => {
    requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response1 = requestAdminAuthLogout('');
    expect(response1.body).toStrictEqual({ error: expect.any(String) });
    expect(response1.statusCode).toStrictEqual(401);

    const invalidId = uuidv4();
    const response2 = requestAdminAuthLogout(invalidId);
    expect(response2.body).toStrictEqual({ error: expect.any(String) });
    expect(response1.statusCode).toStrictEqual(401);
  });
});

describe('Testing adminUserDetailsUpdate', () => {
  test('Successful adminUserDetails Update', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetailsUpdate(user.body.token, validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    // Check if function returns any errors
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Check if parameters were updated

    const detailsCheck = requestAdminUserDetails(user.body.token);
    expect(detailsCheck.body).toStrictEqual(
      {
        user:
        {
          userId: expect.any(Number),
          name: `${validDetails.NAMEFIRST2} ${validDetails.NAMELAST2}`,
          email: validDetails.EMAIL2,
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      }
    );
  });

  test('Unsuccessful call, email2 is not valid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetailsUpdate(user.body.token, 'helloworld@VeryLegitEmailscom', validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameFirst contains invalid characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetailsUpdate(user.body.token, validDetails.EMAIL2, 'J&m!e', validDetails.NAMELAST2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameFirst contains less than 2 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetailsUpdate(user.body.token, validDetails.EMAIL2, 'J', validDetails.NAMELAST2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameFirst contains more than 20 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetailsUpdate(user.body.token, validDetails.EMAIL2, 'j'.repeat(21), validDetails.NAMELAST2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameLast contains invalid characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetailsUpdate(user.body.token, validDetails.EMAIL2, validDetails.NAMEFIRST2, 'Ol!v#r');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameLast contains less than 2 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetailsUpdate(user.body.token, validDetails.EMAIL2, validDetails.NAMEFIRST2, 'O');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameLast contains more than 20 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetailsUpdate(user.body.token, validDetails.EMAIL2, validDetails.NAMEFIRST2, 'O'.repeat(21));
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, token is empty', () => {
    requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetailsUpdate('', validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });
  test('Unsuccessful call, token is invalid', () => {
    requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetailsUpdate('-666', validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });
});

describe('Testing adminUserPasswordUpdate', () => {
  test('Successful adminUserPasswordUpdate', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserPasswordUpdate(user.body.token, validDetails.PASSWORD, validDetails.PASSWORD2);
    // Check if function returns any errors
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Check if parameters were actually updated
    expect(requestAdminAuthLogout(user.body.token).body).toStrictEqual({});
    expect(requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD2).body).toStrictEqual({ token: expect.any(String) });
  });
  test('Unsuccessful call, oldPassword is not the correct oldPassword', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserPasswordUpdate(user.body.token, 'wrongPassword1', validDetails.PASSWORD2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, oldPassword and newPassword match exactly', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserPasswordUpdate(user.body.token, validDetails.PASSWORD, validDetails.PASSWORD);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, newPassword has already been used before by this user', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminUserPasswordUpdate(user.body.token, validDetails.PASSWORD, validDetails.PASSWORD2);
    const result2 = requestAdminUserPasswordUpdate(user.body.token, validDetails.PASSWORD2, validDetails.PASSWORD);
    expect(result2.body).toStrictEqual({ error: expect.any(String) });
    expect(result2.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, newPassword has less than 8 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserPasswordUpdate(user.body.token, validDetails.PASSWORD, '2Short');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, newPassword does not contain at least one number', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserPasswordUpdate(user.body.token, validDetails.PASSWORD, 'noNumbers');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, newPassword foes not contain at least one letter', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserPasswordUpdate(user.body.token, validDetails.PASSWORD, '12345678');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, token is empty', () => {
    requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserPasswordUpdate('', validDetails.PASSWORD, validDetails.PASSWORD);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });
  test('Unsuccessful call, token is invalid', () => {
    requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserPasswordUpdate('-666', validDetails.PASSWORD, validDetails.PASSWORD);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });
});

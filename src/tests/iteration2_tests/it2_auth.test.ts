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
// Valid Details
enum VD {
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
  let user: {
    body: {token: string},
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
  });
  test('Successful logout', () => {
    const userLogin = requestAdminAuthLogin(VD.EMAIL, VD.PASSWORD);
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
  let user: {
    body: {token: string},
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
  });
  test('Successful adminUserDetails Update', () => {
    const response = requestAdminUserDetailsUpdate(user.body.token, VD.EMAIL2, VD.NAMEFIRST2, VD.NAMELAST2);
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
          name: `${VD.NAMEFIRST2} ${VD.NAMELAST2}`,
          email: VD.EMAIL2,
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      }
    );
  });

  test.each([
    { email: 'helloworld@VeryLegitEmailscom', firstName: VD.NAMEFIRST2, lastName: VD.NAMELAST2}, // Invalid email
    { email: VD.EMAIL2, firstName: 'J&m!e', lastName: VD.NAMELAST2}, // Firstname contains invalid characters
    { email: VD.EMAIL2, firstName: 'J', lastName: VD.NAMELAST2}, // Firstname is less than two characters
    { email: VD.EMAIL2, firstName: 'j'.repeat(21), lastName: VD.NAMELAST2}, // Firstname is larger than 20 characters
    { email: VD.EMAIL2, firstName: VD.NAMEFIRST2, lastName: 'Ol!v#r'}, // Lastname contains invalid characters
    { email: VD.EMAIL2, firstName: VD.NAMEFIRST2, lastName: 'O'}, // Lastname is less than two characters
    { email: VD.EMAIL2, firstName: VD.NAMEFIRST2, lastName: 'O'.repeat(21)}, // Lastname is greater than 20 characters
  ])('Errors for invalid emails and names', ({ email, firstName, lastName }) => {
    const response = requestAdminUserDetailsUpdate(user.body.token, email, firstName, lastName);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    const response = requestAdminUserDetailsUpdate('', VD.EMAIL2, VD.NAMEFIRST2, VD.NAMELAST2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });
  test('Unsuccessful call, token is invalid', () => {
    const response = requestAdminUserDetailsUpdate('-666', VD.EMAIL2, VD.NAMEFIRST2, VD.NAMELAST2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });
});

describe('Testing adminUserPasswordUpdate', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
  });
  test('Successful adminUserPasswordUpdate', () => {
    const response = requestAdminUserPasswordUpdate(user.body.token, VD.PASSWORD, VD.PASSWORD2);
    // Check if function returns any errors
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Check if parameters were actually updated
    expect(requestAdminAuthLogout(user.body.token).body).toStrictEqual({});
    expect(requestAdminAuthLogin(VD.EMAIL, VD.PASSWORD2).body).toStrictEqual({ token: expect.any(String) });
  });
  test('Unsuccessful call, oldPassword is not the correct oldPassword', () => {
    const response = requestAdminUserPasswordUpdate(user.body.token, 'wrongPassword1', VD.PASSWORD2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, oldPassword and newPassword match exactly', () => {
    const response = requestAdminUserPasswordUpdate(user.body.token, VD.PASSWORD, VD.PASSWORD);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, newPassword has already been used before by this user', () => {
    requestAdminUserPasswordUpdate(user.body.token, VD.PASSWORD, VD.PASSWORD2);
    const result2 = requestAdminUserPasswordUpdate(user.body.token, VD.PASSWORD2, VD.PASSWORD);
    expect(result2.body).toStrictEqual({ error: expect.any(String) });
    expect(result2.statusCode).toStrictEqual(400);
  });
  test.each([
    { password: '2Short'}, // Password less than 8 characters
    { password: 'noNumbers'}, // Passwords need atleast 1 number
    { password: '12345678'}, // Passwords must contain atleast 1 letter
  ])('Errors for invalid emails and names', ({ password }) => {
    const response = requestAdminUserPasswordUpdate(user.body.token, VD.PASSWORD, password);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    const response = requestAdminUserPasswordUpdate('', VD.PASSWORD, VD.PASSWORD);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });
  test('Unsuccessful call, token is invalid', () => {
    const response = requestAdminUserPasswordUpdate('-666', VD.PASSWORD, VD.PASSWORD);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });
});

import {
    requestAdminAuthRegister,
    requestAdminAuthLogin,
    requestAdminUserDetails,
   requestAdminUserDetailsUpdateV2,
    requestAdminUserPasswordUpdate,
    requestAdminAuthLogoutV2,
    clear,
  } from '../test-helpers';

import HTTPError from 'http-errors';
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
      expect(user.body).toStrictEqual({ token: expect.any(String) });
      const logout = requestAdminAuthLogoutV2(user.body.token);
      expect(logout.body).toStrictEqual({});
      expect(requestAdminUserDetails(user.body.token)).toThrow(HTTPError[401]);
    });
  
    test('Token is empty or invalid', () => {
      requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
      const response1 = requestAdminAuthLogoutV2('');
      expect(response1).toThrow(HTTPError[401]);
  
      const invalidId = uuidv4();
      const response2 = requestAdminAuthLogoutV2(invalidId);
      expect(response2).toThrow(HTTPError[401]);
    });
});

interface UserRegister {
  body: any;
  statusCode: number;
}

describe('Testing adminUserDetailsUpdate', () => {
  let user: UserRegister;
  beforeEach(() => {
    user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
  });
  test('Successful adminUserDetails Update', () => {
    const response = requestAdminUserDetailsUpdateV2(user.body.token, validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(response.body).toStrictEqual({});
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
  test('Unsuccessful call, user is changing to an email in use', () => {
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetailsUpdateV2(user2.body.token, validDetails.EMAIL, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(response).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, user is changing to an invalid email', () => {
    const response = requestAdminUserDetailsUpdateV2(user.body.token, 'helloworld@VeryLegitEmailscom', validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(response).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, nameFirst contains invalid characters', () => {
    const response = requestAdminUserDetailsUpdateV2(user.body.token, validDetails.EMAIL2, 'J&m!e', validDetails.NAMELAST2);
    expect(response).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, nameFirst contains less than 2 characters', () => {
    const response = requestAdminUserDetailsUpdateV2(user.body.token, validDetails.EMAIL2, 'J', validDetails.NAMELAST2);
    expect(response).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, nameFirst contains more than 20 characters', () => {
    const response = requestAdminUserDetailsUpdateV2(user.body.token, validDetails.EMAIL2, 'j'.repeat(21), validDetails.NAMELAST2);
    expect(response).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, nameLast contains invalid characters', () => {
    const response = requestAdminUserDetailsUpdateV2(user.body.token, validDetails.EMAIL2, validDetails.NAMEFIRST2, 'Ol!v#r');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, nameLast contains less than 2 characters', () => {
    const response = requestAdminUserDetailsUpdateV2(user.body.token, validDetails.EMAIL2, validDetails.NAMEFIRST2, 'O');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, nameLast contains more than 20 characters', () => {
    const response = requestAdminUserDetailsUpdateV2(user.body.token, validDetails.EMAIL2, validDetails.NAMEFIRST2, 'O'.repeat(21));
    expect(response).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, token is empty', () => {
    const response = requestAdminUserDetailsUpdateV2('', validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(response).toThrow(HTTPError[401]);
  });
  test('Unsuccessful call, token is invalid', () => {
    const response = requestAdminUserDetailsUpdateV2('-666', validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(response).toThrow(HTTPError[401]);
  });
});

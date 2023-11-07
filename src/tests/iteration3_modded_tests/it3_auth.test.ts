import {
  requestAdminAuthRegister,
  // requestAdminAuthLogin,
  requestAdminUserDetails,
  requestAdminUserDetailsUpdateV2,
  requestAdminUserDetailsV2,
  // requestAdminUserDetailsUpdate,
  requestAdminUserPasswordUpdateV2,
  requestAdminAuthLogoutV2,
  clear,
  requestAdminAuthLogin,
} from '../test-helpers';

// import { adminAuthRegisterReturn } from '../../auth';

import HTTPError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';
// import { adminQuizCreate } from '../../quiz';

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

describe.skip('Tests for adminAuthLogout', () => {
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

describe.skip('Tests for adminUserDetailsV2', () => {
  let user: {
    body: { token: string },
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
  });

  test('Successful accessing of user details', () => {
    const response = requestAdminUserDetailsV2(user.body.token);
    expect(response.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Jack Rizzella',
        email: 'helloworld@gmail.com',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }
    });
  });

  test('Error when an invalid token is passed', () => {
    const invalidId = uuidv4();
    const response = requestAdminUserDetails(invalidId);
    expect(response).toThrow(HTTPError[401]);
  });
});

describe.skip('Tests for adminUserUpdateDetailsV2', () => {
  let user: {
    body: { token: string },
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
  });

  test('Successful updating of user details', () => {
    const response = requestAdminUserDetailsUpdateV2(user.body.token, validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(response.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Jamie Oliver',
        email: 'helloworld1@gmail.com',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }
    });
  });

  test('Error when an invalid token is passed', () => {
    const invalidId = uuidv4();
    const response = requestAdminUserDetailsUpdateV2(invalidId, validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(response).toThrow(HTTPError[401]);
  });
});

describe.skip('Tests for adminUserUpdateDetailsV2', () => {
  let user: {
    body: { token: string },
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
  });

  test('Successful updating of user details', () => {
    const response = requestAdminUserDetailsUpdateV2(user.body.token, validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(response.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Jamie Oliver',
        email: 'helloworld1@gmail.com',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }
    });
  });

  test('Error when an invalid token is passed', () => {
    const invalidId = uuidv4();
    const response = requestAdminUserDetailsUpdateV2(invalidId, validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(response).toThrow(HTTPError[401]);
  });
});

describe.skip('Tests for adminUserPasswordUpdateV2', () => {
  let user: {
    body: { token: string },
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
  });

  test('Successful updating of password', () => {
    requestAdminUserPasswordUpdateV2(user.body.token, validDetails.PASSWORD, validDetails.PASSWORD2);
    const response = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // "This is not a valid UserId"
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, oldPassword is not the correct oldPassword', () => {
    const response = requestAdminUserPasswordUpdateV2(user.body.token, 'wrongPassword1', validDetails.PASSWORD2);
    expect(response).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, oldPassword and newPassword match exactly', () => {
    const response = requestAdminUserPasswordUpdateV2(user.body.token, validDetails.PASSWORD, validDetails.PASSWORD);
    expect(response).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, newPassword has already been used before by this user', () => {
    requestAdminUserPasswordUpdateV2(user.body.token, validDetails.PASSWORD, validDetails.PASSWORD2);
    const result2 = requestAdminUserPasswordUpdateV2(user.body.token, validDetails.PASSWORD2, validDetails.PASSWORD);
    expect(result2).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, newPassword has less than 8 characters', () => {
    const response = requestAdminUserPasswordUpdateV2(user.body.token, validDetails.PASSWORD, '2Short');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, newPassword does not contain at least one number', () => {
    const response = requestAdminUserPasswordUpdateV2(user.body.token, validDetails.PASSWORD, 'noNumbers');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, newPassword foes not contain at least one letter', () => {
    const response = requestAdminUserPasswordUpdateV2(user.body.token, validDetails.PASSWORD, '12345678');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, token is empty', () => {
    requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserPasswordUpdateV2('', validDetails.PASSWORD, validDetails.PASSWORD);
    expect(response).toThrow(HTTPError[401]);
  });
  test('Error when an invalid token is passed', () => {
    const invalidId = uuidv4();
    const response = requestAdminUserDetailsUpdateV2(invalidId, validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(response).toThrow(HTTPError[401]);
  });
});

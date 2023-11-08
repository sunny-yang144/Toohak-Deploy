import {
  requestAdminAuthRegister,
  requestAdminAuthLogin,
  requestAdminUserDetailsV2,
  requestAdminUserDetailsUpdateV2,
  requestAdminUserPasswordUpdateV2,
  requestAdminAuthLogoutV2,
  clear,
} from '../test-helpers';

// import { adminAuthRegisterReturn } from '../../auth';

import HTTPError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';

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
  test('Successful logout', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(user.body).toStrictEqual({ token: expect.any(String) });
    const logout = requestAdminAuthLogoutV2(user.body.token);
    expect(logout.body).toStrictEqual({});
    expect(() => requestAdminUserDetailsV2(user.body.token)).toThrow(HTTPError[401]);
  });

  test('Token is empty or invalid', () => {
    requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminAuthLogoutV2('')).toThrow(HTTPError[401]);

    const invalidId = uuidv4();
    expect(() => requestAdminAuthLogoutV2(invalidId)).toThrow(HTTPError[401]);
  });
});

describe('Tests for adminUserDetails', () => {
  test('Succesful accessing of a users details', () => {
    // If there user id exists, then return user details.
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const response = requestAdminUserDetailsV2(user.body.token);
    expect(response.body).toStrictEqual(
      {
        user:
        {
          userId: expect.any(Number),
          name: 'Jack Rizzella',
          email: 'helloworld@gmail.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      }
    );
  });

  test('Error when an invalid token is passed', () => {
    requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const invalidId = uuidv4();
    expect(() => requestAdminUserDetailsV2(invalidId)).toThrow(HTTPError[401]);
  });
});

describe('Testing adminUserDetailsUpdate', () => {
  test('Successful adminUserDetails Update', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const response = requestAdminUserDetailsUpdateV2(user.body.token, VD.EMAIL2, VD.NAMEFIRST2, VD.NAMELAST2);
    expect(response.body).toStrictEqual({});

    const detailsCheck = requestAdminUserDetailsV2(user.body.token);
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
  test('Unsuccessful call, user is changing to an email in use', () => {
    requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserDetailsUpdateV2(user2.body.token, VD.EMAIL, VD.NAMEFIRST2, VD.NAMELAST2)).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, user is changing to an invalid email', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserDetailsUpdateV2(user.body.token, 'helloworld@VeryLegitEmailscom', VD.NAMEFIRST2, VD.NAMELAST2)).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, nameFirst contains invalid characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserDetailsUpdateV2(user.body.token, VD.EMAIL2, 'J&m!e', VD.NAMELAST2)).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, nameFirst contains less than 2 characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserDetailsUpdateV2(user.body.token, VD.EMAIL2, 'J', VD.NAMELAST2)).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, nameFirst contains more than 20 characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserDetailsUpdateV2(user.body.token, VD.EMAIL2, 'j'.repeat(21), VD.NAMELAST2)).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, nameLast contains invalid characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserDetailsUpdateV2(user.body.token, VD.EMAIL2, VD.NAMEFIRST2, 'Ol!v#r')).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, nameLast contains less than 2 characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserDetailsUpdateV2(user.body.token, VD.EMAIL2, VD.NAMEFIRST2, 'O')).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, nameLast contains more than 20 characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserDetailsUpdateV2(user.body.token, VD.EMAIL2, VD.NAMEFIRST2, 'O'.repeat(21))).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, token is empty', () => {
    requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserDetailsUpdateV2('', VD.EMAIL2, VD.NAMEFIRST2, VD.NAMELAST2)).toThrow(HTTPError[401]);
  });
  test('Unsuccessful call, token is invalid', () => {
    requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserDetailsUpdateV2('-666', VD.EMAIL2, VD.NAMEFIRST2, VD.NAMELAST2)).toThrow(HTTPError[401]);
  });
});

describe('Testing adminUserPasswordUpdate', () => {
  test('Successful adminUserPasswordUpdate', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(requestAdminUserPasswordUpdateV2(user.body.token, VD.PASSWORD, VD.PASSWORD2).body).toStrictEqual({});
    expect(requestAdminAuthLogoutV2(user.body.token).body).toStrictEqual({});
    expect(requestAdminAuthLogin(VD.EMAIL, VD.PASSWORD2).body).toStrictEqual({ token: expect.any(String) });
  });
  test('Unsuccessful call, oldPassword is not the correct oldPassword', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserPasswordUpdateV2(user.body.token, 'wrongPassword1', VD.PASSWORD2)).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, oldPassword and newPassword match exactly', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserPasswordUpdateV2(user.body.token, VD.PASSWORD, VD.PASSWORD)).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, newPassword has already been used before by this user', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminUserPasswordUpdateV2(user.body.token, VD.PASSWORD, VD.PASSWORD2);
    expect(() => requestAdminUserPasswordUpdateV2(user.body.token, VD.PASSWORD2, VD.PASSWORD)).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, newPassword has less than 8 characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserPasswordUpdateV2(user.body.token, VD.PASSWORD, '2Short')).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, newPassword does not contain at least one number', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserPasswordUpdateV2(user.body.token, VD.PASSWORD, 'noNumbers')).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, newPassword foes not contain at least one letter', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserPasswordUpdateV2(user.body.token, VD.PASSWORD, '12345678')).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, token is empty', () => {
    requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserPasswordUpdateV2('', VD.PASSWORD, VD.PASSWORD)).toThrow(HTTPError[401]);
  });
  test('Unsuccessful call, token is invalid', () => {
    requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminUserPasswordUpdateV2('-666', VD.PASSWORD, VD.PASSWORD)).toThrow(HTTPError[401]);
  });
});

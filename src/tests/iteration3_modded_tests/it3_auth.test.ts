import {
  requestAdminAuthRegister,
  requestAdminUserDetailsV2,
  requestAdminUserDetailsUpdateV2,
  requestAdminUserPasswordUpdateV2,
  requestAdminAuthLogoutV2,
  clear,
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

describe('Tests for adminAuthLogout', () => {
  test.only('Successful logout', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    expect(user.body).toStrictEqual({ token: expect.any(String) });
    const logout = requestAdminAuthLogoutV2(user.body.token);
    expect(logout.body).toStrictEqual({});
    expect(() => requestAdminUserDetailsV2(user.body.token)).toThrow(HTTPError[401]);
  });

  test.only('Token is empty or invalid', () => {
    requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    expect(() => requestAdminAuthLogoutV2('')).toThrow(HTTPError[401]);

    const invalidId = uuidv4();
    expect(() => requestAdminAuthLogoutV2(invalidId)).toThrow(HTTPError[401]);
  });
});

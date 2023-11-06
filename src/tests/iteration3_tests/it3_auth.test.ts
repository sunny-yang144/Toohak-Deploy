import {
    requestAdminAuthRegister,
    requestAdminAuthLogin,
    requestAdminUserDetails,
    requestAdminUserDetailsUpdate,
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
      const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
      // check if user is logged in
      expect(userLogin.body).toStrictEqual({ token: expect.any(String) });
  
      // Logout user
      const logoutReturn = requestAdminAuthLogoutV2(user.body.token);
      expect(logoutReturn.body).toStrictEqual({});
  
      // check if user can use functions
      const getUserDetails = requestAdminUserDetails(user.body.token);
      expect(getUserDetails.body).toThrow(HTTPError[401]);
    });
  
    test('Token is empty or invalid', () => {
      requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
      const response1 = requestAdminAuthLogoutV2('');
      expect(response1.body).toThrow(HTTPError[401]);
  
      const invalidId = uuidv4();
      const response2 = requestAdminAuthLogoutV2(invalidId);
      expect(response2.body).toThrow(HTTPError[401]);
    });
});
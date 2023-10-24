import {
  requestAdminAuthRegister,
  requestAdminAuthLogin,
  requestAdminUserDetails,
  requestAdminUserDetailsUpdate,
  requestAdminUserPasswordUpdate,
  requestAdminAuthLogout,
  clear,
} from './test-helpers';

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

// You could also structure this to have error cases
describe('Tests for adminAuthRegister', () => {
  /**
   *                          ERROR CASES:
   * Email address is used by another user
   * Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail function)
   * NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
   * NameFirst is less than 2 characters or more than 20 characters
   * NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
   * NameLast is less than 2 characters or more than 20 characters
   * Password is less than 8 characters
   * Password does not contain at least one number and at least one letter
   *
   * Return Object:
   * { authUserId }
   */
  test('Successful User Created when given valid parameters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    expect(user.body).toStrictEqual({ token: expect.any(String) });
    expect(user.statusCode).toStrictEqual(200);
  });

  test('Error when given an email address is already used', () => {
    // Created a user successfully
    requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    // Another user with the same email
    expect(user2.body).toStrictEqual({ error: expect.any(String) }); // "This email is already in use"
    expect(user2.statusCode).toStrictEqual(400);
  });

  test('Error when a non-valid email is used', () => {
    // Does not satisfy the validator.isEmail function
    const user = requestAdminAuthRegister('helloworld@VeryLegitEmailscom', validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    expect(user.body).toStrictEqual({ error: expect.any(String) }); // "This is not a valid email"
    expect(user.statusCode).toStrictEqual(400);
  });

  test('Error when non-valid characters are used in Namefirst', () => {
    // These non-valid characters are characters other than lowercase letters,
    // uppercase letters, spaces, hyphens, or apostrophes.
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, '0000', validDetails.NAMELAST);
    expect(user.body).toStrictEqual({ error: expect.any(String) }); // "This is not a valid first name"
    expect(user.statusCode).toStrictEqual(400);
  });

  test('Error when Namefirst is too short', () => {
    // This occurs when NameFirst is shorter than 2 characters
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, 'X', validDetails.NAMELAST);
    expect(user.body).toStrictEqual({ error: expect.any(String) }); // "This is not a valid first name"
    expect(user.statusCode).toStrictEqual(400);
  });

  test('Error when Namefirst is too long', () => {
    // This occurs when NameFirst is longer than 20 characters
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, 'ThisIsAVeryLongNameBanned', validDetails.NAMELAST);
    expect(user.body).toStrictEqual({ error: expect.any(String) }); // "This is not a valid first name"
    expect(user.statusCode).toStrictEqual(400);
  });

  test('Error when non-valid characters are used in NameLast', () => {
    // These non-valid characters are characters other than lowercase letters,
    // uppercase letters, spaces, hyphens, or apostrophes.
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, '0000');
    expect(user.body).toStrictEqual({ error: expect.any(String) }); // "This is not a valid last name"
    expect(user.statusCode).toStrictEqual(400);
  });

  test('Error when Namelast is too short', () => {
    // This occurs when NameLast is shorter than 2 characters
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, 'D');
    expect(user.body).toStrictEqual({ error: expect.any(String) }); // "This is not a valid last name"
    expect(user.statusCode).toStrictEqual(400);
  });

  test('Error when Namelast is too long', () => {
    // This occurs when NameLast is longer than 20 characters
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, 'ThisLastNameIsWayTooLong');
    expect(user.body).toStrictEqual({ error: expect.any(String) }); // "This is not a valid last name"
    expect(user.statusCode).toStrictEqual(400);
  });

  test('Error when password is too short', () => {
    // This occurs when password is less than 8 characters
    const user = requestAdminAuthRegister(validDetails.EMAIL, 'Shawty1', validDetails.NAMEFIRST, validDetails.NAMELAST);
    expect(user.body).toStrictEqual({ error: expect.any(String) }); // "This is not a valid password"
    expect(user.statusCode).toStrictEqual(400);
  });

  test('Error when password does not have atleast number and letter', () => {
    // This occurs when the password does not have atleast one number and letter
    const user = requestAdminAuthRegister(validDetails.EMAIL, '123456789', validDetails.NAMEFIRST, validDetails.NAMELAST);
    expect(user.body).toStrictEqual({ error: expect.any(String) }); // "This is not a valid password"
    expect(user.statusCode).toStrictEqual(400);
  });
});

describe('Tests for adminAuthLogin', () => {
  beforeEach(() => {
    requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
  });

  test('Email does not exist', () => {
    const user = requestAdminAuthLogin('nonexistant@email.com', validDetails.PASSWORD);
    expect(user.body).toStrictEqual({ error: expect.any(String) });
    expect(user.statusCode).toStrictEqual(400);
  });

  test('Incorrect password.', () => {
    const user = requestAdminAuthLogin(validDetails.EMAIL, 'wrongpassword');
    expect(user.body).toStrictEqual({ error: expect.any(String) });
    expect(user.statusCode).toStrictEqual(400);
  });

  test('Login Success', () => {
    const user = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    expect(user.body).toStrictEqual({ token: expect.any(String) });
    expect(user.statusCode).toStrictEqual(200);
  });
});

describe('Tests for adminUserDetails', () => {
  test('Succesful accessing of a users details', () => {
    // If there user id exists, then return user details.
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetails(user.body.token);
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
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Error when an invalid token is passed', () => {
    requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const invalidId = uuidv4();
    const response = requestAdminUserDetails(invalidId);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // "This is not a valid UserId"
    expect(response.statusCode).toStrictEqual(401);
  });
});

/// /////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////     ITERATION 2      //////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////

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
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response1 = requestAdminAuthLogout('');
    expect(response1.body).toStrictEqual({ error: expect.any(String) });
    expect(response1.statusCode).toStrictEqual(401);

    const invalidId = uuidv4();
    const response2 = requestAdminAuthLogout(invalidId);
    expect(response2.body).toStrictEqual({ error: expect.any(String) });
    expect(response1.statusCode).toStrictEqual(401);
  });
});

describe.skip('Testing adminUserDetailsUpdate', () => {
  test('Successful adminUserDetails Update', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetailsUpdate(user.body.token, validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    // Check if function returns any errors
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Check if parameters were updated
    expect(requestAdminUserDetails(user.body.token)).toStrictEqual
    ({
      user:
      {
        userId: expect.any(Number),
        name: `${validDetails.NAMEFIRST2} ${validDetails.NAMELAST2}`,
        email: validDetails.EMAIL2,
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }
    });
  });

  test('Unsuccessful call, email2 is not valid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserDetailsUpdate(user.body.token, 'invalidEmail@fake.com', validDetails.NAMEFIRST2, validDetails.NAMELAST2);
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

describe.skip('Testing adminUserPasswordUpdate', () => {
  test('Successful adminUserPasswordUpdate', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminUserPasswordUpdate(user.body.token, validDetails.PASSWORD, validDetails.PASSWORD2);
    // Check if function returns any errors
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Check if parameters were actually updated
    expect(requestAdminAuthLogout(user.body.token)).toStrictEqual({});
    expect(requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD2)).toStrictEqual({ token: expect.any(Number) });
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

// When all tests are run clear the data
clear();

import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
} from './auth.js';

import {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
} from './quiz.js';

import {
  clear,
} from './other.js'

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
  beforeEach(() => {          
    clear();
  }); 

  test('Successful User Created when given valid parameters', () => {
  
    expect(adminAuthRegister
      ('helloworld@gmail.com', '1234UNSW', 'Jack', 'Rizzella')).toStrictEqual
      ({ authUserId: expect.any(Number)}); 
  });

  test('Error when given an email address is already used', () => {
    // Created a user successfully
    const user = adminAuthRegister
    ('ThisEmailIsAlreadyInUse@gmail.com', '1234UNSW', 'Jack', 'Rizzella');
    // Another user with the same email
    expect(adminAuthRegister
      ('ThisEmailIsAlreadyInUse@gmail.com', '1234UNSW', 'Jack2', 'Rizzella')).toStrictEqual
      ({ error: expect.any(String)}); // "This email is already in use"
  });

  test('Error when a non-valid email is used', () => {
    // Does not satisfy the validator.isEmail function
    expect(adminAuthRegister
      ('helloworld@VeryLegitEmails.com', '1234UNSW', 'Jack', 'Rizzella')).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid email"
  });

  test('Error when non-valid characters are used in Namefirst', () => {
    // These non-valid characters are characters other than lowercase letters, 
    // uppercase letters, spaces, hyphens, or apostrophes.
    expect(adminAuthRegister
      ('helloworld@gmail.com', '1234UNSW', 'Виктор', 'Rizzella')).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid first name"
  });

  test('Error when Namefirst is too short', () => {
    // This occurs when NameFirst is shorter than 2 characters
    expect(adminAuthRegister
      ('helloworld@gmail.com', '1234UNSW', 'X', 'Rizzella')).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid first name"
  });

  test('Error when Namefirst is too long', () => {
    // This occurs when NameFirst is longer than 20 characters
    expect(adminAuthRegister
      ('helloworld@gmail.com', '1234UNSW', 'ThisIsAVeryLongNameBanned', 'Rizzella')).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid first name"
  });

  test('Error when non-valid characters are used in NameLast', () => {
    // These non-valid characters are characters other than lowercase letters, 
    // uppercase letters, spaces, hyphens, or apostrophes.
    expect(adminAuthRegister
      ('helloworld@gmail.com', '1234UNSW', 'Viktor', 'хлеб')).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid last name"
  });

  test('Error when Namelast is too short', () => {
    // This occurs when NameLast is shorter than 2 characters
    expect(adminAuthRegister
      ('helloworld@gmail.com', '1234UNSW', 'Jack', 'D')).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid last name"
  });

  test('Error when Namelast is too long', () => {
    // This occurs when NameLast is longer than 20 characters
    expect(adminAuthRegister
      ('helloworld@gmail.com', '1234UNSW', 'Jack', 'ThisLastNameIsWayTooLong')).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid last name"
  });

  test('Error when password is too short', () => {
    // This occurs when password is less than 8 characters
    expect(adminAuthRegister
      ('helloworld@gmail.com', 'Shawty1', 'Jack', 'Rizzella')).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid password"
  });

  test('Error when password does not have atleast number and letter', () => {
    // This occurs when the password does not have atleast one number and letter
    expect(adminAuthRegister
      ('helloworld@gmail.com', '123456789', 'Jack', 'Rizzella')).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid password"
  });
  
});


describe('Tests for adminAuthLogin', () => {

});

describe('Tests for adminUserDetails', () => {
  /**
   *                          ERROR CASES:
   * 1. The only case is when an invalid UserId is inputed, in doing so a
   * error message will be outputted.
   *          
   *                          SUCCESS CASES:
   * 1. A valid UserId needs to be inputted.
   * 
   * Return Object:
   * { user:
   *  {
   *    userId,
   *    name,
   *    email,
   *    numSuccessfulLogins,
   *    numFailedPasswordsSinceLastLogin,
   *  }
   * }
   */
  
  beforeEach(() => {          
    clear();
  }); 

  test('Succesful accessing of a users details', () => {
    //If there user id exists, then return user details.
    const user = adminAuthRegister('helloworld@gmail.com', '1234UNSW', 'Jack', 'Rizzella');

    expect(adminUserDetails(user.authUserId)).toStrictEqual
    ({ user:
      {
        userId: user.authUserId,
        name: 'Jack Rizzella',
        email: 'helloworld@gmail.com',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }
    }); 
  });

  test('Succesful accessing of a users details', () => {
    // We know that there are no ids are valid since clear has been run so
    // an arbitrary number can be chosen.
    expect(adminUserDetails(1)).toStrictEqual
    ({error: expect.any(String)}); //"This is not a valid UserId" 
  });

});


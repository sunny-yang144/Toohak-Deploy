import request from 'sync-request-curl';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

function requestAdminAuthRegister (email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + 'admin/auth/register',
    {
      json: {
        email,
        password,
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
function requestAdminAuthLogin (email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + 'admin/auth/login',
    {
      json: {
        email,
        password,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  }
}
function requestAdminUserDetails (authUserId: number) {
  const res = request(
    'GET',
    SERVER_URL + 'admin/auth/details',
    {
      qs: {}
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  }
}

// Clears any lingering data elements before each test group
// eliminates any unexpected bugs.
beforeEach(() => {          
  clear();
});
enum validDetails {
  EMAIL = 'helloworld@gmail.com',
  PASSWORD = '1234UNSW',
  NAMEFIRST = 'Jack',
  NAMELAST = 'Rizzella',
  EMAIL2 = 'helloworld@gmail.com',
  PASSWORD2 = '4321UNSW',
  NAMEFIRST2 = 'Jamie',
  NAMELAST2 = 'Oliver',
}
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

  let user;
  beforeEach(() => {          
    clear();
  }); 

  test('Successful User Created when given valid parameters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    expect(user).toStrictEqual({authUserId: expect.any(Number)}); 
    expect(result.statusCode).toStrictEqual(200);
  });

  test('Error when given an email address is already used', () => {
    // Created a user successfully
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    // Another user with the same email
    expect(user2).toStrictEqual({error: expect.any(String)}); // "This email is already in use"
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Error when a non-valid email is used', () => {
    // Does not satisfy the validator.isEmail function
    expect(requestAdminAuthRegister
      ('helloworld@VeryLegitEmailscom', validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST)).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid email"
      expect(result.statusCode).toStrictEqual(400);
  });

  test('Error when non-valid characters are used in Namefirst', () => {
    // These non-valid characters are characters other than lowercase letters, 
    // uppercase letters, spaces, hyphens, or apostrophes.
    expect(requestAdminAuthRegister
      (validDetails.EMAIL, validDetails.PASSWORD, 'Виктор', validDetails.NAMELAST)).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid first name"
      expect(result.statusCode).toStrictEqual(400);
  });

  test('Error when Namefirst is too short', () => {
    // This occurs when NameFirst is shorter than 2 characters
    expect(requestAdminAuthRegister
      (validDetails.EMAIL, validDetails.PASSWORD, 'X', validDetails.NAMELAST)).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid first name"
      expect(result.statusCode).toStrictEqual(400);
  });

  test('Error when Namefirst is too long', () => {
    // This occurs when NameFirst is longer than 20 characters
    expect(requestAdminAuthRegister
      (validDetails.EMAIL, validDetails.PASSWORD, 'ThisIsAVeryLongNameBanned', validDetails.NAMELAST)).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid first name"
      expect(result.statusCode).toStrictEqual(400);
  });

  test('Error when non-valid characters are used in NameLast', () => {
    // These non-valid characters are characters other than lowercase letters, 
    // uppercase letters, spaces, hyphens, or apostrophes.
    expect(requestAdminAuthRegister
      (validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, 'хлеб')).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid last name"
      expect(result.statusCode).toStrictEqual(400);
  });

  test('Error when Namelast is too short', () => {
    // This occurs when NameLast is shorter than 2 characters
    expect(requestAdminAuthRegister
      (validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, 'D')).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid last name"
      expect(result.statusCode).toStrictEqual(400);
  });

  test('Error when Namelast is too long', () => {
    // This occurs when NameLast is longer than 20 characters
    expect(requestAdminAuthRegister
      (validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, 'ThisLastNameIsWayTooLong')).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid last name"
      expect(result.statusCode).toStrictEqual(400);
  });

  test('Error when password is too short', () => {
    // This occurs when password is less than 8 characters
    expect(requestAdminAuthRegister
      (validDetails.EMAIL, 'Shawty1', validDetails.NAMEFIRST, validDetails.NAMELAST)).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid password"
      expect(result.statusCode).toStrictEqual(400);
  });

  test('Error when password does not have atleast number and letter', () => {
    // This occurs when the password does not have atleast one number and letter
    expect(requestAdminAuthRegister
      (validDetails.EMAIL, '123456789', validDetails.NAMEFIRST, validDetails.NAMELAST)).toStrictEqual
      ({ error: expect.any(String)}); //"This is not a valid password"
      expect(result.statusCode).toStrictEqual(400);
  });
  
});

describe('Tests for adminAuthLogin', () => {
  beforeEach(() => {          
    clear();
    adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
  }); 

  test('Email does not exist', () => {
    expect(adminAuthLogin('nonexistant@email.com', validDetails.PASSWORD)).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Incorrect password.', () => {
    expect(adminAuthLogin(validDetails.EMAIL, 'wrongpassword')).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Login Success', () => {
    expect(adminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD)).toStrictEqual({ authUserId: expect.any(Number) });
    expect(result.statusCode).toStrictEqual(200);
  });

});

describe('Tests for adminUserDetails', () => {
  
  beforeEach(() => {          
    clear();
  }); 

  test('Succesful accessing of a users details', () => {
    //If there user id exists, then return user details.
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);

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
    expect(result.statusCode).toStrictEqual(200);
  });

  test('Error when an invalid id is passed', () => {
    // We know that there are no ids are valid since clear has been run so
    // an arbitrary number can be chosen.
    expect(adminUserDetails(1)).toStrictEqual
    ({error: expect.any(String)}); //"This is not a valid UserId" 
  });
  expect(result.statusCode).toStrictEqual(400);
});


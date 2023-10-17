import request from 'sync-request-curl';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

function requestAdminAuthRegister (email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
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
    SERVER_URL + '/v1/admin/auth/login',
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
function requestAdminUserDetails (token: number) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/user/details',
    {
      qs: {}
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  }
}

function clear() {
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/clear',
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
    expect(user.body).toStrictEqual({ token: expect.any(Number) }); 
    expect(user.statusCode).toStrictEqual(200);
  });

  test('Error when given an email address is already used', () => {
    // Created a user successfully
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    // Another user with the same email
    expect(user2.body).toStrictEqual({ error: expect.any(String) }); // "This email is already in use"
    expect(user2.statusCode).toStrictEqual(400);
  });

  test('Error when a non-valid email is used', () => {
    // Does not satisfy the validator.isEmail function
    const user = requestAdminAuthRegister('helloworld@VeryLegitEmailscom', validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    expect(user.body).toStrictEqual({ error: expect.any(String) }); //"This is not a valid email"
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
    expect(user.body).toStrictEqual({ error: expect.any(String)} ); //"This is not a valid first name"
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
    expect(user.body).toStrictEqual({ error: expect.any(String) }); //"This is not a valid last name"
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
    clear();
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
    expect(user.body).toStrictEqual({ token: expect.any(Number) });
    expect(user.statusCode).toStrictEqual(200);
  });
});

describe('Tests for adminUserDetails', () => {
  
  beforeEach(() => {          
    clear();
  }); 

  test('Succesful accessing of a users details', () => {
    //If there user id exists, then return user details.
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);

    expect(requestAdminUserDetails(user.body.token)).toStrictEqual(
      { user:
        {
          userId: expect.any(Number),
          name: 'Jack Rizzella',
          email: 'helloworld@gmail.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      }
    ); 
    expect(user.statusCode).toStrictEqual(200);
  });

  test('Error when an invalid id is passed', () => {
    // We know that there are no ids are valid since clear has been run so
    // an arbitrary number can be chosen.
    const user = requestAdminUserDetails(1);
    expect(user).toStrictEqual({ error: expect.any(String) }); // "This is not a valid UserId" 
    expect(user.statusCode).toStrictEqual(400);
  });
});


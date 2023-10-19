import request from 'sync-request-curl';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

function requestAdminUserDetailsUpdate (token: number, email: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/details',
    {
      json: {
        token,
        email,
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

enum validDetails {
  EMAIL = 'helloworld@gmail.com',
  PASSWORD = '1234UNSW',
  NAMEFIRST = 'Jack',
  NAMELAST = 'Rizzella',
  EMAIL2 = 'worldhello@gmail.com',
  PASSWORD2 = '4321UNSW',
  NAMEFIRST2 = 'Jamie',
  NAMELAST2 = 'Oliver',
}

describe('Testing adminUserDetails', () => {
  test('Successful adminUserDetails Update', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    // Check if function returns any errors
    expect(result.body).toStrictEqual({});
    expect(result.statusCode).toStrictEqual(200);
    // Check if parameters were updated
    expect(adminUserDetails(userLogin.body)).toStrictEqual
    ({ user:
      {
        userId: user.authUserId,
        name: 'Jamie Oliver',
        email: 'worldhello@gmail.com',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }
    });
  });

  test('Unsuccessful call, email2 is not valid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, 'invalidEmail@fake.com', validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameFirst contains invalid characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, validDetails.EMAIL2, 'J&m!e', validDetails.NAMELAST2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameFirst contains less than 2 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, validDetails.EMAIL2, 'J', validDetails.NAMELAST2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameFirst contains more than 20 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, validDetails.EMAIL2, 'j'.repeat(21), validDetails.NAMELAST2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameLast contains invalid characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, validDetails.EMAIL2, validDetails.NAMEFIRST2, 'Ol!v#r');
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameLast contains less than 2 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, validDetails.EMAIL2, validDetails.NAMEFIRST2, 'O');
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, nameLast contains more than 20 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(userLogin.body, validDetails.EMAIL2, validDetails.NAMEFIRST2, 'O'.repeat(21));
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful call, token is empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(parseInt(''), validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(401);
  });
  test('Unsuccessful call, token is invalid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const userLogin = requestAdminAuthLogin(validDetails.EMAIL, validDetails.PASSWORD);
    const result = requestAdminUserDetailsUpdate(parseInt('-666'), validDetails.EMAIL2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    expect(result.body).toStrictEqual({ error: expect.any(String) });
    expect(result.statusCode).toStrictEqual(401);
  });
});

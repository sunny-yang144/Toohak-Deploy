import request from 'sync-request-curl';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// Clears any lingering data elements before each test group
// eliminates any unexpected bugs.
function clear() {
  const res = request(
    'DELETE',
    SERVER_URL + '/clear',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
    }
  );
  return JSON.parse(res.body.toString());
}
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
  QUIZNAME = 'I have atleast 5',
  QUIZDESCRIPTION = 'description',
}

// Couple suggestions:
// Add a test where once data is erased many other functions wouldn't
// work since there is not Id reference
// Can also check if data is empty where data is stored in
// dataStore.js
describe('Tests for clear', () => {
  test('Successfully returns empty object', () => {
    expect(clear()).toStrictEqual({});
  });

  test('Sucessfully removes user', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    clear();
    // Since an error occurs, user must have been removed
    expect(adminQuizList(user.userId)).toStrictEqual({ error: expect.any(String)});
    expect(result.statusCode).toStrictEqual(200);
  });

  test('Sucessfully removes quiz', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.userId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    clear();
    const user2 = adminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    // Since an error occurs, quiz must have been removed
    expect(adminQuizInfo(user2.userId, quiz.quizId)).toStrictEqual({ error: expect.any(String)});
    expect(result.statusCode).toStrictEqual(200);
  });
});


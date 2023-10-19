import request from 'sync-request-curl';
import { requestAdminAuthRegister } from './auth.test'
import { requestAdminQuizList, requestAdminQuizCreate, requestAdminQuizInfo } from './quiz.test'

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// Clears any lingering data elements before each test group
// eliminates any unexpected bugs.
function clear() {
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/clear',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
    }
  );
  return JSON.parse(res.body.toString());
}
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
beforeEach(() => {          
  clear();
});
describe('Tests for clear', () => {
  test('Successfully returns empty object', () => {
    expect(clear()).toStrictEqual({});
  });

  test('Sucessfully removes user', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    clear();
    // Since an error occurs, user must have been removed
    const response = requestAdminQuizList(user.body.token);

    expect(response.body).toStrictEqual({ error: expect.any(String)});
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Sucessfully removes quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    clear();
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    // Since an error occurs, quiz must have been removed
    const response = requestAdminQuizInfo(user2.body.token, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String)});
    expect(response.statusCode).toStrictEqual(400);
  });
});


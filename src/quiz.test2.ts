import request from 'sync-request-curl';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
function requestAdminQuizTrash () {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/trash}',
    {
      qs: {}
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
  EMAIL2 = 'helloworld@gmail.com',
  PASSWORD2 = '4321UNSW',
  NAMEFIRST2 = 'Jamie',
  NAMELAST2 = 'Oliver',
  QUIZNAME = 'World Quiz',
  QUIZDESCRIPTION = 'About flags, countries and capitals!',
  QUIZNAME2 = 'Soccer Quiz',
  QUIZDESCRIPTION2 = 'GOOOAAAALLLL (Part 2)'
}
describe('Tests for adminQuizTrash', () => {
  
  test('Successful Trash List', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
		const remove = adminQuizRemove(user.body.token, quiz.body.quizId);
		const result = adminQuizTrash();
    expect(result).toStrictEqual({
			quizzes: [
      {
        quizId: quiz.body.quizId,
        name: expect.any(String),
      }
    ]
    });
    expect(result.statusCode).toStrictEqual(200);
  });
	test('Empty Trash List', () => {
		const result = adminQuizTrash();
    expect(result).toStrictEqual({
			quizzes: []
    });
    expect(result.statusCode).toStrictEqual(200);
  });

  test('Successful Multiple Trash List', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
		const quiz2 = adminQuizCreate(user.body.token, validDetails.QUIZNAME2, validDetails.QUIZDESCRIPITON2);
		const remove = adminQuizRemove(user.body.token, quiz.body.quizId);
		const remove2 = adminQuizRemove(user.body.token, quiz2.body.quizId);
		const result = adminQuizTrash();
    expect(result).toStrictEqual({
			quizzes: [
      {
        quizId: quiz.body.quizId,
        name: expect.any(String),
      }, {
        quizId: quiz2.body.quizId,
        name: expect.any(String),
      }, 
    ]
    });
    expect(result.statusCode).toStrictEqual(200);
  });
});

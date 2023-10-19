import request from 'sync-request-curl';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;
function requestAdminQuizTrash (token: number) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/trash}',
    {
      qs: {
				token,
			}
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  }
}
function requestAdminTrashRemove (token: number, quizId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/admin/quiz/trash/empty}',
    {
      qs: {
				token,
        quizId,
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
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
		const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
		const result = requestAdminQuizTrash(user.body.token);
    expect(result.body).toStrictEqual({
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
		const result = adminQuizTrash(user.body.token);
    expect(result.body).toStrictEqual({
			quizzes: []
    });
    expect(result.statusCode).toStrictEqual(200);
  });

  test('Successful Multiple Trash List', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
		const quiz2 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME2, validDetails.QUIZDESCRIPITON2);
		const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
		const remove2 = requestAdminQuizRemove(user.body.token, quiz2.body.quizId);
		const result = requestAdminQuizTrash(user.body.token);
    expect(result.body).toStrictEqual({
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
	test('Invalid token', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
		const result = requestAdminQuizTrash(user.body.token + 1);
    expect(result.body).toStrictEqual({error: expect.any(String)}); // 'Invalid token'
    expect(result.statusCode).toStrictEqual(401);
  });
});
describe('Tests to Empty adminQuizTrash', () => {
  
  test('Successful Trash Empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
		const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token, quiz.body.quizId) //needs to be an array of quizzes
		const result = requestAdminQuizTrash(user.body.token);
    expect(result.body).toStrictEqual({
			quizzes: []
    });
    expect(result.statusCode).toStrictEqual(200);
  });

  test('quizId is not in the Trash', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    const clearTrash = requestAdminTrashRemove(user.body.token, quiz.body.quizId)
		const result = requestAdminQuizTrash(user.body.token);
    expect(result.body).toStrictEqual({error: expect.any(String)});
    expect(result.statusCode).toStrictEqual(400);
  });
  test('quizId is not Valid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token, quiz.body.quizId + 1)
		const result = requestAdminQuizTrash(user.body.token);
    expect(result.body).toStrictEqual({error: expect.any(String)});
    expect(result.statusCode).toStrictEqual(400);
  });
  test('User does not own Quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token + 1, quiz.body.quizId);
		const result = requestAdminQuizTrash(user.body.token);
    expect(result.body).toStrictEqual({error: expect.any(String)});
    expect(result.statusCode).toStrictEqual(400);
  });
	test('Invalid token', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token, quiz.body.quizId);
		const result = requestAdminQuizTrash(user.body.token + 1);
    expect(result.body).toStrictEqual({error: expect.any(String)}); // 'Invalid token'
    expect(result.statusCode).toStrictEqual(401);
  });
  test('Valid Token, User is not Owner of Quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token, quiz.body.quizId);
		const result = requestAdminQuizTrash(user.body.token);
    expect(result.body).toStrictEqual({error: expect.any(String)}); // 'Invalid token'
    expect(result.statusCode).toStrictEqual(403);
  });
});

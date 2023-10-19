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

function requestAdminQuizQuestion ( quizId: number, token: number, question: string, duration: number, points: number, answer: string[], correct: boolean ) {
  const res = request(
    'POST',
    SERVER_URL +  `/v1/admin/quiz/${quizId}/question`,
    {
      json: {
        token,
        quizInfo: {
          question,
          duration,
          points,
        },
        quizAnswers: {
          answer,
          correct,
        }, 
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

describe('Tests for adminQuizQuestion', () => {
  // Create user and quiz
  const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
  const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
  const token = user.body.token;
  // Create question details
  const question = {
    question: "What does KFC sell?",
    duration: 4,
    points: 5,
  }
  const answer = {
    answer: ["Chicken", "Nuggets"],
    correct: true,
  }

  test('Successful quiz question creation', () => {
    const quizQuestion = requestAdminQuizQuestion(quiz.body.quizId, token, question.question, question.duration, question.points, answer.answer, answer.correct);
    expect(quizQuestion.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(quizQuestion.statusCode).toStrictEqual(200);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const quizQuestion = requestAdminQuizQuestion(-1, token, question.question, question.duration, question.points, answer.answer, answer.correct);
    expect(quizQuestion.body).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz.' });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('Question string is less than 5 characters in length or greater than 50 characters in length', () => {
    const quizQuestion = requestAdminQuizQuestion(quiz.body.quizId, token, "abcd", question.duration, question.points, answer.answer, answer.correct);
    expect(quizQuestion.body).toStrictEqual({ error: "Question is less than 5 characters long" });
    expect(quizQuestion.statusCode).toStrictEqual(400);

    const quizQuestion2 = requestAdminQuizQuestion(quiz.body.quizId, token, "a".repeat(51), question.duration, question.points, answer.answer, answer.correct);
    expect(quizQuestion2.body).toStrictEqual({ error: "Question is greater than 50 characters long" });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  
  test('The question has more than 6 answers or less than 2 answers', () => {
    const quiz2 = requestAdminQuizCreate(user.body.token, 'Gross Chiggen', validDetails.QUIZDESCRIPTION);

    const answer2 = {
      answer: ["Chicken", "Lettuce", "Concrete", "Bricks", "Beef", "Mice", "Nuts"],
      correct: true,
    }

    const answer3 = {
      answer: ["Concrete"],
      correct: true,
    }

    const quizQuestion = requestAdminQuizQuestion(quiz2.body.quizId, token, question.question, question.duration, question.points, answer2.answer, answer2.correct);
    expect(quizQuestion.body).toStrictEqual({ error: "More than 6 answers" });
    expect(quizQuestion.statusCode).toStrictEqual(400);

    const quizQuestion = requestAdminQuizQuestion(quiz2.body.quizId, token, question.question, question.duration, question.points, answer3.answer, answer3.correct);
    expect(quizQuestion.body).toStrictEqual({ error: "Less than 2 answers" });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });


  test('The question duration is not a positive number', () => {
    const quizQuestion = requestAdminQuizQuestion(quiz.body.quizId, token, question.question, -1, question.points, answer.answer, answer.correct);
    expect(quizQuestion.body).toStrictEqual({ error: "Question duration is not a positive number" });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  })

  test('The sum of the question durations in quiz exceeds 3 minutes', () => {
    const quiz1 = requestAdminQuizCreate(user.body.token, 'Chiggen', validDetails.QUIZDESCRIPTION);
    const question1 = {
      question: "What does KFC sell?",
      duration: 2,
      points: 5,
    }

    const question2 = {
      question: "What does KFC sell?",
      duration: 2,
      points: 5,
    }

    requestAdminQuizQuestion(quiz1.body.quizId, token, question1.question, question1.duration, question1.points, answer.answer, answer.correct);
    const quizQuestion = requestAdminQuizQuestion(quiz1.body.quizId, token, question2.question, question2.duration, question2.points, answer.answer, answer.correct)
    expect(quizQuestion.body).toStrictEqual({ error: "Sum of the question durations in quiz exceeds 3 minutes" });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('The points awarded for the question are less than 1 or greater than 10', () => {
    const quizQuestion = requestAdminQuizQuestion(quiz.body.quizId, token, question.question, question.duration, 0, answer.answer, answer.correct);
    expect(quizQuestion.body).toStrictEqual({ error: "Points awarded for the question are less than 1" });
    expect(quizQuestion.statusCode).toStrictEqual(400);

    const quizQuestion2 = requestAdminQuizQuestion(quiz.body.quizId, token, question.question, question.duration, 11, answer.answer, answer.correct);
    expect(quizQuestion2.body).toStrictEqual({ error: "Points awarded for the question are greater than 10" });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  test('The length of any answer is shorter than 1 character long or longer than 30 characters long', () => {
    const quizQuestion = requestAdminQuizQuestion(quiz.body.quizId, token, question.question, question.duration, question.points, ["", "no"], answer.correct);
    expect(quizQuestion.body).toStrictEqual({ error: "length of answer shorter than 1 character" });
    expect(quizQuestion.statusCode).toStrictEqual(400);

    const quizQuestion2 = requestAdminQuizQuestion(quiz.body.quizId, token, question.question, question.duration, question.points, ['a'.repeat(31), 'cheese'], answer.correct);
    expect(quizQuestion2.body).toStrictEqual({ error: "Length of answer longer than 30 characters" });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  test('Any answer strings are duplicates of one another (within the same question)', () => {
    const answer1 = {
      answer: ["Chicken", "Chicken"],
      correct: true,
    }
    const quizQuestion = requestAdminQuizQuestion(quiz.body.quizId, token, question.question, question.duration, question.points, answer1.answer, answer1.correct);
    expect(quizQuestion.body).toStrictEqual({ error: "Answer strings are duplicates" });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('There are no correct answers', () => {
    const quizQuestion = requestAdminQuizQuestion(quiz.body.quizId, token, question.question, question.duration, question.points, answer.answer, false);
    expect(quizQuestion.body).toStrictEqual({ error: "No correct answers" });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('Token is empty or invalid (does not refer to valid logged in user session', () => {
    const quizQuestion = requestAdminQuizQuestion(quiz.body.quizId, -1, question.question, question.duration, question.points, answer.answer, answer.correct);
    expect(quizQuestion.body).toStrictEqual({ error: "Token invalid (does not refer to valid logged in user session" });
    expect(quizQuestion.statusCode).toStrictEqual(401);

    const quizQuestion2 = requestAdminQuizQuestion(quiz.body.quizId, NaN, question.question, question.duration, question.points, answer.answer, answer.correct);
    expect(quizQuestion2.body).toStrictEqual({ error: "Token empty" });
    expect(quizQuestion2.statusCode).toStrictEqual(401);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const user1 = requestAdminAuthRegister('drizman123@gmail.com', validDetails.PASSWORD, 'Driz', 'Haj');

    const quizQuestion = requestAdminQuizQuestion(quiz.body.quizId, user1.body.token, question.question, question.duration, question.points, answer.answer, answer.correct);
    expect(quizQuestion.body).toStrictEqual({ error: "User is not owner of this quiz"});
    expect(quizQuestion.statusCode).toStrictEqual(403);
  });
});
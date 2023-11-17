import {
  requestAdminAuthRegister,
  requestAdminQuizList,
  requestAdminQuizCreate,
  requestAdminQuizInfo,
  requestAdminQuizRemove,
  requestAdminQuizNameUpdate,
  requestAdminQuizDescriptionUpdate,
  requestAdminQuizQuestionCreate,
  clear,
} from '../test-helpers';

import { expect } from '@jest/globals';

import { colours } from '../../dataStore';

import { QuestionBody } from '../../dataStore';

enum VD {
  EMAIL = 'helloworld@gmail.com',
  PASSWORD = '1234UNSW',
  NAMEFIRST = 'Jack',
  NAMELAST = 'Rizzella',
  EMAIL2 = 'helloworld1@gmail.com',
  PASSWORD2 = '4321UNSW',
  NAMEFIRST2 = 'Jamie',
  NAMELAST2 = 'Oliver',
  QUIZNAME = 'World Quiz',
  QUIZDESCRIPTION = 'About flags, countries and capitals!',
  QUIZNAME2 = 'Soccer Quiz',
  QUIZDESCRIPTION2 = 'GOOOAAAALLLL (Part 2)',
  IMAGEURL = 'https://cdn.sefinek.net/images/animals/cat/cat-story-25-1377426-min.jpg',
}

const sampleQuestion1: QuestionBody = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [
    {
      answer: 'Prince Charles',
      correct: true
    },
    {
      answer: 'Queen Elizabeth',
      correct: true
    }
  ],
  thumbnailUrl: VD.IMAGEURL,
};

beforeEach(() => {
  clear();
});

afterAll(() => {
  clear();
});

describe('Tests for adminQuizList', () => {
  test('Invalid token', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizList(user.body.token + 1);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // 'Invalid token'
    expect(response.statusCode).toStrictEqual(401);
  });

  test('No quiz created by a user', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const response = requestAdminQuizList(user.body.token);
    expect(response.body).toStrictEqual({ quizzes: [] }); // 'This user doesn't own any quizzes.' (Return empty array)
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Successful output of quizzes owned by a User', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizList(user.body.token);
    expect(response.body).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz.body.quizId,
            name: expect.any(String),
          }
        ]
      });
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Multiple quizzes created and a list of multiple quizzes outputted', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz1 = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quiz2 = requestAdminQuizCreate(user.body.token, VD.QUIZNAME2, VD.QUIZDESCRIPTION2);
    const response = requestAdminQuizList(user.body.token);
    expect(response.body).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz1.body.quizId,
            name: expect.any(String),
          },
          {
            quizId: quiz2.body.quizId,
            name: expect.any(String),
          },
        ]
      });
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Non quiz owner -> no list, quiz owner -> gives list', () => {
    const user1 = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreate(user1.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);

    const user2Response = requestAdminQuizList(user2.body.token);
    expect(user2Response.body).toStrictEqual({ quizzes: [] }); // 'This user doesn't own any quizzes'

    const user1Response = requestAdminQuizList(user1.body.token);
    expect(user1Response.body).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz.body.quizId,
            name: expect.any(String),
          }
        ]
      });
    expect(user1Response.statusCode).toStrictEqual(200);
    expect(user2Response.statusCode).toStrictEqual(200);
  });
});

describe('Tests for AdminQuizCreate', () => {
  // Clear the database, and then make an user so that we can generate quizzes.
  test('Successful Quiz Created', () => {
    // user = {authUserId: number}
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const response = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(response.body).toStrictEqual({ quizId: expect.any(Number) });
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Contains Symbol', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const response = requestAdminQuizCreate(user.body.token, 'hell o1!', VD.QUIZDESCRIPTION);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // 'Invalid Characters'
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Less Than 3 Characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const response = requestAdminQuizCreate(user.body.token, 'h1', VD.QUIZDESCRIPTION);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // 'Name Too Short'
    expect(response.statusCode).toStrictEqual(400);
  });
  test('More Than 30 Characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const response = requestAdminQuizCreate(user.body.token, 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhh1', VD.QUIZDESCRIPTION);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // 'Name Too Long'
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Existing Quiz', () => {
    // Quiz with the same name has already been
    // created by the user which mean this assumes
    // a quiz already exists
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // Existing Quiz
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Token is not valid', () => {
    // using 2 for now since the return for authUserId is currently 1
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const response = requestAdminQuizCreate(user.body.token + 1, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // Invalid Token
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Description is More than 100 Characters', () => {
    // using 2 for now since the return for authUserId is currently 1
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const response = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, 'This description is to be really long' +
    "and even longer than 100 characters which I don't really know how to do");
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // Description Too Long
    expect(response.statusCode).toStrictEqual(400);
  });
});

describe('Tests for adminQuizRemove', () => {
  test('Invalid Token.', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);

    const response = requestAdminQuizRemove(user.body.token + 1, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Invalid quiz ID.', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);

    const response = requestAdminQuizRemove(user.body.token, quiz.body.quizId + 1);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('User does not own quiz.', () => {
    const user1 = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreate(user1.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);

    const response = requestAdminQuizRemove(user2.body.token, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });

  test('Correct parameters given.', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);

    const response = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
  });
});

describe('Tests for adminQuizInfo', () => {
  test('Invalid token', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizInfo(user.body.token + 1, quiz.body.quizId);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // 'authUserId is not a valid Id'
    expect(response.statusCode).toStrictEqual(401);
  });

  test('User is accessing a quiz that doesnt exit', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizInfo(user.body.token, quiz.body.quizId + 1);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // 'Quiz does not exist'
    expect(response.statusCode).toStrictEqual(400);
  });

  test('User is accessing a quiz that the user does not own', () => {
    const user1 = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreate(user1.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizInfo(user2.body.token, quiz.body.quizId);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // 'Quiz is not owned by user'
    expect(response.statusCode).toStrictEqual(403);
  });

  test('Successful retrival of quiz info', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizInfo(user.body.token, quiz.body.quizId);
    expect(response.body).toStrictEqual(
      {
        quizId: quiz.body.quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
        numQuestions: expect.any(Number),
        questions: [], // Since we havent added any questions this should be empty
        duration: expect.any(Number),
      }
    );
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Multiple quizzes created and info checked', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz1 = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quiz2 = requestAdminQuizCreate(user.body.token, VD.QUIZNAME2, VD.QUIZDESCRIPTION2);
    const response1 = requestAdminQuizInfo(user.body.token, quiz1.body.quizId);
    expect(response1.body).toStrictEqual(
      {
        quizId: quiz1.body.quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
        numQuestions: expect.any(Number),
        questions: [], // Since we havent added any questions this should be empty
        duration: expect.any(Number),
      }
    );
    expect(response1.statusCode).toStrictEqual(200);

    const response2 = requestAdminQuizInfo(user.body.token, quiz2.body.quizId);
    expect(response2.body).toStrictEqual(
      {
        quizId: quiz2.body.quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number),
      }
    );
    expect(response2.statusCode).toStrictEqual(200);
  });

  test('Quizzes made with some questions added to it.', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const addedQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const response = requestAdminQuizInfo(user.body.token, quiz.body.quizId);
    expect(response.body).toStrictEqual(
      {
        quizId: quiz.body.quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
        numQuestions: expect.any(Number),
        questions: [
          {
            questionId: addedQuestion.body.questionId,
            question: expect.any(String),
            duration: expect.any(Number),
            points: expect.any(Number),
            // Since all questions require at least 2 answer options
            answers: [
              {
                answerId: expect.any(Number),
                answer: expect.any(String),
                colour: expect.any(String),
                correct: expect.any(Boolean),
              },
              {
                answerId: expect.any(Number),
                answer: expect.any(String),
                colour: expect.any(String),
                correct: expect.any(Boolean),
              }
            ],
          }
        ],
        duration: expect.any(Number),
      }
    );
    // Additional check of colour
    const colour = response.body.questions[0].answers[0].colour;
    const coloursArray = Object.values(colours);
    expect(coloursArray).toContain(colour);
    expect(response.statusCode).toStrictEqual(200);
  });
});

describe('Tests for adminQuizNameUpdate', () => {
  // Clear and create a valid quiz and user for the test to apply requestAdminQuizNameUpdate
  test('Sucessfully updated quiz name', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user.body.token, quiz.body.quizId, 'Valid Name');
    expect(response.body).toStrictEqual({}); // Returns {} on success
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Invalid Token', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user.body.token + 1, quiz.body.quizId, 'Valid Name');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // authUserId isnt valid
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Given QuizID does not match a valid quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user.body.token, quiz.body.quizId + 1, 'Valid Name');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // No matching QuizID
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Given QuizID is not owned by user', () => {
    const user1 = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreate(user1.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user2.body.token, quiz.body.quizId, 'New Name');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // User2 does not own the quiz
    expect(response.statusCode).toStrictEqual(403);
  });

  test('Name contains invalid characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user.body.token, quiz.body.quizId, 'Inval!d Name');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // Updated quiz name contains symbols
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Name is Less than 3 characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user.body.token, quiz.body.quizId, 'to');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // Updated quiz name is too short (<3)
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Name is More than 30 characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user.body.token, quiz.body.quizId, 'theGivenUpdatedNameIsWayTooLong');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // Updated name is too long (>30)
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Name is already used by current logged in user for another quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quiz2 = requestAdminQuizCreate(user.body.token, VD.QUIZNAME2, VD.QUIZDESCRIPTION2);
    const response = requestAdminQuizNameUpdate(user.body.token, quiz2.body.quizId, VD.QUIZNAME2);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // User already owns a quiz with the provided name
    expect(response.statusCode).toStrictEqual(400);
  });
});

describe('Tests for adminQuizDescriptionUpdate', () => {
  // Clear and create a valid quiz and user for the test to apply adminQuizDescriptionUpdate
  test('Sucessfully updated quiz description', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizDescriptionUpdate(user.body.token, quiz.body.quizId, 'Valid Description');
    expect(response.body).toStrictEqual({}); // Returns {} on success
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Invalid Token', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizDescriptionUpdate(user.body.token + 1, quiz.body.quizId, 'Valid Description');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // authUserId isnt valid
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Given QuizID does not match a valid quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizDescriptionUpdate(user.body.token, quiz.body.quizId + 1, 'New Description');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // No matching QuizID
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Given QuizID is not owned by user', () => {
    const user1 = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreate(user1.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizDescriptionUpdate(user2.body.token, quiz.body.quizId, 'New Description');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // User2 does not own the quiz
    expect(response.statusCode).toStrictEqual(403);
  });

  test('Name is More than 100 characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const response = requestAdminQuizDescriptionUpdate(user.body.token, quiz.body.quizId, 'theGivenUpdatedNameIsWaaaaaaaaaaaaaaaaaaaaaaayTooLong' +
    'RanOutOfThingsToTypeSoHereIGoOnRambling' + 'ReallyHopeThisIsEnough');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // Updated quiz description is too long (>100)
    expect(response.statusCode).toStrictEqual(400);
  });
});

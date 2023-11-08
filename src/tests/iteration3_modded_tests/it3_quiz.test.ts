import {
  requestAdminAuthRegister,
  requestAdminQuizListV2,
  requestAdminQuizCreateV2,
  requestAdminQuizRemoveV2,
  requestAdminQuizInfoV2,
  requestAdminQuizNameUpdateV2,
  requestAdminQuizDescriptionUpdateV2,
  requestAdminQuizTrashV2,
  requestAdminQuizTrashRestoreV2,
  requestAdminTrashRemoveV2,
  requestAdminQuizTransferV2,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizQuestionUpdateV2,
  requestAdminQuizQuestionDeleteV2,
  requestAdminQuizQuestionMoveV2,
  requestAdminQuizQuestionDuplicateV2,
  clear,
} from '../test-helpers';

import { expect } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import HTTPError from 'http-errors';
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
    IMAGEURL = 'https://www.digiseller.ru/preview/859334/p1_3713459_42ca8c03.jpg'
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
  ]
};

const sampleQuestion2: QuestionBody = {
  question: 'What is 2 + 2?',
  duration: 1,
  points: 1,
  answers: [
    {
      answer: '2',
      correct: true
    },
    {
      answer: '6',
      correct: false
    }
  ]
};

beforeEach(() => {
  clear();
});

afterAll(() => {
  clear();
});

const invalidId = uuidv4();

describe('Tests for adminQuizListV2', () => {
  test('Invalid token', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizListV2(invalidId)).toThrow(HTTPError[401]);
  });

  test('No quiz created by a user', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(requestAdminQuizListV2(user.body.token).body).toStrictEqual({ quizzes: [] });
  });

  test('Successful output of quizzes owned by a User', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(requestAdminQuizListV2(user.body.token).body).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz.body.quizId,
            name: expect.any(String),
          }
        ]
      });
  });

  test('Multiple quizzes created and a list of multiple quizzes outputted', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz1 = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quiz2 = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME2, VD.QUIZDESCRIPTION2);
    expect(requestAdminQuizListV2(user.body.token).body).toStrictEqual(
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
  });

  test('Non quiz owner -> no list, quiz owner -> gives list', () => {
    const user1 = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user1.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(requestAdminQuizListV2(user2.body.token).body).toStrictEqual({ quizzes: [] }); // 'This user doesn't own any quizzes'
    expect(requestAdminQuizListV2(user1.body.token).body).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz.body.quizId,
            name: expect.any(String),
          }
        ]
      });
  });
});

describe('Tests for AdminQuizCreate', () => {
  test('Successful Quiz Created', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION).body).toStrictEqual({ quizId: expect.any(Number) });
  });
  test('Contains Symbol', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminQuizCreateV2(user.body.token, 'hell o1!', VD.QUIZDESCRIPTION)).toThrow(HTTPError[400]);
  });
  test('Less Than 3 Characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminQuizCreateV2(user.body.token, 'h1', VD.QUIZDESCRIPTION)).toThrow(HTTPError[400]);
  });
  test('More Than 30 Characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminQuizCreateV2(user.body.token, 'h'.repeat(30) + '1', VD.QUIZDESCRIPTION)).toThrow(HTTPError[400]);
  });
  test('Existing Quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION)).toThrow(HTTPError[400]);
  });
  test('Token is not valid', () => {
    requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminQuizCreateV2(invalidId, VD.QUIZNAME, VD.QUIZDESCRIPTION)).toThrow(HTTPError[401]);
  });
  test('Description is More than 100 Characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(() => requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, 'd'.repeat(150))).toThrow(HTTPError[400]);
  });
});

describe('Tests for adminQuizRemove', () => {
  test('Invalid Token.', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizRemoveV2(invalidId, quiz.body.quizId)).toThrow(HTTPError[401]);
  });

  test('Invalid quiz ID.', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId + 1)).toThrow(HTTPError[400]);
  });

  test('User does not own quiz.', () => {
    const user1 = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user1.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizRemoveV2(user2.body.token, quiz.body.quizId)).toThrow(HTTPError[403]);
  });

  test('Correct parameters given.', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId).body).toStrictEqual({});
  });
});

describe('Tests for adminQuizInfo', () => {
  test('Invalid token', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizInfoV2(invalidId, quiz.body.quizId)).toThrow(HTTPError[401]);
  });

  test('User is accessing a quiz that doesnt exit', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizInfoV2(user.body.token, quiz.body.quizId + 1)).toThrow(HTTPError[400]);
  });

  test('User is accessing a quiz that the user does not own', () => {
    const user1 = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user1.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizInfoV2(user2.body.token, quiz.body.quizId)).toThrow(HTTPError[403]);
  });

  test('Successful retrival of quiz info', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(requestAdminQuizInfoV2(user.body.token, quiz.body.quizId).body).toStrictEqual(
      {
        quizId: quiz.body.quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
        numQuestions: expect.any(Number),
        questions: [],
        duration: expect.any(Number),
      }
    );
  });

  test('Multiple quizzes created and info checked', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz1 = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quiz2 = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME2, VD.QUIZDESCRIPTION2);
    expect(requestAdminQuizInfoV2(user.body.token, quiz1.body.quizId).body).toStrictEqual(
      {
        quizId: quiz1.body.quizId,
        name: VD.QUIZNAME,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: VD.QUIZDESCRIPTION,
        numQuestions: 0,
        questions: [],
        duration: expect.any(Number),
      }
    );
    expect(requestAdminQuizInfoV2(user.body.token, quiz2.body.quizId).body).toStrictEqual(
      {
        quizId: quiz2.body.quizId,
        name: VD.QUIZNAME2,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: VD.QUIZDESCRIPTION2,
        numQuestions: 0,
        questions: [],
        duration: expect.any(Number),
      }
    );
  });

  test('Quizzes made with some questions added to it.', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const addedQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const response = requestAdminQuizInfoV2(user.body.token, quiz.body.quizId);
    expect(response.body).toStrictEqual(
      {
        quizId: quiz.body.quizId,
        name: VD.QUIZNAME,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: VD.QUIZDESCRIPTION,
        numQuestions: expect.any(Number),
        questions: [
          {
            questionId: addedQuestion.body.questionId,
            question: sampleQuestion1.question,
            duration: sampleQuestion1.duration,
            points: sampleQuestion1.points,
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
  });
});

describe('Tests for adminQuizNameUpdate', () => {
  test('Sucessfully updated quiz name', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(requestAdminQuizNameUpdateV2(user.body.token, quiz.body.quizId, 'Valid Name').body).toStrictEqual({});
  });

  test('Invalid Token', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizNameUpdateV2(invalidId, quiz.body.quizId, 'Valid Name')).toThrow(HTTPError[401]);
  });

  test('Given QuizID does not match a valid quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizNameUpdateV2(user.body.token, quiz.body.quizId + 1, 'Valid Name')).toThrow(HTTPError[400]);
  });

  test('Given QuizID is not owned by user', () => {
    const user1 = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user1.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizNameUpdateV2(user2.body.token, quiz.body.quizId, 'New Name')).toThrow(HTTPError[403]);
  });

  test('Name contains invalid characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizNameUpdateV2(user.body.token, quiz.body.quizId, 'Inval!d Name')).toThrow(HTTPError[400]);
  });

  test('Name is Less than 3 characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizNameUpdateV2(user.body.token, quiz.body.quizId, 'to')).toThrow(HTTPError[400]);
  });
  test('Name is More than 30 characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizNameUpdateV2(user.body.token, quiz.body.quizId, 'theGivenUpdatedNameIsWayTooLong')).toThrow(HTTPError[400]);
  });
  test('Name is already used by current logged in user for another quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quiz2 = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME2, VD.QUIZDESCRIPTION2);
    expect(() => requestAdminQuizNameUpdateV2(user.body.token, quiz2.body.quizId, VD.QUIZNAME2)).toThrow(HTTPError[400]);
  });
});

describe('Tests for adminQuizDescriptionUpdate', () => {
  test('Sucessfully updated quiz description', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(requestAdminQuizDescriptionUpdateV2(user.body.token, quiz.body.quizId, 'Valid Description').body).toStrictEqual({});
  });

  test('Invalid Token', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizDescriptionUpdateV2(invalidId, quiz.body.quizId, 'Valid Description')).toThrow(HTTPError[401]);
  });

  test('Given QuizID does not match a valid quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizDescriptionUpdateV2(user.body.token, quiz.body.quizId + 1, 'New Description')).toThrow(HTTPError[400]);
  });

  test('Given QuizID is not owned by user', () => {
    const user1 = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user1.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizDescriptionUpdateV2(user2.body.token, quiz.body.quizId, 'New Description')).toThrow(HTTPError[403]);
  });

  test('Name is More than 100 characters', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizDescriptionUpdateV2(user.body.token, quiz.body.quizId, 't'.repeat(150))).toThrow(HTTPError[400]);
  });
});

describe('Tests for adminQuizTrash', () => {
  test('Successful Trash List', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId).body).toStrictEqual({});
    expect(requestAdminQuizListV2(user.body.token).body).toStrictEqual({
      quizzes: [],
    });
    expect(requestAdminQuizTrashV2(user.body.token).body).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.body.quizId,
          name: expect.any(String),
        }
      ]
    });
  });

  test('Empty Trash List', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    expect(requestAdminQuizTrashV2(user.body.token).body).toStrictEqual({
      quizzes: []
    });
  });

  test('Successful Multiple Trash List', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quiz2 = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME2, VD.QUIZDESCRIPTION2);
    requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId);
    requestAdminQuizRemoveV2(user.body.token, quiz2.body.quizId);
    expect(requestAdminQuizTrashV2(user.body.token).body).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.body.quizId,
          name: VD.QUIZNAME,
        }, {
          quizId: quiz2.body.quizId,
          name: VD.QUIZNAME2,
        },
      ]
    });
  });

  test('Invalid token', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId);
    expect(() => requestAdminQuizTrashV2(invalidId).body).toThrow(HTTPError[401]);
  });
});
describe('Tests to Empty adminQuizTrashRemove', () => {
  test('Successful Trash Empty', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId);
    expect(requestAdminTrashRemoveV2(user.body.token, [quiz.body.quizId]).body).toStrictEqual({});
    expect(requestAdminQuizTrashV2(user.body.token).body).toStrictEqual({ quizzes: [] });
  });
  test('Successful Trash Empty, but for one quiz when there is two quiz in trash', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quiz2 = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME2, VD.QUIZDESCRIPTION2);
    requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId);
    requestAdminQuizRemoveV2(user.body.token, quiz2.body.quizId);
    expect(requestAdminTrashRemoveV2(user.body.token, [quiz.body.quizId]).body).toStrictEqual({});
    expect(requestAdminQuizTrashV2(user.body.token).body).toStrictEqual({
      quizzes: [
        {
          quizId: quiz2.body.quizId,
          name: VD.QUIZNAME2,
        },
      ]
    });
  });

  test('quizId is not in the Trash', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminTrashRemoveV2(user.body.token, [quiz.body.quizId])).toThrow(HTTPError[400]);
  });

  test('quizId is not Valid', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId);
    expect(() => requestAdminTrashRemoveV2(user.body.token, [quiz.body.quizId + 1])).toThrow(HTTPError[403]);
  });

  test('User does not own Quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId);
    expect(() => requestAdminTrashRemoveV2(user2.body.token, [quiz.body.quizId])).toThrow(HTTPError[403]);
  });

  test('Invalid token', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId);
    expect(() => requestAdminTrashRemoveV2(invalidId, [quiz.body.quizId])).toThrow(HTTPError[401]);
  });

  test('Valid Token, User is not Owner of Quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId);
    expect(() => requestAdminTrashRemoveV2(user2.body.token, [quiz.body.quizId])).toThrow(HTTPError[403]);
  });
});

describe('Testing adminQuizTransfer', () => {
  test('Successful adminQuizTransfer', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(requestAdminQuizTransferV2(user.body.token, VD.EMAIL2, quiz.body.quizId).body).toStrictEqual({});
    // Confirm user no longer has quiz and that user2 now posseses quiz
    expect(requestAdminQuizListV2(user.body.token).body).toStrictEqual({ quizzes: [] });
    expect(requestAdminQuizListV2(user2.body.token).body).toStrictEqual(
      {
        quizzes:
          [{
            quizId: quiz.body.quizId,
            name: VD.QUIZNAME,
          }]
      });
  });

  test('Unsuccessful adminQuizTransfer, quizId does not refer to a valid quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizTransferV2(user.body.token, VD.EMAIL2, -666)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful adminQuizTransfer, userEmail is not a real user', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizTransferV2(user.body.token, 'notRealUser@gmail.com', quiz.body.quizId)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful adminQuizTransfer, userEmail is the current logged in user', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizTransferV2(user.body.token, VD.EMAIL, quiz.body.quizId)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful adminQuizTransfer, quizId refers to a quiz that has a name that is already used by the target user', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizCreateV2(user2.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION2);
    expect(() => requestAdminQuizTransferV2(user.body.token, VD.EMAIL2, quiz.body.quizId)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful adminQuizTransfer, token is empty', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizTransferV2('', VD.EMAIL2, quiz.body.quizId)).toThrow(HTTPError[401]);
  });

  test('Unsuccessful adminQuizTransfer, token is invalid', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizTransferV2('-666', VD.EMAIL2, quiz.body.quizId)).toThrow(HTTPError[401]);
  });

  test('Unsuccessful adminQuizTransfer, token is valid but user does not own this quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizTransferV2(user2.body.token, VD.EMAIL2, quiz.body.quizId)).toThrow(HTTPError[403]);
  });
});

describe('Tests for adminQuizQuestionCreate', () => {
  test('Successful quiz question creation', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1).body).toStrictEqual({ questionId: expect.any(Number) });
  });

  // Since signular question creation is tested in Info, we can skip that test.
  test('Quiz with multiple questions added', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question1 = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const question2 = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion2);

    const quizInfo = requestAdminQuizInfoV2(user.body.token, quiz.body.quizId);
    expect(quizInfo.body).toStrictEqual(
      {
        quizId: quiz.body.quizId,
        name: VD.QUIZNAME,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: VD.QUIZDESCRIPTION,
        numQuestions: expect.any(Number),
        questions: [
          {
            questionId: question1.body.questionId,
            question: sampleQuestion1.question,
            duration: sampleQuestion1.duration,
            points: sampleQuestion1.points,
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
          },
          {
            questionId: question2.body.questionId,
            question: sampleQuestion2.question,
            duration: sampleQuestion2.duration,
            points: sampleQuestion2.points,
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
    const colour1 = quizInfo.body.questions[0].answers[0].colour;
    const coloursArray = Object.values(colours);
    expect(coloursArray).toContain(colour1);

    // Additional check if timeLastEdited was updated
    const currentTime = new Date();
    const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
    const timeLastEdited = unixtimeSeconds;
    const recordedTimeLastEdited = quizInfo.body.timeLastEdited;
    expect(timeLastEdited).toBeGreaterThanOrEqual(recordedTimeLastEdited);
    expect(timeLastEdited).toBeLessThanOrEqual(recordedTimeLastEdited + 2);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    expect(() => requestAdminQuizQuestionCreateV2(-1, user.body.token, questionBody)).toThrow(HTTPError[400]);
  });

  test('Question string is less than 5 characters in length or greater than 50 characters in length', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const questionBody = {
      question: 'abcd',
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    expect(() => requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody)).toThrow(HTTPError[400]);

    const questionBody2 = {
      question: 'a'.repeat(51),
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    expect(() => requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody2)).toThrow(HTTPError[400]);
  });

  test('The question has more than 6 answers or less than 2 answers', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const quiz2 = requestAdminQuizCreateV2(user.body.token, 'Gross Chiggen', VD.QUIZDESCRIPTION);

    const answers2 = [
      { answer: 'Chicken', correct: true },
      { answer: 'Lettuce', correct: true },
      { answer: 'Concrete', correct: false },
      { answer: 'Bricks', correct: false },
      { answer: 'Beef', correct: true },
      { answer: 'Mice', correct: false },
      { answer: 'Nutes', correct: true },
    ];

    const answers3 = [{ answer: 'Concrete', correct: false }];

    const questionBody1 = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers2,
    };
    expect(() => requestAdminQuizQuestionCreateV2(quiz2.body.quizId, user.body.token, questionBody1)).toThrow(HTTPError[400]);

    const questionBody2 = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers3,
    };
    expect(() => requestAdminQuizQuestionCreateV2(quiz2.body.quizId, user.body.token, questionBody2)).toThrow(HTTPError[400]);
  });

  test('The question duration is not a positive number', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: -1,
      points: question.points,
      answers: answers,
    };
    expect(() => requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody)).toThrow(HTTPError[400]);
  });

  test('The sum of the question durations in quiz exceeds 3 minutes', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const quiz1 = requestAdminQuizCreateV2(user.body.token, 'Chiggen', VD.QUIZDESCRIPTION);
    const question1 = {
      question: 'What does KFC sell?',
      duration: 160,
      points: 5,
    };
    const question2 = {
      question: 'What does KFC sell?',
      duration: 40,
      points: 5,
    };
    const questionBody1 = {
      question: question1.question,
      duration: question1.duration,
      points: question1.points,
      answers: answers,
    };
    const questionBody2 = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: answers,
    };

    requestAdminQuizQuestionCreateV2(quiz1.body.quizId, user.body.token, questionBody1);
    expect(() => requestAdminQuizQuestionCreateV2(quiz1.body.quizId, user.body.token, questionBody2)).toThrow(HTTPError[400]);
  });

  test('The points awarded for the question are less than 1 or greater than 10', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const questionBody1 = {
      question: question.question,
      duration: question.duration,
      points: 0,
      answers: answers,
    };
    const questionBody2 = {
      question: question.question,
      duration: question.duration,
      points: 11,
      answers: answers,
    };
    expect(() => requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody1)).toThrow(HTTPError[400]);
    expect(() => requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody2)).toThrow(HTTPError[400]);
  });

  test('The length of any answer is shorter than 1 character long or longer than 30 characters long', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const noCharacterAnswer = [
      { answer: '', correct: false },
      { answer: 'something', correct: true },
    ];
    const questionBody1 = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: noCharacterAnswer,
    };
    expect(() => requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody1)).toThrow(HTTPError[400]);

    const manyCharacterAnswer = [
      { answer: 'a'.repeat(31), correct: false },
      { answer: 'cheese', correct: true }
    ];
    const questionBody2 = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: manyCharacterAnswer,
    };
    expect(() => requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody2)).toThrow(HTTPError[400]);
  });

  test('Any answer strings are duplicates of one another (within the same question)', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const sameAnswers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Chicken', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: sameAnswers,
    };
    expect(() => requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody)).toThrow(HTTPError[400]);
  });

  test('There are no correct answers', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const incorrectAnswersOnly = [
      { answer: 'Chicken', correct: false },
      { answer: 'Nuggets', correct: false }
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: incorrectAnswersOnly,
    };
    expect(() => requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody)).toThrow(HTTPError[400]);
  });

  test('Token is empty or invalid (does not refer to valid logged in user session', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    expect(() => requestAdminQuizQuestionCreateV2(quiz.body.quizId, invalidId, questionBody)).toThrow(HTTPError[401]);
    expect(() => requestAdminQuizQuestionCreateV2(quiz.body.quizId, '', questionBody)).toThrow(HTTPError[401]);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    const user1 = requestAdminAuthRegister('drizman123@gmail.com', VD.PASSWORD, 'Driz', 'Haj');
    expect(() => requestAdminQuizQuestionCreateV2(quiz.body.quizId, user1.body.token, questionBody)).toThrow(HTTPError[403]);
  });
});

describe('Tests for adminQuizQuestionDelete', () => {
  test('Successful adminQuizQuestionDelete', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    const quizQuestionId = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody);
    expect(requestAdminQuizQuestionDeleteV2(quiz.body.quizId, quizQuestionId.body.questionId, user.body.token).body).toStrictEqual({});
    expect(requestAdminQuizInfoV2(user.body.token, quiz.body.quizId).body.questions).toStrictEqual([]);
  });

  test('Unsuccessful call, questionId does not refer to a valid question within this quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody);
    expect(() => requestAdminQuizQuestionDeleteV2(quiz.body.quizId, -666, user.body.token)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, token is empty', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    const quizQuestionId = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody);
    expect(() => requestAdminQuizQuestionDeleteV2(quiz.body.quizId, quizQuestionId.body.questionId, '')).toThrow(HTTPError[401]);
  });

  test('Unsuccessful call, token is invalid', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    const quizQuestionId = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody);
    expect(() => requestAdminQuizQuestionDeleteV2(quiz.body.quizId, quizQuestionId.body.questionId, '-666')).toThrow(HTTPError[401]);
  });

  test('Unsuccessful call, token is valid but user is not a owner of this quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    const quizQuestionId = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody);
    expect(() => requestAdminQuizQuestionDeleteV2(quiz.body.quizId, quizQuestionId.body.questionId, user2.body.token)).toThrow(HTTPError[403]);
  });
});

describe('Tests for adminQuizQuestionDuplicate', () => {
  test('Successful quizQuestionDuplicate', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody);
    expect(requestAdminQuizQuestionDuplicateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token).body).toStrictEqual(
      {
        newQuestionId: expect.any(Number)
      }
    );
    const quizInfoNew = requestAdminQuizInfoV2(user.body.token, quiz.body.quizId);
    expect(quizInfoNew.body.questions).toStrictEqual(
      [
        {
          questionId: quizQuestion.body.questionId, // Should now be question 1
          question: question.question,
          duration: question.duration,
          points: question.points,
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
        },
        {
          questionId: expect.any(Number), // Should now be question 1's duplicate
          question: question.question,
          duration: question.duration,
          points: question.points,
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
        },
      ]
    );
    // Additional check if timeLastEdited was updated
    const currentTime = new Date();
    const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
    const timeLastEdited = unixtimeSeconds;
    const recordedTimeLastEdited = quizInfoNew.body.timeLastEdited;
    expect(timeLastEdited).toBeGreaterThanOrEqual(recordedTimeLastEdited);
    expect(timeLastEdited).toBeLessThanOrEqual(recordedTimeLastEdited + 2);
  });

  test('Unsuccessful call, questionId does not refer to a valid question within quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    expect(() => requestAdminQuizQuestionDuplicateV2(quiz.body.quizId, -666, user.body.token)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, token is empty or invalid', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    expect(() => requestAdminQuizQuestionDuplicateV2(quiz.body.quizId, quizQuestion.body.questionId, '')).toThrow(HTTPError[401]);
    expect(() => requestAdminQuizQuestionDuplicateV2(quiz.body.quizId, quizQuestion.body.questionId, invalidId)).toThrow(HTTPError[401]);
  });

  test('Unsuccessful call, valid token but user is not an owner of quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    expect(() => requestAdminQuizQuestionDuplicateV2(quiz.body.quizId, quizQuestion.body.questionId, user2.body.token)).toThrow(HTTPError[403]);
  });
});

describe('Tests for adminQuizQuestionMove', () => {
  // Create newPosition, this should be 0 as if we create two questions we can move second question to index 0.
  const newPosition = 0;
  test('Successful adminQuizQuestionMove', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const answers2 = [
      { answer: 'Apples', correct: true },
      { answer: 'Iphones', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    const questionBody2 = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: answers2,
    };
      // Create quizQuestion for move (In same Quiz)
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody);
    const quizQuestion2 = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody2);
    // This case will test if the second question will be moved to first place
    expect(requestAdminQuizQuestionMoveV2(quiz.body.quizId, quizQuestion2.body.questionId, user.body.token, newPosition).body).toStrictEqual({});
    // Check if parameters were updated
    const quizInfoNew = requestAdminQuizInfoV2(user.body.token, quiz.body.quizId);
    expect(quizInfoNew.body.questions).toStrictEqual(
      [
        {
          questionId: quizQuestion2.body.questionId, // Should now be question 2
          question: question2.question,
          duration: question2.duration,
          points: question2.points,
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
        },
        {
          questionId: quizQuestion.body.questionId, // Should now be question 1
          question: question.question,
          duration: question.duration,
          points: question.points,
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
        },
      ]
    );
    // Additional check if timeLastEdited was updated
    const currentTime = new Date();
    const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
    const timeLastEdited = unixtimeSeconds;
    const recordedTimeLastEdited = quizInfoNew.body.timeLastEdited;
    expect(timeLastEdited).toBeGreaterThanOrEqual(recordedTimeLastEdited);
    expect(timeLastEdited).toBeLessThanOrEqual(recordedTimeLastEdited + 2);
  });

  test('Unsuccessful Call, questionId does not refer to a valid question within the quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion2);
    expect(() => requestAdminQuizQuestionMoveV2(quiz.body.quizId, -666, user.body.token, newPosition)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful Call, newPosition is less than 0', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion2);
    expect(() => requestAdminQuizQuestionMoveV2(quiz.body.quizId, quizQuestion2.body.questionId, user.body.token, -666)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful Call, newPosition is greater then n-1 where n is the number of questions', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion2);
    expect(() => requestAdminQuizQuestionMoveV2(quiz.body.quizId, quizQuestion2.body.questionId, user.body.token, 666)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful Call, newPosition is the position of the current question', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion2);
    expect(() => requestAdminQuizQuestionMoveV2(quiz.body.quizId, quizQuestion2.body.questionId, user.body.token, 1)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful Call, token is empty', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion2);
    expect(() => requestAdminQuizQuestionMoveV2(quiz.body.quizId, quizQuestion2.body.questionId, '', newPosition)).toThrow(HTTPError[401]);
  });

  test('Unsuccessful Call, token is invalid', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion2);
    expect(() => requestAdminQuizQuestionMoveV2(quiz.body.quizId, quizQuestion2.body.questionId, '-666', newPosition)).toThrow(HTTPError[401]);
  });

  test('Unsuccessful Call, token is valid but user is not owner of quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion2);
    expect(() => requestAdminQuizQuestionMoveV2(quiz.body.quizId, quizQuestion2.body.questionId, user2.body.token, newPosition)).toThrow(HTTPError[403]);
  });
});

describe('Tests for adminQuizQuestionUpdate', () => {
  test('Successful adminQuizQuestionUpdate', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const answers2 = [
      { answer: 'Apples', correct: true },
      { answer: 'Iphones', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    const questionBody2 = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: answers2,
    };
      // Create quizQuestion to update
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, questionBody);
    expect(requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBody2).body).toStrictEqual({});
    // Check if quizQuestion now contains questionBody2
    const quizInfoNew = requestAdminQuizInfoV2(user.body.token, quiz.body.quizId);
    expect(quizInfoNew.body.questions).toStrictEqual(
      [
        {
          questionId: quizQuestion.body.questionId,
          question: questionBody2.question,
          duration: questionBody2.duration,
          points: questionBody2.points,
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
        },
      ]
    );
    // Additional check of colour
    const colour1 = quizInfoNew.body.questions[0].answers[0].colour;
    const coloursArray = Object.values(colours);
    expect(coloursArray).toContain(colour1);

    // Additional check if timeLastEdited was updated
    const currentTime = new Date();
    const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
    const timeLastEdited = unixtimeSeconds;
    const recordedTimeLastEdited = quizInfoNew.body.timeLastEdited;
    expect(timeLastEdited).toBeGreaterThanOrEqual(recordedTimeLastEdited);
    expect(timeLastEdited).toBeLessThanOrEqual(recordedTimeLastEdited + 2);
  });

  test('Unsuccessful call, questionId does not refer to a valid question within this quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, -666, user.body.token, sampleQuestion2)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, questionString is less than 5 characters in length', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const answers2 = [
      { answer: 'Apples', correct: true },
      { answer: 'Iphones', correct: true },
    ];
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const questionBodyShort = {
      question: 'Shrt',
      duration: question2.duration,
      points: question2.points,
      answers: answers2,
    };
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyShort)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, questionString is greater then 50 characters in length', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const answers2 = [
      { answer: 'Apples', correct: true },
      { answer: 'Iphones', correct: true },
    ];
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const questionBodyLong = {
      question: 'Long'.repeat(51),
      duration: question2.duration,
      points: question2.points,
      answers: answers2,
    };
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyLong)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, question has more then 6 answers', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const tooManyAnswers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Lettuce', correct: true },
      { answer: 'Concrete', correct: false },
      { answer: 'Bricks', correct: false },
      { answer: 'Beef', correct: true },
      { answer: 'Mice', correct: false },
      { answer: 'Nutes', correct: true },
    ];
    const questionBodyTooManyAnswers = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: tooManyAnswers,
    };
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyTooManyAnswers)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, question has less than 2 answers', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const tooFewAnswers = [
      { answer: 'Chicken', correct: true },
    ];
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const questionBodyTooFewAnswers = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: tooFewAnswers,
    };
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyTooFewAnswers)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, question duration is not a positive number', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const answers2 = [
      { answer: 'Apples', correct: true },
      { answer: 'Iphones', correct: true },
    ];
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const questionBodyNegativeDuration = {
      question: question2.question,
      duration: -1,
      points: question2.points,
      answers: answers2,
    };
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyNegativeDuration)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, sum of all question durations in the quiz exceeds 3 minutes', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const answers2 = [
      { answer: 'Apples', correct: true },
      { answer: 'Iphones', correct: true },
    ];
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const questionBodyExcessiveDuration = {
      question: question2.question,
      duration: 200,
      points: question2.points,
      answers: answers2,
    };
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyExcessiveDuration)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, points awarded is less than 1', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const answers2 = [
      { answer: 'Apples', correct: true },
      { answer: 'Iphones', correct: true },
    ];
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const questionBodyNoPoints = {
      question: question2.question,
      duration: question2.duration,
      points: 0,
      answers: answers2,
    };
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyNoPoints)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, points awarded is greater than 10', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const answers2 = [
      { answer: 'Apples', correct: true },
      { answer: 'Iphones', correct: true },
    ];
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const questionBodyTooManyPoints = {
      question: question2.question,
      duration: question2.duration,
      points: 11,
      answers: answers2,
    };
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyTooManyPoints)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, length of any answer is shorter than 1 character long', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const emptyAnswer = [
      { answer: '', correct: false },
      { answer: 'Lettuce', correct: true },
    ];
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const questionBodyEmptyAnswer = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: emptyAnswer,
    };
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyEmptyAnswer)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, length of any answer is longer then 30 characters long', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const longAnswer = [
      { answer: 'a'.repeat(32), correct: false },
      { answer: 'Lettuce', correct: true },
    ];
    const questionBodyLongAnswer = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: longAnswer,
    };
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyLongAnswer)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, duplicate answers in the same question', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const duplicateAnswer = [
      { answer: 'Copy Paste', correct: true },
      { answer: 'Ctrl + C', correct: true },
      { answer: 'Copy Paste', correct: true },
    ];
    const questionBodyDuplicateAnswer = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: duplicateAnswer,
    };
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyDuplicateAnswer)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, no correct answers', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    const question2 = {
      question: 'What does APPLE sell?',
      duration: 1,
      points: 1,
    };
    const noCorrectAnswer = [
      { answer: 'No correct answers', correct: false },
      { answer: 'bruh someone forgot', correct: false }
    ];
    const questionBodyNoCorrectAnswer = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: noCorrectAnswer,
    };
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyNoCorrectAnswer)).toThrow(HTTPError[400]);
  });
  test('Unsuccessful call, token is empty or invalid', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, '', sampleQuestion2)).toThrow(HTTPError[401]);
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, invalidId, sampleQuestion2)).toThrow(HTTPError[401]);
  });
  test('Unsuccessful call, valid token but user is not authorised', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    expect(() => requestAdminQuizQuestionUpdateV2(quiz.body.quizId, quizQuestion.body.questionId, user2.body.token, sampleQuestion2)).toThrow(HTTPError[403]);
  });
});

describe('Tests for adminQuizTrashRestore', () => {
  test('Successful adminQuizTrashRestore', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId);
    // Check if the list of quizzes is empty after it is removed.
    expect(requestAdminQuizListV2(user.body.token).body.quizzes).toStrictEqual([]);
    expect(requestAdminQuizTrashRestoreV2(quiz.body.quizId, user.body.token).body).toStrictEqual({});
    // Check if quiz is updated to an active quiz
    expect(requestAdminQuizListV2(user.body.token).body.quizzes).toStrictEqual(
      [
        {
          quizId: quiz.body.quizId,
          name: VD.QUIZNAME,
        }
      ]
    );
    // Additional check if timeLastEdited was updated
    const quizInfoNew = requestAdminQuizInfoV2(user.body.token, quiz.body.quizId);
    const currentTime = new Date();
    const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
    const timeLastEdited = unixtimeSeconds;
    const recordedTimeLastEdited = quizInfoNew.body.timeLastEdited;
    expect(timeLastEdited).toBeGreaterThanOrEqual(recordedTimeLastEdited);
    expect(timeLastEdited).toBeLessThanOrEqual(recordedTimeLastEdited + 2);
  });

  test('Unsuccessful call, quizName of restored quiz is already used by another active quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId);
    requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION2);
    expect(() => requestAdminQuizTrashRestoreV2(quiz.body.quizId, user.body.token)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, quizId refers to a quiz that is not currently in trash', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    expect(() => requestAdminQuizTrashRestoreV2(quiz.body.quizId, user.body.token)).toThrow(HTTPError[400]);
  });

  test('Unsuccessful call, token is empt or invalid', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId);
    expect(() => requestAdminQuizTrashRestoreV2(quiz.body.quizId, '')).toThrow(HTTPError[401]);
    expect(() => requestAdminQuizTrashRestoreV2(quiz.body.quizId, invalidId)).toThrow(HTTPError[401]);
  });
  test('Unsuccessful call, valid token but user is not an owner of quiz', () => {
    const user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    const quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizRemoveV2(user.body.token, quiz.body.quizId);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    expect(() => requestAdminQuizTrashRestoreV2(quiz.body.quizId, user2.body.token)).toThrow(HTTPError[403]);
  });
});

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
  
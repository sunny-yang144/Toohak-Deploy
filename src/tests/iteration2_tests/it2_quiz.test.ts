import {
  requestAdminAuthRegister,
  requestAdminQuizList,
  requestAdminQuizCreate,
  requestAdminQuizInfo,
  requestAdminQuizRemove,
  requestAdminQuizTrash,
  requestAdminTrashRemove,
  requestAdminQuizTransfer,
  requestAdminQuizQuestionCreate,
  requestAdminQuizQuestionDelete,
  requestAdminQuizQuestionDuplicate,
  requestAdminQuizQuestionMove,
  requestAdminQuizQuestionUpdate,
  requestAdminQuizTrashRestore,
  clear,
} from '../test-helpers';

import { expect } from '@jest/globals';

import { v4 as uuidv4 } from 'uuid';

import { colours } from '../../dataStore';

import { QuestionBody } from '../../dataStore';

enum validDetails {
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
  QUIZDESCRIPTION2 = 'GOOOAAAALLLL (Part 2)'
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

describe('Tests for adminQuizTrash', () => {
  test('Successful Trash List', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    expect(remove.body).toStrictEqual({});

    // We expect the quizList to be empty
    const ownedQuizzesList = requestAdminQuizList(user.body.token);
    expect(ownedQuizzesList.body).toStrictEqual({
      quizzes: [],
    });

    const trashList = requestAdminQuizTrash(user.body.token);
    expect(trashList.body).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.body.quizId,
          name: expect.any(String),
        }
      ]
    });
    expect(trashList.statusCode).toStrictEqual(200);
  });

  test('Empty Trash List', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({
      quizzes: []
    });
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Successful Multiple Trash List', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quiz2 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME2, validDetails.QUIZDESCRIPTION2);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    requestAdminQuizRemove(user.body.token, quiz2.body.quizId);
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({
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
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Invalid token', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrash(user.body.token + 1);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // 'Invalid token'
    expect(response.statusCode).toStrictEqual(401);
  });
});
describe('Tests to Empty adminQuizTrashRemove', () => {
  test('Successful Trash Empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token, [quiz.body.quizId]); // needs to be an array of quizzes
    expect(clearTrash.statusCode).toStrictEqual(200);

    const checkTrash = requestAdminQuizTrash(user.body.token);
    expect(checkTrash.body).toStrictEqual({
      quizzes: []
    });
  });
  test('Successful Trash Empty, but for a quiz with questions', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token, [quiz.body.quizId]); // needs to be an array of quizzes
    expect(clearTrash.statusCode).toStrictEqual(200);

    const checkTrash = requestAdminQuizTrash(user.body.token);
    expect(checkTrash.body).toStrictEqual({
      quizzes: []
    });
  });

  test('quizId is not in the Trash', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const clearTrash = requestAdminTrashRemove(user.body.token, [quiz.body.quizId]);
    expect(clearTrash.body).toStrictEqual({ error: expect.any(String) });
    expect(clearTrash.statusCode).toStrictEqual(400);
  });

  // If a quizId is not valid, then it cant be owned by user so error 403 hits first.
  test('quizId is not Valid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token, [quiz.body.quizId + 1]);
    expect(clearTrash.body).toStrictEqual({ error: expect.any(String) });
    expect(clearTrash.statusCode).toStrictEqual(403);
  });

  test('User does not own Quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user2.body.token, [quiz.body.quizId]);
    expect(clearTrash.body).toStrictEqual({ error: expect.any(String) });
    expect(clearTrash.statusCode).toStrictEqual(403);
  });

  test('Invalid token', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const invalidToken = uuidv4();
    const clearTrash = requestAdminTrashRemove(invalidToken, [quiz.body.quizId]);
    expect(clearTrash.body).toStrictEqual({ error: expect.any(String) }); // 'Invalid token'
    expect(clearTrash.statusCode).toStrictEqual(401);
  });

  test('Valid Token, User is not Owner of Quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user2.body.token, [quiz.body.quizId]);
    expect(clearTrash.body).toStrictEqual({ error: expect.any(String) }); // 'Invalid token'
    expect(clearTrash.statusCode).toStrictEqual(403);
  });
});

describe('Testing adminQuizTransfer', () => {
  test('Successful adminQuizTransfer', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL2, quiz.body.quizId);
    // Check if function returns any errors
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Confirm user no longer has quiz and that user2 now posseses quiz
    const response1 = requestAdminQuizList(user.body.token);
    const response2 = requestAdminQuizList(user2.body.token);

    expect(response1.body).toStrictEqual({ quizzes: [] });
    expect(response2.body).toStrictEqual(
      {
        quizzes:
        [{
          quizId: quiz.body.quizId,
          name: validDetails.QUIZNAME,
        }]
      });
  });

  test('Unsuccessful adminQuizTransfer, quizId does not refer to a valid quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL2, -666);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful adminQuizTransfer, userEmail is not a real user', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizTransfer(user.body.token, 'notRealUser@gmail.com', quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful adminQuizTransfer, userEmail is the current logged in user', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful adminQuizTransfer, quizId refers to a quiz that has a name that is already used by the target user', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizCreate(user2.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION2);
    const response = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL2, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful adminQuizTransfer, token is empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizTransfer('', validDetails.EMAIL2, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful adminQuizTransfer, token is invalid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizTransfer('-666', validDetails.EMAIL2, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful adminQuizTransfer, token is valid but user does not own this quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizTransfer(user2.body.token, validDetails.EMAIL2, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe('Tests for adminQuizQuestionCreate', () => {
  test('Successful quiz question creation', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    expect(quizQuestion.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(quizQuestion.statusCode).toStrictEqual(200);
  });

  // Since signular question creation is tested in Info, we can skip that test.
  test('Quiz with multiple questions added', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion1 = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion2);
    expect(quizQuestion1.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(quizQuestion1.statusCode).toStrictEqual(200);

    // Checking if the quiz actually contains two question
    const quizInfo = requestAdminQuizInfo(user.body.token, quiz.body.quizId);
    expect(quizInfo.body).toStrictEqual(
      {
        quizId: quiz.body.quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
        numQuestions: expect.any(Number),
        questions: [
          {
            questionId: quizQuestion1.body.questionId,
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
          },
          {
            questionId: quizQuestion2.body.questionId,
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
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    // Create question details
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
    const quizQuestion = requestAdminQuizQuestionCreate(-1, user.body.token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('Question string is less than 5 characters in length or greater than 50 characters in length', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const token = user.body.token;
    // Create question details
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
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(400);

    const questionBody2 = {
      question: 'a'.repeat(51),
      duration: question.duration,
      points: question.points,
      answers: answers,
    };
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody2);
    expect(quizQuestion2.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  test('The question has more than 6 answers or less than 2 answers', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const token = user.body.token;
    // Create question details
    const question = {
      question: 'What does KFC sell?',
      duration: 4,
      points: 5,
    };
    const quiz2 = requestAdminQuizCreate(user.body.token, 'Gross Chiggen', validDetails.QUIZDESCRIPTION);

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
    const quizQuestion1 = requestAdminQuizQuestionCreate(quiz2.body.quizId, token, questionBody1);
    expect(quizQuestion1.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion1.statusCode).toStrictEqual(400);

    const questionBody2 = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers3,
    };
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz2.body.quizId, token, questionBody2);
    expect(quizQuestion2.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  test('The question duration is not a positive number', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const token = user.body.token;
    // Create question details
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
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('The sum of the question durations in quiz exceeds 3 minutes', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const token = user.body.token;
    // Create question details
    const answers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Nuggets', correct: true },
    ];
    const quiz1 = requestAdminQuizCreate(user.body.token, 'Chiggen', validDetails.QUIZDESCRIPTION);
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

    requestAdminQuizQuestionCreate(quiz1.body.quizId, token, questionBody1);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz1.body.quizId, token, questionBody2);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('The points awarded for the question are less than 1 or greater than 10', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const token = user.body.token;
    // Create question details
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
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody1);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(400);

    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody2);
    expect(quizQuestion2.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  test('The length of any answer is shorter than 1 character long or longer than 30 characters long', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const token = user.body.token;
    // Create question details
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
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody1);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(400);

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
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody2);
    expect(quizQuestion2.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  test('Any answer strings are duplicates of one another (within the same question)', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const token = user.body.token;
    // Create question details
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
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('There are no correct answers', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const token = user.body.token;
    // Create question details
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
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('Token is empty or invalid (does not refer to valid logged in user session', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    // Create question details
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
    const incorrectToken = uuidv4();
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, incorrectToken, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(401);

    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, '', questionBody);
    expect(quizQuestion2.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion2.statusCode).toStrictEqual(401);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    // Create question details
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
    const user1 = requestAdminAuthRegister('drizman123@gmail.com', validDetails.PASSWORD, 'Driz', 'Haj');

    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user1.body.token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(403);
  });
});

describe('Tests for adminQuizQuestionDelete', () => {
  test('Successful adminQuizQuestionDelete', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    // Create question details
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
    // Create quizQuestion for deletion
    const quizQuestionId = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, questionBody);
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, quizQuestionId.body.questionId, user.body.token);
    // Check for error codes
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Check if question was removed from quizInfo
    const quizInfoAfter = requestAdminQuizInfo(user.body.token, quiz.body.quizId);
    expect(quizInfoAfter.body.questions).toStrictEqual([]);
  });

  test('Unsuccessful call, questionId does not refer to a valid question within this quiz', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    // Create question details
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
    // Create quizQuestion for deletion
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, questionBody);
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, -666, user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    // Create question details
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
    // Create quizQuestion for deletion
    const quizQuestionId = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, questionBody);
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, quizQuestionId.body.questionId, '');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is invalid', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    // Create question details
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
    // Create quizQuestion for deletion
    const quizQuestionId = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, questionBody);
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, quizQuestionId.body.questionId, '-666');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is valid but user is not a owner of this quiz', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    // Create question details
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
    // Create quizQuestion for deletion
    const quizQuestionId = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, questionBody);
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, quizQuestionId.body.questionId, user2.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe('Tests for adminQuizQuestionDuplicate', () => {
  test('Successful quizQuestionDuplicate', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    // Create question details
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
    // Create quizQuestion for duplication
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, questionBody);
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token);
    // Check for error codes
    expect(response.body).toStrictEqual({ newQuestionId: expect.any(Number) });
    expect(response.statusCode).toStrictEqual(200);
    // Check if quiz was duplicated
    const quizInfoNew = requestAdminQuizInfo(user.body.token, quiz.body.quizId);
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
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, -666, user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, quizQuestion.body.questionId, '');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is invalid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, quizQuestion.body.questionId, '-666');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, valid token but user is not an owner of quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, quizQuestion.body.questionId, user2.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe('Tests for adminQuizQuestionMove', () => {
  test('Successful adminQuizQuestionMove', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const token = user.body.token;
    // Create question details
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
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody2);
    // Create newPosition (The position index is assumed to start at 0)
    const newPosition = 0;
    // This case will test if the second question will bUpdatee moved to first place
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, token, newPosition);
    // Check for error codes
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Check if parameters were updated
    const quizInfoNew = requestAdminQuizInfo(token, quiz.body.quizId);
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
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const newPosition = 0;
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion2);
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, -666, user.body.token, newPosition);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful Call, newPosition is less than 0', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion2);
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, user.body.token, -666);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful Call, newPosition is greater then n-1 where n is the number of questions', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion2);
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, user.body.token, 666);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful Call, newPosition is the position of the current question', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion2);
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, user.body.token, 1);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful Call, token is empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const newPosition = 0;
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion2);
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, '', newPosition);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful Call, token is invalid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const newPosition = 0;
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion2);
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, '-666', newPosition);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful Call, token is valid but user is not owner of quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const newPosition = 0;
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion2);
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, user2.body.token, newPosition);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe('Tests for adminQuizQuestionUpdate', () => {
  test('Successful adminQuizQuestionUpdate', () => {
    // Create user and quiz
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    // Create question details
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
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, questionBody);
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBody2);
    // Check for error codes
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Check if quizQuestion now contains questionBody2
    const quizInfoNew = requestAdminQuizInfo(user.body.token, quiz.body.quizId);
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
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, -666, user.body.token, sampleQuestion2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, questionString is less than 5 characters in length', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
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
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyShort);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, questionString is greater then 50 characters in length', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
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
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyLong);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, question has more then 6 answers', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
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
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyTooManyAnswers);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, question has less than 2 answers', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
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
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyTooFewAnswers);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, question duration is not a positive number', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
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
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyNegativeDuration);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, sum of all question durations in the quiz exceeds 3 minutes', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
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
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyExcessiveDuration);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, points awarded is less than 1', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
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
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyNoPoints);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, points awarded is greater than 10', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
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
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyTooManyPoints);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, length of any answer is shorter than 1 character long', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
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
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyEmptyAnswer);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, length of any answer is longer then 30 characters long', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
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
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyLongAnswer);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, duplicate answers in the same question', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
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
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyDuplicateAnswer);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, no correct answers', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
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
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user.body.token, questionBodyNoCorrectAnswer);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, '', sampleQuestion2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is invalid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, '-666', sampleQuestion2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, valid token but user is not authorised', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, user2.body.token, sampleQuestion2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe('Tests for adminQuizTrashRestore', () => {
  test('Successful adminQuizTrashRestore', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, user.body.token);
    // Check for error codes
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Check if quiz is updated to an active quiz
    const userQuizList = requestAdminQuizList(user.body.token);
    expect(userQuizList.body.quizzes).toStrictEqual(
      [
        {
          quizId: quiz.body.quizId,
          name: validDetails.QUIZNAME,
        }
      ]
    );
    // Additional check if timeLastEdited was updated
    const quizInfoNew = requestAdminQuizInfo(user.body.token, quiz.body.quizId);
    const currentTime = new Date();
    const unixtimeSeconds = Math.floor(currentTime.getTime() / 1000);
    const timeLastEdited = unixtimeSeconds;
    const recordedTimeLastEdited = quizInfoNew.body.timeLastEdited;
    expect(timeLastEdited).toBeGreaterThanOrEqual(recordedTimeLastEdited);
    expect(timeLastEdited).toBeLessThanOrEqual(recordedTimeLastEdited + 2);
  });

  test('Unsuccessful call, quizName of restored quiz is already used by another active quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION2);
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, quizId refers to a quiz that is not currently in trash', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, '');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is invalid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, '-666');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, valid token but user is not an owner of quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, user2.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });
});

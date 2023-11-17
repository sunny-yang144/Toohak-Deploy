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
  requestNewSessionQuiz,
  clear,
} from '../test-helpers';

import { expect } from '@jest/globals';

import { v4 as uuidv4 } from 'uuid';

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
  ],
  thumbnailUrl: VD.IMAGEURL,
};

beforeEach(() => {
  clear();
});

afterAll(() => {
  clear();
});

describe('Tests for adminQuizTrash', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
  });

  test('Successful Trash List', () => {
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
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({
      quizzes: []
    });
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Successful Multiple Trash List', () => {
    const quiz2 = requestAdminQuizCreate(user.body.token, VD.QUIZNAME2, VD.QUIZDESCRIPTION2);
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
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrash(user.body.token + 1);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // 'Invalid token'
    expect(response.statusCode).toStrictEqual(401);
  });
});
describe('Tests to Empty adminQuizTrashRemove', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
  });
  test('Successful Trash Empty', () => {
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token, [quiz.body.quizId]); // needs to be an array of quizzes
    expect(clearTrash.statusCode).toStrictEqual(200);

    const checkTrash = requestAdminQuizTrash(user.body.token);
    expect(checkTrash.body).toStrictEqual({
      quizzes: []
    });
  });
  test('Successful Trash Empty, but for a quiz with questions', () => {
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
    const clearTrash = requestAdminTrashRemove(user.body.token, [quiz.body.quizId]);
    expect(clearTrash.body).toStrictEqual({ error: expect.any(String) });
    expect(clearTrash.statusCode).toStrictEqual(400);
  });

  // If a quizId is not valid, then it cant be owned by user so error 403 hits first.
  test('quizId is not Valid', () => {
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token, [quiz.body.quizId + 1]);
    expect(clearTrash.body).toStrictEqual({ error: expect.any(String) });
    expect(clearTrash.statusCode).toStrictEqual(403);
  });

  test('User does not own Quiz', () => {
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user2.body.token, [quiz.body.quizId]);
    expect(clearTrash.body).toStrictEqual({ error: expect.any(String) });
    expect(clearTrash.statusCode).toStrictEqual(403);
  });

  test('Invalid token', () => {
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const invalidToken = uuidv4();
    const clearTrash = requestAdminTrashRemove(invalidToken, [quiz.body.quizId]);
    expect(clearTrash.body).toStrictEqual({ error: expect.any(String) }); // 'Invalid token'
    expect(clearTrash.statusCode).toStrictEqual(401);
  });

  test('Valid Token, User is not Owner of Quiz', () => {
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user2.body.token, [quiz.body.quizId]);
    expect(clearTrash.body).toStrictEqual({ error: expect.any(String) }); // 'Invalid token'
    expect(clearTrash.statusCode).toStrictEqual(403);
  });
});

describe('Testing adminQuizTransfer', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let user2: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
  });

  test('Successful adminQuizTransfer', () => {
    const response = requestAdminQuizTransfer(user.body.token, VD.EMAIL2, quiz.body.quizId);
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
          name: VD.QUIZNAME,
        }]
      });
  });

  test('Unsuccessful adminQuizTransfer, quizId does not refer to a valid quiz', () => {
    const response = requestAdminQuizTransfer(user.body.token, VD.EMAIL2, -666);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful adminQuizTransfer, userEmail is not a real user', () => {
    const response = requestAdminQuizTransfer(user.body.token, 'notRealUser@gmail.com', quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful adminQuizTransfer, userEmail is the current logged in user', () => {
    const response = requestAdminQuizTransfer(user.body.token, VD.EMAIL, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful adminQuizTransfer, quizId refers to a quiz that has a name that is already used by the target user', () => {
    requestAdminQuizCreate(user2.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION2);
    const response = requestAdminQuizTransfer(user.body.token, VD.EMAIL2, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful adminQuizTransfer, token is empty', () => {
    const response = requestAdminQuizTransfer('', VD.EMAIL2, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful adminQuizTransfer, token is invalid', () => {
    const response = requestAdminQuizTransfer('-666', VD.EMAIL2, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful adminQuizTransfer, token is valid but user does not own this quiz', () => {
    const response = requestAdminQuizTransfer(user2.body.token, VD.EMAIL2, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });

  test('Unsuccessful adminQuizTransfer, a session is NOT in END state', () => {
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    const response = requestAdminQuizTransfer(user.body.token, VD.EMAIL2, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
});

describe('Tests for adminQuizQuestionCreate', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
  });

  test('Successful quiz question creation', () => {
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    expect(quizQuestion.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(quizQuestion.statusCode).toStrictEqual(200);
  });

  test('Quiz with multiple questions added', () => {
    const quizQuestion1 = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion2);
    expect(quizQuestion1.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(quizQuestion1.statusCode).toStrictEqual(200);

    // Checking if the quiz actually contains two question
    const quizInfo = requestAdminQuizInfo(user.body.token, quiz.body.quizId);
    expect(quizInfo.body).toStrictEqual(
      {
        quizId: quiz.body.quizId,
        name: VD.QUIZNAME,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: VD.QUIZDESCRIPTION,
        numQuestions: 2,
        questions: [
          {
            questionId: quizQuestion1.body.questionId,
            question: sampleQuestion1.question,
            duration: sampleQuestion1.duration,
            points: sampleQuestion1.points,
            // Since all questions require at least 2 answer options
            answers: [
              {
                answerId: expect.any(Number),
                answer: sampleQuestion1.answers[0].answer,
                colour: expect.any(String),
                correct: sampleQuestion1.answers[0].correct,
              },
              {
                answerId: expect.any(Number),
                answer: sampleQuestion1.answers[1].answer,
                colour: expect.any(String),
                correct: sampleQuestion1.answers[1].correct,
              }
            ],
          },
          {
            questionId: quizQuestion2.body.questionId,
            question: sampleQuestion2.question,
            duration: sampleQuestion2.duration,
            points: sampleQuestion2.points,
            // Since all questions require at least 2 answer options
            answers: [
              {
                answerId: expect.any(Number),
                answer: sampleQuestion2.answers[0].answer,
                colour: expect.any(String),
                correct: sampleQuestion2.answers[0].correct,
              },
              {
                answerId: expect.any(Number),
                answer: sampleQuestion2.answers[1].answer,
                colour: expect.any(String),
                correct: sampleQuestion2.answers[1].correct,
              }
            ],
          }
        ],
        duration: sampleQuestion1.duration + sampleQuestion2.duration,
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
    const quizQuestion = requestAdminQuizQuestionCreate(-1, user.body.token, sampleQuestion1);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  const question = {
    question: 'What does KFC sell?',
    duration: 4,
    points: 5,
  };
  const answers = [
    { answer: 'Chicken', correct: true },
    { answer: 'Nuggets', correct: true },
  ];
  test.each([
    {
      questionBody:
      {
        question: 'abcd',
        duration: question.duration,
        points: question.points,
        answers: answers,
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: 'a'.repeat(51),
        duration: question.duration,
        points: question.points,
        answers: answers,
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question.question,
        duration: question.duration,
        points: question.points,
        answers: [
          { answer: 'Chicken', correct: true },
          { answer: 'Lettuce', correct: true },
          { answer: 'Concrete', correct: false },
          { answer: 'Bricks', correct: false },
          { answer: 'Beef', correct: true },
          { answer: 'Mice', correct: false },
          { answer: 'Nutes', correct: true },
        ],
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question.question,
        duration: question.duration,
        points: question.points,
        answers: [{ answer: 'Concrete', correct: false }],
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question.question,
        duration: question.duration,
        points: -1,
        answers: answers,
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question.question,
        duration: question.duration,
        points: 0,
        answers: answers,
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question.question,
        duration: question.duration,
        points: 11,
        answers: answers,
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question.question,
        duration: question.duration,
        points: question.points,
        answers: [
          { answer: '', correct: true },
          { answer: 'Lettuce', correct: true },
        ],
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question.question,
        duration: question.duration,
        points: question.points,
        answers: [
          { answer: 'Chicken', correct: true },
          { answer: 'a'.repeat(31), correct: true },
        ],
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question.question,
        duration: question.duration,
        points: question.points,
        answers: [
          { answer: 'Chicken', correct: true },
          { answer: 'Chicken', correct: true },
        ],
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question.question,
        duration: question.duration,
        points: question.points,
        answers: [
          { answer: 'Chicken', correct: false },
          { answer: 'John', correct: false },
        ],
        thumbnailUrl: VD.IMAGEURL,
      }
    },
  ])('Errors for question, answers, duration and points', ({ questionBody }) => {
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('The sum of the question durations in quiz exceeds 3 minutes', () => {
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
      thumbnailUrl: VD.IMAGEURL,
    };
    const questionBody2 = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: answers,
      thumbnailUrl: VD.IMAGEURL,
    };
    requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, questionBody1);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, questionBody2);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('Token is empty or invalid (does not refer to valid logged in user session', () => {
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
      thumbnailUrl: VD.IMAGEURL,
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
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
      thumbnailUrl: VD.IMAGEURL,
    };
    const user1 = requestAdminAuthRegister('drizman123@gmail.com', VD.PASSWORD, 'Driz', 'Haj');

    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user1.body.token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(403);
  });
});

describe('Tests for adminQuizQuestionDelete', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
    statusCode: number,
  };
  let question: {
    body: {questionId: number},
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    question = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
  });

  test('Successful adminQuizQuestionDelete', () => {
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, question.body.questionId, user.body.token);
    // Check for error codes
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Check if question was removed from quizInfo
    const quizInfoAfter = requestAdminQuizInfo(user.body.token, quiz.body.quizId);
    expect(quizInfoAfter.body.questions).toStrictEqual([]);
  });

  test('Unsuccessful call, questionId does not refer to a valid question within this quiz', () => {
    requestAdminQuizQuestionDelete(quiz.body.quizId, question.body.questionId, user.body.token);
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, -666, user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, question.body.questionId, '');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is invalid', () => {
    const incorrectToken = uuidv4();
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, question.body.questionId, incorrectToken);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is valid but user is not a owner of this quiz', () => {
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, question.body.questionId, user2.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });

  test('Unsuccessful adminQuizDelete, a session is NOT in END state', () => {
    requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, question.body.questionId, user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
});

describe('Tests for adminQuizQuestionDuplicate', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
    statusCode: number,
  };
  let question: {
    body: {questionId: number},
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    question = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
  });

  test('Successful quizQuestionDuplicate', () => {
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, question.body.questionId, user.body.token);
    // Check for error codes
    expect(response.body).toStrictEqual({ newQuestionId: expect.any(Number) });
    expect(response.statusCode).toStrictEqual(200);
    // Check if quiz was duplicated
    const quizInfoNew = requestAdminQuizInfo(user.body.token, quiz.body.quizId);
    expect(quizInfoNew.body.questions).toStrictEqual(
      [
        {
          questionId: question.body.questionId,
          question: sampleQuestion1.question,
          duration: sampleQuestion1.duration,
          points: sampleQuestion1.points,
          // Since all questions require at least 2 answer options
          answers: [
            {
              answerId: expect.any(Number),
              answer: sampleQuestion1.answers[0].answer,
              colour: expect.any(String),
              correct: sampleQuestion1.answers[0].correct,
            },
            {
              answerId: expect.any(Number),
              answer: sampleQuestion1.answers[1].answer,
              colour: expect.any(String),
              correct: sampleQuestion1.answers[1].correct,
            }
          ],
        },
        {
          questionId: response.body.newQuestionId,
          question: sampleQuestion1.question,
          duration: sampleQuestion1.duration,
          points: sampleQuestion1.points,
          // Since all questions require at least 2 answer options
          answers: [
            {
              answerId: expect.any(Number),
              answer: sampleQuestion1.answers[0].answer,
              colour: expect.any(String),
              correct: sampleQuestion1.answers[0].correct,
            },
            {
              answerId: expect.any(Number),
              answer: sampleQuestion1.answers[1].answer,
              colour: expect.any(String),
              correct: sampleQuestion1.answers[1].correct,
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
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, -666, user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, question.body.questionId, '');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is invalid', () => {
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, question.body.questionId, '-666');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, valid token but user is not an owner of quiz', () => {
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, quizQuestion.body.questionId, user2.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe('Tests for adminQuizQuestionMove', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
    statusCode: number,
  };
  let question: {
    body: {questionId: number},
    statusCode: number,
  };
  let question2: {
    body: {questionId: number},
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    question = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
    question2 = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion2);
  });
  test('Successful adminQuizQuestionMove', () => {
    // Create newPosition (The position index is assumed to start at 0)
    const newPosition = 0;
    // This case will test if the second question will bUpdatee moved to first place
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, question2.body.questionId, user.body.token, newPosition);
    // Check for error codes
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Check if parameters were updated
    const quizInfoNew = requestAdminQuizInfo(user.body.token, quiz.body.quizId);
    expect(quizInfoNew.body.questions).toStrictEqual(
      [
        {
          questionId: question2.body.questionId,
          question: sampleQuestion2.question,
          duration: sampleQuestion2.duration,
          points: sampleQuestion2.points,
          // Since all questions require at least 2 answer options
          answers: [
            {
              answerId: expect.any(Number),
              answer: sampleQuestion2.answers[0].answer,
              colour: expect.any(String),
              correct: sampleQuestion2.answers[0].correct,
            },
            {
              answerId: expect.any(Number),
              answer: sampleQuestion2.answers[1].answer,
              colour: expect.any(String),
              correct: sampleQuestion2.answers[1].correct,
            }
          ],
        },
        {
          questionId: question.body.questionId,
          question: sampleQuestion1.question,
          duration: sampleQuestion1.duration,
          points: sampleQuestion1.points,
          // Since all questions require at least 2 answer options
          answers: [
            {
              answerId: expect.any(Number),
              answer: sampleQuestion1.answers[0].answer,
              colour: expect.any(String),
              correct: sampleQuestion1.answers[0].correct,
            },
            {
              answerId: expect.any(Number),
              answer: sampleQuestion1.answers[1].answer,
              colour: expect.any(String),
              correct: sampleQuestion1.answers[1].correct,
            }
          ],
        }
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
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, -666, user.body.token, 0);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful Call, newPosition is less than 0', () => {
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, question2.body.questionId, user.body.token, -666);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful Call, newPosition is greater then n-1 where n is the number of questions', () => {
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, question2.body.questionId, user.body.token, 666);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful Call, newPosition is the position of the current question', () => {
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, question2.body.questionId, user.body.token, 1);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful Call, token is empty', () => {
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, question2.body.questionId, '', 0);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful Call, token is invalid', () => {
    const invalidId = uuidv4();
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, question2.body.questionId, invalidId, 0);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful Call, token is valid but user is not owner of quiz', () => {
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, question.body.questionId, user2.body.token, 0);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe('Tests for adminQuizQuestionUpdate', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
    statusCode: number,
  };
  let question: {
    body: {questionId: number},
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    question = requestAdminQuizQuestionCreate(quiz.body.quizId, user.body.token, sampleQuestion1);
  });
  test('Successful adminQuizQuestionUpdate', () => {
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, question.body.questionId, user.body.token, sampleQuestion2);
    // Check for error codes
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Check if quizQuestion now contains questionBody2
    const quizInfoNew = requestAdminQuizInfo(user.body.token, quiz.body.quizId);
    expect(quizInfoNew.body.questions).toStrictEqual(
      [
        {
          questionId: question.body.questionId,
          question: sampleQuestion2.question,
          duration: sampleQuestion2.duration,
          points: sampleQuestion2.points,
          // Since all questions require at least 2 answer options
          answers: [
            {
              answerId: expect.any(Number),
              answer: sampleQuestion2.answers[0].answer,
              colour: expect.any(String),
              correct: sampleQuestion2.answers[0].correct,
            },
            {
              answerId: expect.any(Number),
              answer: sampleQuestion2.answers[1].answer,
              colour: expect.any(String),
              correct: sampleQuestion2.answers[1].correct,
            }
          ],
        }
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
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, -666, user.body.token, sampleQuestion2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  const answers2 = [
    { answer: 'Apples', correct: true },
    { answer: 'Iphones', correct: true },
  ];
  const question2 = {
    question: 'What does APPLE sell?',
    duration: 1,
    points: 1,
  };

  test.each([
    {
      questionBody:
      {
        question: 'abcd',
        duration: question2.duration,
        points: question2.points,
        answers: answers2,
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: 'a'.repeat(51),
        duration: question2.duration,
        points: question2.points,
        answers: answers2,
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question2.question,
        duration: question2.duration,
        points: question2.points,
        answers: [
          { answer: 'Chicken', correct: true },
          { answer: 'Lettuce', correct: true },
          { answer: 'Concrete', correct: false },
          { answer: 'Bricks', correct: false },
          { answer: 'Beef', correct: true },
          { answer: 'Mice', correct: false },
          { answer: 'Nutes', correct: true },
        ],
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question2.question,
        duration: question2.duration,
        points: question2.points,
        answers: [{ answer: 'Concrete', correct: false }],
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question2.question,
        duration: question2.duration,
        points: -1,
        answers: answers2,
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question2.question,
        duration: question2.duration,
        points: 0,
        answers: answers2,
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question2.question,
        duration: question2.duration,
        points: 11,
        answers: answers2,
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question2.question,
        duration: question2.duration,
        points: question2.points,
        answers: [
          { answer: '', correct: true },
          { answer: 'Lettuce', correct: true },
        ],
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question2.question,
        duration: question2.duration,
        points: question2.points,
        answers: [
          { answer: 'Chicken', correct: true },
          { answer: 'a'.repeat(31), correct: true },
        ],
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question2.question,
        duration: question2.duration,
        points: question2.points,
        answers: [
          { answer: 'Chicken', correct: true },
          { answer: 'Chicken', correct: true },
        ],
        thumbnailUrl: VD.IMAGEURL,
      }
    },
    {
      questionBody:
      {
        question: question2.question,
        duration: question2.duration,
        points: question2.points,
        answers: [
          { answer: 'Chicken', correct: false },
          { answer: 'John', correct: false },
        ],
        thumbnailUrl: VD.IMAGEURL,
      }
    },
  ])('Errors for question, answers, duration and points', ({ questionBody }) => {
    const quizQuestion = requestAdminQuizQuestionUpdate(quiz.body.quizId, question.body.questionId, user.body.token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, sum of all question durations in the quiz exceeds 3 minutes', () => {
    const questionBodyExcessiveDuration = {
      question: question2.question,
      duration: 200,
      points: question2.points,
      answers: answers2,
      thumbnailUrl: VD.IMAGEURL,
    };
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, question.body.questionId, user.body.token, questionBodyExcessiveDuration);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, question.body.questionId, '', sampleQuestion2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is invalid', () => {
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, question.body.questionId, '-666', sampleQuestion2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, valid token but user is not authorised', () => {
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, question.body.questionId, user2.body.token, sampleQuestion2);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe('Tests for adminQuizTrashRestore', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
    statusCode: number,
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
  });
  test('Successful adminQuizTrashRestore', () => {
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
          name: VD.QUIZNAME,
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
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    requestAdminQuizCreate(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION2);
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, quizId refers to a quiz that is not currently in trash', () => {
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, '');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is invalid', () => {
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, '-666');
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, valid token but user is not an owner of quiz', () => {
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, user2.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });
});

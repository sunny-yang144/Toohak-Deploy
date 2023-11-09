import {
  requestAdminAuthRegister,
  // requestAdminQuizList,
  // requestAdminQuizCreate,
  // requestAdminQuizInfo,
  // requestAdminQuizRemove,
  // requestAdminQuizTrash,
  // requestAdminTrashRemove,
  // requestAdminQuizTransfer,
  // requestAdminQuizQuestionCreate,
  // requestAdminQuizQuestionDelete,
  // requestAdminQuizQuestionDuplicate,
  // requestAdminQuizQuestionMove,
  // requestAdminQuizQuestionUpdate,
  // requestAdminQuizTrashRestore,
  requestAdminQuizQuestionDeleteV2,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizInfoV2,
  requestAdminQuizCreateV2,
  requestUpdateQuizThumbNail,
  requestViewSessionActivity,
  requestNewSessionQuiz,
  requestUpdateSessionState,
  requestGetSessionStatus,
  clear,
} from '../test-helpers';

import { expect } from '@jest/globals';

import { v4 as uuidv4 } from 'uuid';
import HTTPError from 'http-errors';

// import { colours } from '../../dataStore';

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

// const sampleQuestion2: QuestionBody = {
//   question: 'What is 2 + 2?',
//   duration: 1,
//   points: 1,
//   answers: [
//     {
//       answer: '2',
//       correct: true
//     },
//     {
//       answer: '6',
//       correct: false
//     }
//   ]
// };

beforeEach(() => {
  clear();
});

afterAll(() => {
  clear();
});

/// /////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////     NEW ITERATION 3      ////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////

describe.skip('Tests for updateQuizThumbNail', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
  });

  test('Successful change of thumbnail', () => {
    requestUpdateQuizThumbNail(quiz.body.quizId, user.body.token, validDetails.IMAGEURL);
    const quizInfo = requestAdminQuizInfoV2(user.body.token, quiz.body.quizId);
    expect(quizInfo.body).toStrictEqual(
      {
        quizId: quiz.body.quizId,
        name: validDetails.QUIZNAME,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: validDetails.QUIZDESCRIPTION,
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: validDetails.IMAGEURL,
      }
    );
  });

  test.each([
    { imgUrl: 'http://google.com/some/image/path.jpg' }, // URL does not exist
    { imgUrl: 'https://www.winnings.com.au/' }, // URL is not a JPG or PNG
  ])('Errors for invalid URLs', ({ imgUrl }) => {
    const response = requestUpdateQuizThumbNail(quiz.body.quizId, user.body.token, imgUrl);
    expect(response).toThrow(HTTPError[400]);
  });

  test('Token is empty or invalid', () => {
    const invalidId = uuidv4();
    const response = requestUpdateQuizThumbNail(quiz.body.quizId, invalidId, validDetails.IMAGEURL);
    expect(response).toThrow(HTTPError[401]);
  });

  test('Token is not the owner of the quiz', () => {
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const response = requestUpdateQuizThumbNail(quiz.body.quizId, user2.body.token, validDetails.IMAGEURL);
    expect(response).toThrow(HTTPError[403]);
  });
});

describe.skip('Tests for viewSessionActivity', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
  };

  let session1: {
    body: {sessionId: number},
  };

  let session2: {
    body: {sessionId: number},
  };

  let session3: {
    body: {sessionId: number},
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    session1 = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    session2 = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    session3 = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    requestUpdateSessionState(quiz.body.quizId, session3.body.sessionId, user.body.token, 'END');
  });

  test('Successful view of active and inactive sessions', () => {
    const response = requestViewSessionActivity(quiz.body.quizId, user.body.token);
    expect(response).toStrictEqual(
      {
        activeSessions: [session1.body.sessionId, session2.body.sessionId],
        inactiveSessions: [session3.body.sessionId]
      }
    );
  });

  test('Token is empty or invalid', () => {
    const invalidId = uuidv4();
    const response = requestViewSessionActivity(quiz.body.quizId, invalidId);
    expect(response).toThrow(HTTPError[401]);
  });

  test('Token is not the owner of the quiz', () => {
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const response = requestViewSessionActivity(quiz.body.quizId, user2.body.token);
    expect(response).toThrow(HTTPError[403]);
  });
});

describe.skip('Tests for getNewSessionQuiz', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
  };

  let question: {
    body: {quizId: number},
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    question = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
  });

  test('Successful creation of new session', () => {
    const session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    const response = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token);
    expect(response).toStrictEqual(
      {
        state: 'LOBBY',
        atQuestion: 0,
        players: [],
        metadata: {
          quizId: quiz.body.quizId,
          name: validDetails.QUIZNAME,
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: validDetails.QUIZDESCRIPTION,
          numQuestions: 0,
          questions: [],
          duration: 0,
        }
      }
    );
  });

  test('AutoStartNum is greater than 50', () => {
    const response = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 500);
    expect(response).toThrow(HTTPError[400]);
  });

  test('There are more than 10 active sessions', () => {
    for (let i = 0; i < 10; i++) {
      requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    }
    const response = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    expect(response).toThrow(HTTPError[400]);
  });

  test('Error when no questions are in quiz', () => {
    requestAdminQuizQuestionDeleteV2(quiz.body.quizId, question.body.quizId, user.body.token);
    const response = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    expect(response).toThrow(HTTPError[400]);
  });

  test('Token is empty or invalid', () => {
    const invalidId = uuidv4();
    const response = requestNewSessionQuiz(quiz.body.quizId, invalidId, 3);
    expect(response).toThrow(HTTPError[401]);
  });

  test('Token is not the owner of the quiz', () => {
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const response = requestNewSessionQuiz(quiz.body.quizId, user2.body.token, 3);
    expect(response).toThrow(HTTPError[403]);
  });
});

describe('Tests for updateSessionState', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
  };

  let question: {
    body: {questionId: number},
  };
  let session: {
    body: {sessionId: number}
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    question = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
  });
  test('LOBBY to QUESTION_COUNTDOWN on NEXT_QUESTION', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('QUESTION_COUNTDOWN');
  });
  test('LOBBY to END on END', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'END');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('END');
  });
  test('QUESTION_COUNTDOWN to END on END', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'END');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('END');
  });

  test('QUESTION_COUNTDOWN to QUESTION_OPEN on SKIP_COUNTDOWN', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    setTimeout(function() {}, 3000); // 3 seconds
    expect(getSessions).toBe('QUESTION_OPEN');
  });

  test('QUESTION_OPEN to END on END', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'END');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('END');
  });
  
  test('QUESTION_OPEN to ANSWER_SHOW on GO_TO_ANSWER', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'GO_TO_ANSWER');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('ANSWER_SHOW');
  });

  test('ANSWER_SHOW to QUESTION_COUNTDOWN on NEXT_QUESTION', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'GO_TO_ANSWER');
    const updatedSession4 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'NEXT_QUESTION');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('QUESTION_COUNTDOWN');
  });

  test('QUESTION_OPEN to QUESTION_CLOSE on duration ending', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    // duration to be implemented
    setTimeout(function() {}, 20000);
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('QUESTION_CLOSE');
  });

  test('QUESTION_CLOSE to ANSWER_SHOW on GO_TO_ANSWER', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'GO_TO_ANSWER');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('ANSWER_SHOW');
  });
  test('QUESTION_CLOSE to QUESTION_COUNTDOWN on NEXT_QUESTION', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'NEXT_QUESTION');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('QUESTION_COUNTDOWN');
  });
  test('QUESTION_CLOSE to END on END', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    setTimeout(function() {}, 20000);
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'END');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('END');
  });
  test('QUESTION_CLOSE to FINAL_RESULTS on GO_TO_FINAL_RESULTS', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    setTimeout(function() {}, 20000);
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('FINAL_RESULTS');
  });
  test('FINAL_RESULTS to END on END', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    setTimeout(function() {}, 20000);
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'END');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('END');
  });

  test('ANSWER_SHOW to FINAL_RESULTS on GO_TO_FINAL_RESULTS', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'GO_TO_ANSWER');
    const updatedSession4 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('FINAL_RESULTS');
  });

  test('ANSWER_SHOW to END on END', () => {
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'GO_TO_ANSWER');
    const updatedSession4 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token, 'END');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('END');
  });

  //////////////////////ERROR CASES////////////////////////////////
  test('Invalid Command from LOBBY, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN').toThrow(HTTPError[400]));
  });
  test('Invalid Command from LOBBY, GO_TO_ANSWER', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'GO_TO_ANSWER').toThrow(HTTPError[400]));
  });
  test('Invalid Command from LOBBY, GO_TO_FINAL_RESULT', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'GO_TO_FINAL_RESULT').toThrow(HTTPError[400]));
  });
  test('Invalid Command from LOBBY, NEXT_QUESTION', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION').toThrow(HTTPError[400]));
  });
  test('Invalid Command from QUESTION_COUNTDOWN, NEXT_QUESTION', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION').toThrow(HTTPError[400]));
  });
  test('Invalid Command from QUESTION_COUNTDOWN, GO_TO_ANSWER', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'GO_TO_ANSWER').toThrow(HTTPError[400]));
  });
  test('Invalid Command from QUESTION_COUNTDOWN, GO_TO_FINAL_RESULTS', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'GO_TO_FINAL_RESULTS').toThrow(HTTPError[400]));
  });
  test('Invalid Command from QUESTION_OPEN, NEXT_QUESTION', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION').toThrow(HTTPError[400]));
  });
  test('Invalid Command from QUESTION_OPEN, GO_TO_FINAL_RESULTS', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'GO_TO_FINAL_RESULTS').toThrow(HTTPError[400]));
  });
  test('Invalid Command from QUESTION_OPEN, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN').toThrow(HTTPError[400]));
  });
  test('Invalid Command from QUESTION_CLOSE, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN');
    setTimeout(function() {}, 20000);
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN').toThrow(HTTPError[400]));
  });
  test('Invalid Command from QUESTION_CLOSE, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN');
    setTimeout(function() {}, 20000);
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN').toThrow(HTTPError[400]));
  });
  test('Invalid Command from ANSWER_SHOW, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN');
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'GO_TO_ANSWER');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN').toThrow(HTTPError[400]));
  });
  test('Invalid Command from ANSWER_SHOW, GO_TO_ANSWER', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN');
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'GO_TO_ANSWER');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'GO_TO_ANSWER').toThrow(HTTPError[400]));
  });
  test('Invalid Command from FINAL_RESULTS, NEXT_QUESTION', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN');
    setTimeout(function() {}, 20000);
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'GO_TO_FINAL_RESULTS');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION').toThrow(HTTPError[400]));
  });
  test('Invalid Command from FINAL_RESULTS, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN');
    setTimeout(function() {}, 20000);
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'GO_TO_FINAL_RESULTS');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN').toThrow(HTTPError[400]));
  });
  test('Invalid Command from FINAL_RESULTS, GO_TO_ANSWER', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const updatedSession = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'NEXT_QUESTION');
    const updatedSession2 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'SKIP_COUNTDOWN');
    setTimeout(function() {}, 20000);
    const updatedSession3 = requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'GO_TO_FINAL_RESULTS');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.sessionId, user.body.token,'GO_TO_ANSWER').toThrow(HTTPError[400]));
  });
});
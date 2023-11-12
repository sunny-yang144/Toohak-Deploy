import {
  requestAdminAuthRegister,
  requestAdminQuizQuestionDeleteV2,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizInfoV2,
  requestAdminQuizCreateV2,
  requestUpdateQuizThumbNail,
  requestViewSessionActivity,
  requestNewSessionQuiz,
  requestUpdateSessionState,
  requestGetSessionStatus,
  requestGetQuizSessionResults,
  requestGuestPlayerJoin,
  requestGetQuizSessionResultsCSV,
  clear,
} from '../test-helpers';
import { checkCSV } from '../../other';
import { expect } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import HTTPError from 'http-errors';
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
  GUESTNAME = 'Charlie Wonka',
}

const invalidId = uuidv4();

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

//   ],
//   thumbnailUrl: VD.IMAGEURL,
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

describe('Tests for updateQuizThumbNail', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
  });

  test('Successful change of thumbnail', () => {
    expect(requestUpdateQuizThumbNail(quiz.body.quizId, user.body.token, VD.IMAGEURL)).toStrictEqual({});
    const quizInfo = requestAdminQuizInfoV2(user.body.token, quiz.body.quizId);
    expect(quizInfo.body).toStrictEqual(
      {
        quizId: quiz.body.quizId,
        name: VD.QUIZNAME,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: VD.QUIZDESCRIPTION,
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: VD.IMAGEURL,
      }
    );
  });

  test.each([
    { imgUrl: 'http://google.com/some/image/path.jpg' }, // URL does not exist
    { imgUrl: 'https://www.winnings.com.au/' }, // URL is not a JPG or PNG
  ])('Errors for invalid URLs', ({ imgUrl }) => {
    expect(() => requestUpdateQuizThumbNail(quiz.body.quizId, user.body.token, imgUrl)).toThrow(HTTPError[400]);
  });

  test('Token is empty or invalid', () => {
    expect(() => requestUpdateQuizThumbNail(quiz.body.quizId, invalidId, VD.IMAGEURL)).toThrow(HTTPError[401]);
  });

  test('Token is not the owner of the quiz', () => {
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    expect(() => requestUpdateQuizThumbNail(quiz.body.quizId, user2.body.token, VD.IMAGEURL)).toThrow(HTTPError[403]);
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
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
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
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
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
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
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
          name: VD.QUIZNAME,
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: VD.QUIZDESCRIPTION,
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
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const response = requestNewSessionQuiz(quiz.body.quizId, user2.body.token, 3);
    expect(response).toThrow(HTTPError[403]);
  });
});

describe.skip('Tests for getQuizSessionResults', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
  });

  test('Successful retrieval of quiz results', () => {
    const session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    // const response = requestGetQuizSessionResults(quiz.body.quizId, session.body.sessionId, user.body.token);
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
    // Whoever writes this function, please uncomment the response, and
    // alter the code below to fit its return.
    // expect(response).toStrictEqual( {
    //   usersRankedByScore: [
    //     name: 'Jack',
    //     score: 0,
    //   ],
    //   questionResults: [
    //     {
    //       questionId: question,
    //       playersCorrectList: [
    //         ""
    //       ],
    //       averageAnswerTime: 0,
    //       percentCorrect: 0,
    //     }
    //   ]
    // });
  });

  test('Session ID does not refer to a valid session within this quiz', () => {
    const quiz2 = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME2, VD.QUIZDESCRIPTION2);
    const session2 = requestNewSessionQuiz(quiz2.body.quizId, user.body.token, 3);
    const response = requestGetQuizSessionResults(quiz.body.quizId, session2.body.sessionId, user.body.token);
    requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    expect(response).toThrow(HTTPError[400]);
  });

  test('Session is not in FINAL_RESULTS state', () => {
    const session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    const response = requestGetQuizSessionResults(quiz.body.quizId, session.body.sessionId, user.body.token);
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    expect(response).toThrow(HTTPError[400]);
  });

  test('Token is empty or invalid', () => {
    const invalidId = uuidv4();
    const response = requestNewSessionQuiz(quiz.body.quizId, invalidId, 3);
    expect(response).toThrow(HTTPError[401]);
  });

  test('Valid token, however user is unauthorised to view this session', () => {
    const session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const response = requestGetQuizSessionResults(quiz.body.quizId, session.body.sessionId, user2.body.token);
    expect(response).toThrow(HTTPError[403]);
  });
});
describe.skip('Tests for updateSessionState', () => {
  //  ////////////////note: I HAVE NO IDEA HOW TO GET THE TIME STUFF TO WORK SO I COMMENTED IT OUT////////
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
  };
  let session: {
    body: {sessionId: number}
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
  });
  test('LOBBY to QUESTION_COUNTDOWN on NEXT_QUESTION', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('QUESTION_COUNTDOWN');
  });
  test('LOBBY to END on END', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'END');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('END');
  });
  test('QUESTION_COUNTDOWN to END on END', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'END');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('END');
  });

  test('QUESTION_COUNTDOWN to QUESTION_OPEN on SKIP_COUNTDOWN', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    //  const getSessions =
    //  requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    //  setTimeout(expect(getSessions).toBe('QUESTION_OPEN'), 3000); // 3 seconds
  });

  test('QUESTION_OPEN to END on END', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'END');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('END');
  });

  test('QUESTION_OPEN to ANSWER_SHOW on GO_TO_ANSWER', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('ANSWER_SHOW');
  });

  test('ANSWER_SHOW to QUESTION_COUNTDOWN on NEXT_QUESTION', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('QUESTION_COUNTDOWN');
  });

  test('QUESTION_OPEN to QUESTION_CLOSE on duration ending', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    //  const getSessions =
    //  requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    //  setTimeout(expect(getSessions).toBe('QUESTION_CLOSE'), 20000);
  });

  test('QUESTION_CLOSE to ANSWER_SHOW on GO_TO_ANSWER', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('ANSWER_SHOW');
  });
  test('QUESTION_CLOSE to QUESTION_COUNTDOWN on NEXT_QUESTION', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('QUESTION_COUNTDOWN');
  });
  test('QUESTION_CLOSE to END on END', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    //  setTimeout(requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'END'), 20000);
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('END');
  });
  test('QUESTION_CLOSE to FINAL_RESULTS on GO_TO_FINAL_RESULTS', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    //  setTimeout(requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS'), 20000);
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('FINAL_RESULTS');
  });
  test('FINAL_RESULTS to END on END', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    //  setTimeout(requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS'), 20000);
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'END');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('END');
  });

  test('ANSWER_SHOW to FINAL_RESULTS on GO_TO_FINAL_RESULTS', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('FINAL_RESULTS');
  });

  test('ANSWER_SHOW to END on END', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'END');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('END');
  });

  /// ///////////////////ERROR CASES////////////////////////////////
  test('Invalid Command from LOBBY, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from LOBBY, GO_TO_ANSWER', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from LOBBY, GO_TO_FINAL_RESULT', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from LOBBY, NEXT_QUESTION', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_COUNTDOWN, NEXT_QUESTION', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_COUNTDOWN, GO_TO_ANSWER', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_COUNTDOWN, GO_TO_FINAL_RESULTS', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_OPEN, NEXT_QUESTION', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_OPEN, GO_TO_FINAL_RESULTS', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_OPEN, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_CLOSE, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    //  setTimeout(expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN').toThrow(HTTPError[400])), 20000);
  });
  test('Invalid Command from QUESTION_CLOSE, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    //  setTimeout(expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN').toThrow(HTTPError[400])), 20000);
  });
  test('Invalid Command from ANSWER_SHOW, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from ANSWER_SHOW, GO_TO_ANSWER', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from FINAL_RESULTS, NEXT_QUESTION', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    //  setTimeout(requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS'), 20000);
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from FINAL_RESULTS, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    //  setTimeout(requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS'), 20000);
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    expect(response).toThrow(HTTPError[400]);
  });
  test('Invalid Command from FINAL_RESULTS, GO_TO_ANSWER', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    //  setTimeout(requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS'), 20000);
    const response = requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    expect(response).toThrow(HTTPError[400]);
  });
});

describe.skip('Tests for guestPlayerJoin', () => {
    let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
  };
  let session: {
    body: {sessionId: number}
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
  });

  test('Guest Join Successful', () => {
    expect(requestGuestPlayerJoin(session.body.sessionId, VD.GUESTNAME).body).toBe(expect.any(Number));
  });
  //  Not sure whether it should be VD.FIRSTNAME VD.LASTNAME or it's supposed to be usernames.
  test('Guest Name Already Exists', () => {
    expect(requestGuestPlayerJoin(session.body.sessionId, `${VD.NAMEFIRST} ${VD.NAMELAST}`).body).toThrow(HTTPError[400]);
  });
  test('Session is not in LOBBY State', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    expect(requestGuestPlayerJoin(session.body.sessionId, VD.GUESTNAME).body).toBe(expect.any(Number));
  });

describe.skip('Tests for getQuizSessionResultsCSV', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
  };
  let session: {
    body: {sessionId: number}
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
  });
  

  test('Successful retrieval of final results in a CSV file', () => {
    const session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    const response = requestGetQuizSessionResultsCSV(quiz.body.quizId, session.body.sessionId, user.body.token);
    const checkFile = checkCSV(response.body);
    expect(checkFile).toStrictEqual(true);
  });

  test('Session ID does not refer to a valid session within this quiz', () => {
    const quiz2 = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME2, VD.QUIZDESCRIPTION2);
    const session2 = requestNewSessionQuiz(quiz2.body.quizId, user.body.token, 3);
    const response = requestGetQuizSessionResults(quiz.body.quizId, session2.body.sessionId, user.body.token);
    requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    expect(response).toThrow(HTTPError[400]);
  });

  test('Session is not in FINAL_RESULTS state', () => {
    const session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    const response = requestGetQuizSessionResults(quiz.body.quizId, session.body.sessionId, user.body.token);
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    expect(response).toThrow(HTTPError[400]);
  });

  test('Token is empty or invalid', () => {
    const invalidId = uuidv4();
    const response = requestNewSessionQuiz(quiz.body.quizId, invalidId, 3);
    expect(response).toThrow(HTTPError[401]);
  });

  test('Valid token, however user is unauthorised to view this session', () => {
    const session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    const response = requestGetQuizSessionResults(quiz.body.quizId, session.body.sessionId, user2.body.token);
    expect(response).toThrow(HTTPError[403]);
  });
});

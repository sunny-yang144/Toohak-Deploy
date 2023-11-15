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
  requestGetGuestPlayerStatus,
  requestFinalResults,
  requestPlayerAnswers,
  requestQuestionResults,
  requestCurrentQuestionInfoPlayer,
  clear,
} from '../test-helpers';
import { checkCSV, generateAnswerId, generateQuestionId } from '../../other';
import { expect } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import HTTPError from 'http-errors';
import { QuestionBody, colours, Question, Answer } from '../../dataStore';
import { request } from 'http';

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

function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

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
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    session1 = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    session2 = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    session3 = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    requestUpdateSessionState(quiz.body.quizId, session3.body.sessionId, user.body.token, 'END');
  });

  test('Successful view of active and inactive sessions', () => {
    expect(requestViewSessionActivity(quiz.body.quizId, user.body.token).body).toStrictEqual(
      {
        activeSessions: [session1.body.sessionId, session2.body.sessionId],
        inactiveSessions: [session3.body.sessionId]
      }
    );
  });

  test('Token is empty or invalid', () => {
    expect(() => requestViewSessionActivity(quiz.body.quizId, invalidId)).toThrow(HTTPError[401]);
  });

  test('Token is not the owner of the quiz', () => {
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    expect(() => requestViewSessionActivity(quiz.body.quizId, user2.body.token)).toThrow(HTTPError[403]);
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
    body: {questionId: number},
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    question = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
  });

  test('Successful creation of new session', () => {
    const session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    expect(session.body).toStrictEqual({ sessionId: expect.any(Number) });
    expect(requestViewSessionActivity(quiz.body.quizId, user.body.token).body).toStrictEqual(
      {
        activeSessions: [session.body.sessionId],
        inactiveSessions: []
      }
    );
    // expect(requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body).toStrictEqual(
    //   {
    //     state: 'LOBBY',
    //     atQuestion: 0,
    //     players: [],
    //     metadata: {
    //       quizId: quiz.body.quizId,
    //       name: VD.QUIZNAME,
    //       timeCreated: expect.any(Number),
    //       timeLastEdited: expect.any(Number),
    //       description: VD.QUIZDESCRIPTION,
    //       numQuestions: 0,
    //       questions: [],
    //       duration: 0,
    //     }
    //   }
    // );
  });

  test('AutoStartNum is greater than 50', () => {
    expect(() => requestNewSessionQuiz(quiz.body.quizId, user.body.token, 500)).toThrow(HTTPError[400]);
  });

  test('There are more than 10 active sessions', () => {
    for (let i = 0; i < 10; i++) {
      requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    }
    expect(() => requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3)).toThrow(HTTPError[400]);
  });

  test('Error when no questions are in quiz', () => {
    requestAdminQuizQuestionDeleteV2(quiz.body.quizId, question.body.questionId, user.body.token);
    expect(() => requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3)).toThrow(HTTPError[400]);
  });

  test('Token is empty or invalid', () => {
    expect(() => requestNewSessionQuiz(quiz.body.quizId, invalidId, 3)).toThrow(HTTPError[401]);
  });

  test('Token is not the owner of the quiz', () => {
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    expect(() => requestNewSessionQuiz(quiz.body.quizId, user2.body.token, 3)).toThrow(HTTPError[403]);
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
  let question: {
    body: {quizId: number},
  };
  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    question = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
  });
  test('Successful retrieval of quiz results', () => {
    const session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    const quizResults = requestGetQuizSessionResults(quiz.body.quizId, session.body.sessionId, user.body.token);
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
    expect(quizResults).toStrictEqual({
      usersRankedByScore: [
        {
          name: 'Jack',
          score: 0,
        }
      ],
      questionResults: [
        {
          questionId: question,
          playersCorrectList: [],
          averageAnswerTime: 0,
          percentCorrect: 0,
        }
      ]
    });
  });
  test('Session ID does not refer to a valid session within this quiz', () => {
    const quiz2 = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME2, VD.QUIZDESCRIPTION2);
    requestAdminQuizQuestionCreateV2(quiz2.body.quizId, user.body.token, sampleQuestion2);
    const session2 = requestNewSessionQuiz(quiz2.body.quizId, user.body.token, 3);
    const response = requestGetQuizSessionResults(quiz.body.quizId, session2.body.sessionId, user.body.token);
    requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    expect(response).toThrow(HTTPError[400]);
  });
  test('Session is not in FINAL_RESULTS state', () => {
    const session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    const response = requestGetQuizSessionResults(quiz.body.quizId, session.body.sessionId, user.body.token);
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
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
describe.only('Tests for getSessionStatus', () => {
  let user: {
    body: {token: string},
    statusCode: number,
  };
  let quiz: {
    body: {quizId: number},
  };
  let session: {
    body: {sessionId: number},
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
  });

  test('Successfully gets session status', () => {
    const sessionStatus = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body;
    expect(sessionStatus).toStrictEqual(
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
          numQuestions: 1,
          questions: [
            {
              questionId: expect.any(Number),
              question: 'Who is the Monarch of England?',
              duration: 4,
              thumbnailUrl: VD.IMAGEURL,
              points: 5,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Prince Charles',
                  colour: expect.any(String),
                  correct: true
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Queen Elizabeth',
                  colour: expect.any(String),
                  correct: true,
                }
              ]
            }
          ],
          thumbnailUrl: '',
          duration: 4,
        }
      }
    );
    const colour1 = sessionStatus.metadata.questions[0].answers[0].colour;
    const coloursArray = Object.values(colours);
    expect(coloursArray).toContain(colour1);
  });

  test('Session ID does not refer to a valid session within this quiz', () => {
    const quiz2 = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME2, VD.QUIZDESCRIPTION2);
    requestAdminQuizQuestionCreateV2(quiz2.body.quizId, user.body.token, sampleQuestion2);
    const session2 = requestNewSessionQuiz(quiz2.body.quizId, user.body.token, 3);
    expect(() => requestGetSessionStatus(quiz.body.quizId, session2.body.sessionId, user.body.token)).toThrow(HTTPError[400]);
  });

  test('Token is empty or invalid', () => {
    const invalidId = uuidv4();
    expect(() => requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, invalidId)).toThrow(HTTPError[401]);
  });

  test('Valid token, however user is unauthorised to view this session', () => {
    const user2 = requestAdminAuthRegister(VD.EMAIL2, VD.PASSWORD2, VD.NAMEFIRST2, VD.NAMELAST2);
    expect(() => requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user2.body.token)).toThrow(HTTPError[403]);
  });
});

describe.only('Tests for updateSessionState', () => {
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
    requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
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
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('QUESTION_OPEN');
  });

  test('QUESTION_COUNTDOWN to QUESTION_OPEN automatically after 3 seconds', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    sleepSync(3 * 1000);
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('QUESTION_OPEN');
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
    sleepSync(4 * 1000);
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('QUESTION_CLOSE');
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
    sleepSync(4 * 1000);
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('QUESTION_COUNTDOWN');
  });
  test('QUESTION_CLOSE to END on END', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    sleepSync(4 * 1000);
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'END');
    const getSessions = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token).body.state;
    expect(getSessions).toBe('END');
  });
  test('QUESTION_CLOSE to FINAL_RESULTS on GO_TO_FINAL_RESULTS', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    sleepSync(4 * 1000);
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
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
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from LOBBY, GO_TO_ANSWER', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from LOBBY, GO_TO_FINAL_RESULT', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_COUNTDOWN, NEXT_QUESTION', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_COUNTDOWN, GO_TO_ANSWER', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_COUNTDOWN, GO_TO_FINAL_RESULTS', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_OPEN, NEXT_QUESTION', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_OPEN, GO_TO_FINAL_RESULTS', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_OPEN, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from QUESTION_CLOSE, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    sleepSync(4 * 1000);
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from ANSWER_SHOW, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from ANSWER_SHOW, GO_TO_ANSWER', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from FINAL_RESULTS, NEXT_QUESTION', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from FINAL_RESULTS, SKIP_COUNTDOWN', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN')).toThrow(HTTPError[400]);
  });
  test('Invalid Command from FINAL_RESULTS, GO_TO_ANSWER', () => {
    // it shouldnt be doing anything with skip countdown here, so i assumed an error would spit out
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'NEXT_QUESTION');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'SKIP_COUNTDOWN');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
    expect(() => requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
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
});
describe.skip('Tests for getQuizSessionResultsCSV', () => {
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
describe.skip('Tests for guestPlayerStatus', () => {
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
  let player: {
    body: {playerId: number}
  };

  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    player = requestGuestPlayerJoin(session.body.sessionId, VD.GUESTNAME);
  });

  test('Guest Status Successful', () => {
    expect(requestGetGuestPlayerStatus(player.body.playerId).body).toBe(
      {
        state: 'LOBBY',
        numQuestions: 0,
        atQuestion: 0
        //  I'm not sure what the numQuestion and atQuestion numbers should be
      }
    );
  });
  test('PlayerId does not exist', () => {
    expect(requestGetGuestPlayerStatus(1000).body).toThrow(HTTPError[400]);
  });
});

describe.skip('Tests for finalResults', () => {
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
  let session: {
    body: {sessionId: number},
  };
  let player: {
    body: {playerId: number},
  };
  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    player = requestGuestPlayerJoin(session.body.sessionId, VD.GUESTNAME);
    question = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
  });
  test('Successful retrieval of final results', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_FINAL_RESULTS');
    const finalResults = requestFinalResults(player.body.playerId);
    expect(finalResults).toStrictEqual({
      usersRankedByScore: [
        {
          name: 'Jack',
          score: 0,
        }
      ],
      questionResults: [
        {
          questionId: question,
          playersCorrectList: [],
          averageAnswerTime: 0,
          percentCorrect: 0,
        }
      ]
    });
  });
  test('Player ID does not exist', () => {
    expect(requestGetGuestPlayerStatus(1000).body).toThrow(HTTPError[400]);
  });

  test('Session is not in FINAL_RESULTS state', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    expect(requestFinalResults(player.body.playerId)).toThrow(HTTPError[400]);
  });
});

describe('Tests for player submission of answers', () => {
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
  let question2: {
    body: {questionId: number},
  };
  let session: {
    body: {sessionId: number},
  };
  let player: {
    body: {playerId: number},
  };
  let questionIndex: number;
  let answerIds: number[];
  beforeEach(() => {
    user = requestAdminAuthRegister(VD.EMAIL, VD.PASSWORD, VD.NAMEFIRST, VD.NAMELAST);
    quiz = requestAdminQuizCreateV2(user.body.token, VD.QUIZNAME, VD.QUIZDESCRIPTION);
    session = requestNewSessionQuiz(quiz.body.quizId, user.body.token, 3);
    player = requestGuestPlayerJoin(session.body.sessionId, VD.GUESTNAME);
    question = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion1);
    question2 = requestAdminQuizQuestionCreateV2(quiz.body.quizId, user.body.token, sampleQuestion2);
    // Construct an array of answerIds for the currently active question
    const quizData = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token);
    const guestStatus = requestGetGuestPlayerStatus(player.body.playerId);
    questionIndex = guestStatus.body.atQuestion
    const answers = quizData.body.metadata.questions[questionIndex].answers;
    answerIds = answers.map((answer: Answer) => answer.answerId);
  });

  test('Sucessful submission of answers to currently active question', () => {
    expect(requestPlayerAnswers(answerIds, player.body.playerId, 1)).toStrictEqual({});
    // Check if a player who sumbits an answer has had their questionInformation changed ... TODO
    // Check if a player who submits correct answers is added to the playersCorrectList
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    expect(requestQuestionResults(player.body.playerId, 1).body.playersCorrectList).toBe([VD.NAMEFIRST]);
  });
  test('PlayerID does not exist', () => {
    expect(requestPlayerAnswers(answerIds, 1000, question.body.questionId)).toThrow(HTTPError[400]);
  });
  test('Invalid question position for current player session', () => {
    expect(requestPlayerAnswers(answerIds, player.body.playerId, 1000)).toThrow(HTTPError[400]);
  });
  test('Session is not in QUESTION_OPEN state', () => {
    requestUpdateSessionState(quiz.body.quizId, session.body.sessionId, user.body.token, 'GO_TO_ANSWER');
    expect(requestPlayerAnswers(answerIds,player.body.playerId, question.body.questionId )).toThrow(HTTPError[400]);
  });
  test('Session is not yet up to this question', () => {
    expect(requestPlayerAnswers(answerIds, player.body.playerId, question2.body.questionId)).toThrow(HTTPError[400]);
  });
  test('Invalid answerID for this particular question', () => {
    expect(requestPlayerAnswers([1000,2000,3000], player.body.playerId, question.body.questionId)).toThrow(HTTPError[400]);
  });
  test('Duplicate answerID provided', () => {
    const duplicateAnswerIds = answerIds.concat(answerIds);
    expect(requestPlayerAnswers(duplicateAnswerIds, player.body.playerId, question.body.questionId)).toThrow(HTTPError[400]);
  });
  test('Less than 1 answerID provided', () => {
    expect(requestPlayerAnswers([], player.body.playerId, question.body.questionId)).toThrow(HTTPError[400]);
  });
  test('Can submit more than once in the CORRECT state', () => {
    expect(requestPlayerAnswers(answerIds, player.body.playerId, 1)).toStrictEqual({});
    const sessionStatus = requestGetSessionStatus(quiz.body.quizId, session.body.sessionId, user.body.token);
    sleepSync(3 * 1000);
    if (sessionStatus.body === 'QUESTION_OPEN') {
      expect(requestPlayerAnswers(answerIds, player.body.playerId, 1)).toStrictEqual({});
    }
    else {
      expect(requestPlayerAnswers(answerIds, player.body.playerId, 1)).toThrow(HTTPError[400]);
    }
  });
});
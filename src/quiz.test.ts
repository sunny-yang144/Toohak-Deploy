import {
  requestAdminAuthRegister,
  requestAdminQuizList,
  requestAdminQuizCreate,
  requestAdminQuizInfo,
  requestAdminQuizRemove,
  requestAdminQuizNameUpdate,
  requestAdminQuizDescriptionUpdate,
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
} from './test-helpers';

import { v4 as uuidv4 } from 'uuid';

import { colours } from './dataStore';

import { QuestionBody } from './dataStore';

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
  question: "Who is the Monarch of England?",
  duration: 4,
  points: 5,
  answers: [
    {
      answer: "Prince Charles",
      correct: true
    }
  ]
} 

const sampleQuestion2: QuestionBody = {
  question: "What is 2 + 2?", 
  duration: 1,
  points: 1,
  answers: [
    {
      answer: "2",
      correct: true
    }
  ]
}


beforeEach(() => {
  clear();
});
/**
   * 1. [x] 2. [x] 3. [x] 4. [x] 5. [x]
   *
   *            ERROR CASES
   * 1. Case where there is an invalid authUserId
   * i.e. create an authUserId + 1 (will always be invalid)
   *
   * 2. No Quiz is created
   *
   *            SUCCESS CASES/MISC
   * 3. Single quiz created, list generated after inputing quiz owner
   *
   * 4. Case where multiple quizzes are created with the same Id
   * i.e. gives back a list of quizzes
   *
   * 5. Case where multiple authUserId, create a quiz, then use
   * another Id to create another quiz. Check if:
   * given wrong id -> ERROR
   * given correct id -> gives list.
   *
   */
describe('Tests for adminQuizList', () => {
  test('Invalid token', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizList(user.body.token + 1);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // 'Invalid token'
    expect(response.statusCode).toStrictEqual(401);
  });

  test('No quiz created by a user', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminQuizList(user.body.token);
    expect(response.body).toStrictEqual({ quizzes: [] }); // 'This user doesn't own any quizzes.' (Return empty array)
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Successful output of quizzes owned by a User', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
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
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quiz2 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME2, validDetails.QUIZDESCRIPTION2);
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
    const user1 = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user1.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);

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
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    expect(response.body).toStrictEqual({ quizId: expect.any(Number) });
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Contains Symbol', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminQuizCreate(user.body.token, 'hell o1!', validDetails.QUIZDESCRIPTION);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // 'Invalid Characters'
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Less Than 3 Characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminQuizCreate(user.body.token, 'h1', validDetails.QUIZDESCRIPTION);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // 'Name Too Short'
    expect(response.statusCode).toStrictEqual(400);
  });
  test('More Than 30 Characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminQuizCreate(user.body.token, 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhh1', validDetails.QUIZDESCRIPTION);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // 'Name Too Long'
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Existing Quiz', () => {
    // Quiz with the same name has already been
    // created by the user which mean this assumes
    // a quiz already exists
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // Existing Quiz
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Token is not valid', () => {
    // using 2 for now since the return for authUserId is currently 1
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminQuizCreate(user.body.token + 1, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // Invalid Token
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Description is More than 100 Characters', () => {
    // using 2 for now since the return for authUserId is currently 1
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const response = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, 'This description is to be really long' +
    "and even longer than 100 characters which I don't really know how to do");
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // Description Too Long
    expect(response.statusCode).toStrictEqual(400);
  });
});

describe('Tests for adminQuizRemove', () => {
  test('Invalid Token.', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);

    const response = requestAdminQuizRemove(user.body.token + 1, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Invalid quiz ID.', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);

    const response = requestAdminQuizRemove(user.body.token, quiz.body.quizId + 1);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('User does not own quiz.', () => {
    const user1 = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user1.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);

    const response = requestAdminQuizRemove(user2.body.token, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });

  test('Correct parameters given.', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);

    const response = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
  });
});

describe('Tests for adminQuizInfo', () => {
  /**

  * 1. [x] 2. [x] 3. [x] 4. [x] 5. [x]
   *
   * Function structure
   *
   * Parameters:
   * ( authUserId, quizId )
   *
   * Returns:
   *
   * ObjectTYPE
   * {quizId: number,
   *  name: string,
   *  timeCreated: number, (UNIX TIME)
   *  timeLastEdited: number,
   *  description: string,}
}
   */

  /**
     *           ERROR CASES
     * 1. Case where there is an invalid authUserId
     * i.e. create an authUserId + 1 (will always be invalid)
     *
     * 2. Case where the QuizId doesn't exit
     *
     * 3. Case quiz isnt owned by the User (User should have an array
     * containing all quizIds owned by that user)
     * i.e. Create two users, use one to create a quiz test.
     * Check if other user is unable to check Info on quiz.
     *
     *            SUCCESS CASES
     * 4. Create user and create quiz using userId, use the
     * quiz owner to check info (match return object)
     *
     * 5. Create user and multiple quizzes using userId,
     * find info on first quiz, then second quiz.
     *
     */

  test('Invalid token', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizInfo(user.body.token + 1, quiz.body.quizId);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // 'authUserId is not a valid Id'
    expect(response.statusCode).toStrictEqual(401);
  });

  test('User is accessing a quiz that doesnt exit', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizInfo(user.body.token, quiz.body.quizId + 1);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // 'Quiz does not exist'
    expect(response.statusCode).toStrictEqual(400);
  });

  test('User is accessing a quiz that the user does not own', () => {
    const user1 = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user1.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizInfo(user2.body.token, quiz.body.quizId);
    expect(response.body).toStrictEqual(
      { error: expect.any(String) }
    ); // 'Quiz is not owned by user'
    expect(response.statusCode).toStrictEqual(403);
  });

  test('Successful retrival of quiz info', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
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
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quiz2 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME2, validDetails.QUIZDESCRIPTION2);
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
  test.todo('Quizzes made with some questions added to it.'), () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
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
            answers: [
              {
                answerId: expect.any(Number),
                answer: expect.any(String),
                colour: expect.any(colours),
                correct: expect.any(Boolean),
              }
            ],
          }
        ],
        duration: expect.any(Number),
      }
    );
    expect(response.statusCode).toStrictEqual(200);
  }
});

describe('Tests for adminQuizNameUpdate', () => {
  // Clear and create a valid quiz and user for the test to apply requestAdminQuizNameUpdate
  test('Sucessfully updated quiz name', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user.body.token, quiz.body.quizId, 'Valid Name');
    expect(response.body).toStrictEqual({}); // Returns {} on success
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Invalid Token', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user.body.token + 1, quiz.body.quizId, 'Valid Name');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // authUserId isnt valid
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Given QuizID does not match a valid quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user.body.token, quiz.body.quizId + 1, 'Valid Name');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // No matching QuizID
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Given QuizID is not owned by user', () => {
    const user1 = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user1.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user2.body.token, quiz.body.quizId, 'New Name');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // User2 does not own the quiz
    expect(response.statusCode).toStrictEqual(403);
  });

  test('Name contains invalid characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user.body.token, quiz.body.quizId, 'Inval!d Name');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // Updated quiz name contains symbols
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Name is Less than 3 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user.body.token, quiz.body.quizId, 'to');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // Updated quiz name is too short (<3)
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Name is More than 30 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizNameUpdate(user.body.token, quiz.body.quizId, 'theGivenUpdatedNameIsWayTooLong');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // Updated name is too long (>30)
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Name is already used by current logged in user for another quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quiz2 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME2, validDetails.QUIZDESCRIPTION2);
    const response = requestAdminQuizNameUpdate(user.body.token, quiz2.body.quizId, validDetails.QUIZNAME2);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // User already owns a quiz with the provided name
    expect(response.statusCode).toStrictEqual(400);
  });
});

describe('Tests for adminQuizDescriptionUpdate', () => {
  // Clear and create a valid quiz and user for the test to apply adminQuizDescriptionUpdate
  test('Sucessfully updated quiz description', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizDescriptionUpdate(user.body.token, quiz.body.quizId, 'Valid Description');
    expect(response.body).toStrictEqual({}); // Returns {} on success
    expect(response.statusCode).toStrictEqual(200);
  });

  test('Invalid Token', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizDescriptionUpdate(user.body.token + 1, quiz.body.quizId, 'Valid Description');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // authUserId isnt valid
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Given QuizID does not match a valid quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizDescriptionUpdate(user.body.token, quiz.body.quizId + 1, 'New Description');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // No matching QuizID
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Given QuizID is not owned by user', () => {
    const user1 = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = requestAdminQuizCreate(user1.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizDescriptionUpdate(user2.body.token, quiz.body.quizId, 'New Description');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // User2 does not own the quiz
    expect(response.statusCode).toStrictEqual(403);
  });

  test('Name is More than 100 characters', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizDescriptionUpdate(user.body.token, quiz.body.quizId, 'theGivenUpdatedNameIsWaaaaaaaaaaaaaaaaaaaaaaayTooLong' +
    'RanOutOfThingsToTypeSoHereIGoOnRambling' + 'ReallyHopeThisIsEnough');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // Updated quiz description is too long (>100)
    expect(response.statusCode).toStrictEqual(400);
  });
});

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////     ITERATION 2      //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

describe.only('Tests for adminQuizTrash', () => {
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
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const remove2 = requestAdminQuizRemove(user.body.token, quiz2.body.quizId);
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
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrash(user.body.token + 1);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // 'Invalid token'
    expect(response.statusCode).toStrictEqual(401);
  });
});
describe.skip('Tests to Empty adminQuizTrashRemove', () => {
  test('Successful Trash Empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token, quiz.body.quizId); // needs to be an array of quizzes
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({
      quizzes: []
    });
    expect(response.statusCode).toStrictEqual(200);
  });

  test('quizId is not in the Trash', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const clearTrash = requestAdminTrashRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('quizId is not Valid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token, quiz.body.quizId + 1);
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('User does not own Quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token + 1, quiz.body.quizId);
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Invalid token', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrash(user.body.token + 1);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // 'Invalid token'
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Valid Token, User is not Owner of Quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const clearTrash = requestAdminTrashRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // 'Invalid token'
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe.skip('Testing adminQuizTransfer', () => {
  const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
  const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
  const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
  const token = user.body.token;
  const token2 = user2.body.token;

  test('Successful adminQuizTransfer', () => {
    const response = requestAdminQuizTransfer(token, validDetails.EMAIL2, quiz.body.quizId);
    // Check if function returns any errors
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Confirm user no longer has quiz and that user2 now posseses quiz
    expect(requestAdminQuizList(token)).toStrictEqual({ quizzes: [] });
    expect(requestAdminQuizList(token2)).toStrictEqual(
      {
        quizzes:
        [{
          quizId: quiz.body.quizId,
          name: validDetails.QUIZNAME,
        }]
      });
  });

  test('Unsuccessful adminQuizTransfer, quizId does not refer to a valid quiz', () => {
    const response = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL2, -666);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful adminQuizTransfer, userEmail is not a real user', () => {
    const response = requestAdminQuizTransfer(user.body.token, 'notRealUser@gmail.com', quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful adminQuizTransfer, userEmail is the current logged in user', () => {
    const response = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful adminQuizTransfer, quizId refers to a quiz that has a name that is already used by the target user', () => {
    requestAdminQuizCreate(token2, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION2);
    const response = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL2, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful adminQuizTransfer, token is empty', () => {
    const response = requestAdminQuizTransfer('', validDetails.EMAIL2, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful adminQuizTransfer, token is invalid', () => {
    const response = requestAdminQuizTransfer('-666', validDetails.EMAIL2, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful adminQuizTransfer, token is valid but user does not own this quiz', () => {
    const response = requestAdminQuizTransfer(token2, validDetails.EMAIL2, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe.skip('Tests for adminQuizQuestionCreate', () => {
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

  test('Successful quiz question creation', () => {
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    }
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(quizQuestion.statusCode).toStrictEqual(200);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    }
    const quizQuestion = requestAdminQuizQuestionCreate(-1, token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz.' });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('Question string is less than 5 characters in length or greater than 50 characters in length', () => {
    const questionBody = {
      question: 'abcd',
      duration: question.duration,
      points: question.points,
      answers: answers,
    }
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: 'Question is less than 5 characters long' });
    expect(quizQuestion.statusCode).toStrictEqual(400);

    const questionBody2 = {
      question: 'a'.repeat(51),
      duration: question.duration,
      points: question.points,
      answers: answers,
    }
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody2);
    expect(quizQuestion2.body).toStrictEqual({ error: 'Question is greater than 50 characters long' });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  test('The question has more than 6 answers or less than 2 answers', () => {
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
    }
    const quizQuestion1 = requestAdminQuizQuestionCreate(quiz2.body.quizId, token, questionBody1);
    expect(quizQuestion1.body).toStrictEqual({ error: 'More than 6 answers' });
    expect(quizQuestion1.statusCode).toStrictEqual(400);

    const questionBody2 = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers3,
    }
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz2.body.quizId, token, questionBody2);
    expect(quizQuestion2.body).toStrictEqual({ error: 'Less than 2 answers' });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  test('The question duration is not a positive number', () => {
    const questionBody = {
      question: question.question,
      duration: -1,
      points: question.points,
      answers: answers,
    }
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: 'Question duration is not a positive number' });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('The sum of the question durations in quiz exceeds 3 minutes', () => {
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
    }
    const questionBody2 = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: answers,
    }

    requestAdminQuizQuestionCreate(quiz1.body.quizId, token, questionBody1);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz1.body.quizId, token, questionBody2);
    expect(quizQuestion.body).toStrictEqual({ error: 'Sum of the question durations in quiz exceeds 3 minutes' });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('The points awarded for the question are less than 1 or greater than 10', () => {
    const questionBody1 = {
      question: question.question,
      duration: question.duration,
      points: 0,
      answers: answers,
    }
    const questionBody2 = {
      question: question.question,
      duration: question.duration,
      points: 11,
      answers: answers,
    }
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody1);
    expect(quizQuestion.body).toStrictEqual({ error: 'Points awarded for the question are less than 1' });
    expect(quizQuestion.statusCode).toStrictEqual(400);

    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody2);
    expect(quizQuestion2.body).toStrictEqual({ error: 'Points awarded for the question are greater than 10' });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  test('The length of any answer is shorter than 1 character long or longer than 30 characters long', () => {
    const noCharacterAnswer = [
      { answer: '', correct: false },
      { answer: 'something', correct: true },
    ];
    const questionBody1 = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: noCharacterAnswer,
    }
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody1);
    expect(quizQuestion.body).toStrictEqual({ error: 'length of answer shorter than 1 character' });
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
    }
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody2);
    expect(quizQuestion2.body).toStrictEqual({ error: 'Length of answer longer than 30 characters' });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  test('Any answer strings are duplicates of one another (within the same question)', () => {
    const sameAnswers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Chicken', correct: true },
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: sameAnswers,
    }
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: 'Answer strings are duplicates' });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('There are no correct answers', () => {
    const incorrectAnswersOnly = [
      { answer: 'Chicken', correct: false },
      { answer: 'Nuggets', correct: false }
    ];
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: incorrectAnswersOnly,
    }
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: 'No correct answers' });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('Token is empty or invalid (does not refer to valid logged in user session', () => {
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    }
    const incorrectToken = uuidv4();
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, incorrectToken, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: 'Token invalid (does not refer to valid logged in user session' });
    expect(quizQuestion.statusCode).toStrictEqual(401);

    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, '', questionBody);
    expect(quizQuestion2.body).toStrictEqual({ error: 'Token empty' });
    expect(quizQuestion2.statusCode).toStrictEqual(401);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const questionBody = {
      question: question.question,
      duration: question.duration,
      points: question.points,
      answers: answers,
    }
    const user1 = requestAdminAuthRegister('drizman123@gmail.com', validDetails.PASSWORD, 'Driz', 'Haj');

    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user1.body.token, questionBody);
    expect(quizQuestion.body).toStrictEqual({ error: 'User is not owner of this quiz' });
    expect(quizQuestion.statusCode).toStrictEqual(403);
  });
});

describe.skip('Tests for adminQuizQuestionDelete', () => {
  // Create user and quiz
  const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
  const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
  const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
  const token = user.body.token;
  const token2 = user2.body.token;
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
  }
  // Create quizQuestion for deletion
  const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);

  test('Successful adminQuizQuestionDelete', () => {
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, quizQuestion.body.questionId, token);
    // Check for error codes
    expect(response.body).toStrictEqual({}); 
    expect(response.statusCode).toStrictEqual(200);
    // Check if question was removed from quizInfo
    const quizInfoNew = requestAdminQuizInfo(token, quiz.body.quizId)
    expect(quizInfoNew.body.questions).toStrictEqual({});
  });

  test('Unsuccessful call, quizId does not refer to a valid quiz', () => {
    const response = requestAdminQuizQuestionDelete(-666, quizQuestion.body.questionId, token);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, questionId does not refer to a valid question within this quiz', () => {
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, -666, token);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, quizQuestion.body.questionId, '');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is invalid', () => {
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, quizQuestion.body.questionId, '-666');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is valid but user is not a owner of this quiz', () => {
    const response = requestAdminQuizQuestionDelete(quiz.body.quizId, quizQuestion.body.questionId, token2);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe.skip('Tests for adminQuizQuestionDuplicate', () => {
  // Create user and quiz
  const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
  const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
  const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
  const token = user.body.token;
  const token2 = user2.body.token;
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
  }
  // Create quizQuestion for duplication
  const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);
  
  test('Successful quizQuestionDuplicate', () => {
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, quizQuestion.body.questionId, token);
    // Check for error codes
    expect(response.body).toStrictEqual({}); 
    expect(response.statusCode).toStrictEqual(200);
    // Check if quiz was duplicated 
    const quizInfoNew = requestAdminQuizInfo(user.body.token, quiz.body.quizId)
    expect(quizInfoNew.body.questions).toStrictEqual(
      [
        {
          questionId: expect.any(String), // Should be question 1
          question: `${question.question}`,
          duration: `${question.duration}`,
          points: `${question.points}`,
          answers: [
            {
              answerId: expect.any(String),
              answer: `${answers}`,
              colour: expect.any(String),
              correct: expect.any(String),
            }
          ],
        },
        {
          questionId: expect.any(String), // Should be question 1's duplicate
          question: `${question}`,
          duration: `${question.duration}`,
          points: `${question.points}`,
          answers: [
            {
              answerId: expect.any(String),
              answer: `${answers}`,
              colour: expect.any(String),
              correct: expect.any(String),
            }
          ],
        },
      ]
    );
  });

  test('Unsuccessful call, quizId does not refer to a valid quiz', () => {
    const response = requestAdminQuizQuestionDuplicate(-666, quizQuestion.body.questionId, token);
    expect(response.body).toStrictEqual({ error: expect.any(String)}); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, questionId does not refer to a valid question within quiz', () => {
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, -666, token);
    expect(response.body).toStrictEqual({ error: expect.any(String)}); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, quizQuestion.body.questionId, '');
    expect(response.body).toStrictEqual({ error: expect.any(String)}); 
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is invalid', () => {
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, quizQuestion.body.questionId, '-666');
    expect(response.body).toStrictEqual({ error: expect.any(String)}); 
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, valid token but user is not an owner of quiz', () => {
    const response = requestAdminQuizQuestionDuplicate(quiz.body.quizId, quizQuestion.body.questionId, token2);
    expect(response.body).toStrictEqual({ error: expect.any(String)}); 
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe.skip('Tests for adminQuizQuestionMove', () => {
  // Create user and quiz
  const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
  const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
  const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
  const token = user.body.token;
  const token2 = user2.body.token;
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
  }
  const questionBody2 = {
    question: question2.question,
    duration: question2.duration,
    points: question2.points,
    answers: answers2,
  }
  // Create quizQuestion for move (In same Quiz)
  const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);
  const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody2);
  // Create newPosition (The position index is assumed to start at 0)
  const newPosition = 0;

  test('Successful adminQuizQuestionMove', () => {
    // This case will test if the second question will be moved to first place
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, token, newPosition);
    // Check for error codes
    expect(response.body).toStrictEqual({}); 
    expect(response.statusCode).toStrictEqual(200);
    // Check if parameters were updated
    const quizInfoNew = requestAdminQuizInfo(token, quiz.body.quizId)
    expect(quizInfoNew.body.questions).toStrictEqual(
      [
        {
          questionId: expect.any(String), // Should now be question 2
          question: `${question2.question}`,
          duration: `${question2.duration}`,
          points: `${question2.points}`,
          answers: [
            {
              answerId: expect.any(String),
              answer: `${answers2}`,
              colour: expect.any(String),
              correct: expect.any(String),
            }
          ],
        },
        {
          questionId: expect.any(String), // Should now be question 1
          question: `${question.question}`,
          duration: `${question.duration}`,
          points: `${question.points}`,
          answers: [
            {
              answerId: expect.any(String),
              answer: `${answers}`,
              colour: expect.any(String),
              correct: expect.any(String),
            }
          ],
        },
      ]
    );
  });

  test('Unsuccessful Call, quizId does not refer to a valid quiz', () => {
    const response = requestAdminQuizQuestionMove(-666, quizQuestion2.body.questionId, token, newPosition);
    expect(response.body).toStrictEqual({ error: expect.any(String)}); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful Call, questionId does not refer to a valid question within the quiz', () => {
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, -666, token, newPosition);
    expect(response.body).toStrictEqual({ error: expect.any(String)}); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful Call, newPosition is less than 0', () => {
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, token, -666);
    expect(response.body).toStrictEqual({ error: expect.any(String)}); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful Call, newPosition is greater then n-1 where n is the number of questions', () => {
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, token, 666);
    expect(response.body).toStrictEqual({ error: expect.any(String)}); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful Call, newPosition is the position of the current question', () => {
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, token, 1);
    expect(response.body).toStrictEqual({ error: expect.any(String)}); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful Call, token is empty', () => {
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, '', newPosition);
    expect(response.body).toStrictEqual({ error: expect.any(String)}); 
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful Call, token is invalid', () => {
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, '-666', newPosition);
    expect(response.body).toStrictEqual({ error: expect.any(String)}); 
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful Call, token is valid but user is not owner of quiz', () => {
    const response = requestAdminQuizQuestionMove(quiz.body.quizId, quizQuestion2.body.questionId, token2, newPosition);
    expect(response.body).toStrictEqual({ error: expect.any(String)}); 
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe.skip('Tests for adminQuizQuestionUpdate', () => {
  // Create user and quiz
  const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
  const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
  const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
  const token = user.body.token;
  const token2 = user2.body.token;
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
  }
  const questionBody2 = {
    question: question2.question,
    duration: question2.duration,
    points: question2.points,
    answers: answers2,
  }
  // Create quizQuestion to update
  const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, questionBody);

  test('Successful adminQuizQuestionUpdate', () => {
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token, questionBody2);
    // Check for error codes
    expect(response.body).toStrictEqual({}); 
    expect(response.statusCode).toStrictEqual(200);
    // Check if quizQuestion now contains questionBody2
    const quizInfoNew = requestAdminQuizInfo(user.body.token, quiz.body.quizId)
    expect(quizInfoNew.body.questions).toStrictEqual(
      {
        questionId: expect.any(String),
        question: `${question2.question}`,
        duration: `${question2.duration}`,
        points: `${question2.points}`,
        answers: [
          {
            answerId: expect.any(String),
            answer: `${answers2}`,
            colour: expect.any(String),
            correct: expect.any(String),
          }
        ],
      }
    );
  });

  test('Unsuccessful call, quizId does not refer to a valid quiz', () => {
    const response = requestAdminQuizQuestionUpdate(-666, quizQuestion.body.questionId, token, questionBody2);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, questionId does not refer to a valid question within this quiz', () => {
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, -666, token, questionBody2);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, questionString is less than 5 characters in length', () => {
    const questionBodyShort = {
      question: 'Shrt',
      duration: question2.duration,
      points: question2.points,
      answers: answers2,
    }
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token, questionBodyShort);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, questionString is greater then 50 characters in length', () => {
    const questionBodyLong = {
      question: 'Long'.repeat(51),
      duration: question2.duration,
      points: question2.points,
      answers: answers2,
    }
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token, questionBodyLong);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, question has more then 6 answers', () => {
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
    }
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token, questionBodyTooManyAnswers);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, question has less than 2 answers', () => {
    const tooFewAnswers = [
      { answer: 'Chicken', correct: true },
    ];
    const questionBodyTooFewAnswers = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: tooFewAnswers,
    }
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token, questionBodyTooFewAnswers);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, question duration is not a positive number', () => {
    const questionBodyNegativeDuration = {
      question: question2.question,
      duration: -1,
      points: question2.points,
      answers: answers2,
    }
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token, questionBodyNegativeDuration);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, sum of all question durations in the quiz exceeds 3 minutes', () => {
    const questionBodyExcessiveDuration = {
      question: question2.question,
      duration: 200,
      points: question2.points,
      answers: answers2,
    }
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token, questionBodyExcessiveDuration);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, points awarded is less than 1', () => {
    const questionBodyNoPoints = {
      question: question2.question,
      duration: question2.duration,
      points: 0,
      answers: answers2,
    }
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token, questionBodyNoPoints);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, points awarded is greater than 10', () => {
    const questionBodyTooManyPoints = {
      question: question2.question,
      duration: question2.duration,
      points: 11,
      answers: answers2,
    }
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token, questionBodyTooManyPoints);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, length of any answer is shorter than 1 character long', () => {
    const emptyAnswer = [
      { answer: '', correct: false },
      { answer: 'Lettuce', correct: true },
    ];
    const questionBodyEmptyAnswer = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: emptyAnswer,
    }
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token, questionBodyEmptyAnswer);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, length of any answer is longer then 30 characters long', () => {
    const longAnswer = [
      { answer: 'a'.repeat(32), correct: false },
      { answer: 'Lettuce', correct: true },
    ];
    const questionBodyLongAnswer = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: longAnswer,
    }
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token, questionBodyLongAnswer);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, duplicate answers in the same question', () => {
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
    }
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token, questionBodyDuplicateAnswer);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, no correct answers', () => {
    const noCorrectAnswer = [
      { answer: 'No correct answers', correct: false },
    ];
    const questionBodyNoCorrectAnswer = {
      question: question2.question,
      duration: question2.duration,
      points: question2.points,
      answers: noCorrectAnswer,
    }
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token, questionBodyNoCorrectAnswer);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, '', questionBody2);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is invalid', () => {
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, '-666', questionBody2);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, valid token but user is not authorised', () => {
    const response = requestAdminQuizQuestionUpdate(quiz.body.quizId, quizQuestion.body.questionId, token2, questionBody2);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe.skip('Tests for adminQuizTrashRestore', () => {

  test('Successful adminQuizTrashRestore', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, user.body.token);
    console.log(response);
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
    )
  });

  test('Unsuccessful call, quizId does not refer to a valid quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const token = user.body.token;
    const response = requestAdminQuizTrashRestore(token, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, quizName of restored quiz is already used by another active quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const token = user.body.token;
    const quiz2 = requestAdminQuizCreate(token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION2);
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, token);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, quizId refers to a quiz that is not currently in trash', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const token = user.body.token;
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz2 = requestAdminQuizCreate(user2.body.token, validDetails.QUIZNAME2, validDetails.QUIZDESCRIPTION2);
    const response = requestAdminQuizTrashRestore(quiz2.body.quizId, user2.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(400);
  });

  test('Unsuccessful call, token is empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const token = user.body.token;
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, '');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, token is invalid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const token = user.body.token;
    const response = requestAdminQuizTrashRestore(quiz.body.quizId, '-666');
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(401);
  });

  test('Unsuccessful call, valid token but user is not an owner of quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const remove = requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const token = user.body.token;
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const response = requestAdminQuizTrashRestore(user2.body.token, quiz.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); 
    expect(response.statusCode).toStrictEqual(403);
  });
});
// When all tests are run clear the data
clear();

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
  clear,
} from './test-helpers';

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
      }
    );
    expect(response2.statusCode).toStrictEqual(200);
  });
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

/// /////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////     ITERATION 2      //////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////

describe.skip('Tests for adminQuizTrash', () => {
  test('Successful Trash List', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.body.quizId,
          name: expect.any(String),
        }
      ]
    });
    expect(response.statusCode).toStrictEqual(200);
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
describe.skip('Tests to Empty adminQuizTrashRemove', () => {
  test('Successful Trash Empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    requestAdminTrashRemove(user.body.token, quiz.body.quizId); // needs to be an array of quizzes
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({
      quizzes: []
    });
    expect(response.statusCode).toStrictEqual(200);
  });

  test('quizId is not in the Trash', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminTrashRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('quizId is not Valid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    requestAdminTrashRemove(user.body.token, quiz.body.quizId + 1);
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('User does not own Quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    requestAdminTrashRemove(user.body.token + 1, quiz.body.quizId);
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Invalid token', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    requestAdminTrashRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrash(user.body.token + 1);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // 'Invalid token'
    expect(response.statusCode).toStrictEqual(401);
  });
  test('Valid Token, User is not Owner of Quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizRemove(user.body.token, quiz.body.quizId);
    requestAdminTrashRemove(user.body.token, quiz.body.quizId);
    const response = requestAdminQuizTrash(user.body.token);
    expect(response.body).toStrictEqual({ error: expect.any(String) }); // 'Invalid token'
    expect(response.statusCode).toStrictEqual(403);
  });
});

describe.skip('Testing adminQuizTransfer', () => {
  test('Successful adminQuizTransfer', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL2, quizId1.body.quizId);
    // Check if function returns any errors
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
    // Confirm user1 no longer has quiz and that user2 does
    expect(requestAdminQuizList(user.body.token)).toStrictEqual({ quizzes: [] });
    expect(requestAdminQuizList(user.body.token)).toStrictEqual(
      {
        quizzes:
        [{
          quizId: quizId1,
          name: validDetails.QUIZNAME
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
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizTransfer(user.body.token, 'notRealUser@gmail.com', quizId1.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful adminQuizTransfer, userEmail is the current logged in user', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL, quizId1.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful adminQuizTransfer, quizId refers to a quiz that has a name that is already used by the target user', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    requestAdminQuizCreate(user2.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION2);
    const response = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL2, quizId1.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(400);
  });
  test('Unsuccessful adminQuizTransfer, token is empty', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizTransfer('', validDetails.EMAIL2, quizId1.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });
  test('Unsuccessful adminQuizTransfer, token is invalid', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quizId1 = requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const response = requestAdminQuizTransfer('-666', validDetails.EMAIL2, quizId1.body.quizId);
    expect(response.body).toStrictEqual({ error: expect.any(String) });
    expect(response.statusCode).toStrictEqual(401);
  });
  test('Unsuccessful adminQuizTransfer, token is valid but user does not own this quiz', () => {
    const user = requestAdminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = requestAdminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    requestAdminQuizCreate(user.body.token, validDetails.QUIZNAME, validDetails.QUIZDESCRIPTION);
    const quizId2 = requestAdminQuizCreate(user2.body.token, validDetails.QUIZNAME2, validDetails.QUIZDESCRIPTION2);
    const response = requestAdminQuizTransfer(user.body.token, validDetails.EMAIL2, quizId2.body.quizId);
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
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, question.question, question.duration, question.points, answers);
    expect(quizQuestion.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(quizQuestion.statusCode).toStrictEqual(200);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const quizQuestion = requestAdminQuizQuestionCreate(-1, token, question.question, question.duration, question.points, answers);
    expect(quizQuestion.body).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz.' });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('Question string is less than 5 characters in length or greater than 50 characters in length', () => {
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, 'abcd', question.duration, question.points, answers);
    expect(quizQuestion.body).toStrictEqual({ error: 'Question is less than 5 characters long' });
    expect(quizQuestion.statusCode).toStrictEqual(400);

    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, token, 'a'.repeat(51), question.duration, question.points, answers);
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

    const quizQuestion1 = requestAdminQuizQuestionCreate(quiz2.body.quizId, token, question.question, question.duration, question.points, answers2);
    expect(quizQuestion1.body).toStrictEqual({ error: 'More than 6 answers' });
    expect(quizQuestion1.statusCode).toStrictEqual(400);

    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz2.body.quizId, token, question.question, question.duration, question.points, answers3);
    expect(quizQuestion2.body).toStrictEqual({ error: 'Less than 2 answers' });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  test('The question duration is not a positive number', () => {
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, question.question, -1, question.points, answers);
    expect(quizQuestion.body).toStrictEqual({ error: 'Question duration is not a positive number' });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('The sum of the question durations in quiz exceeds 3 minutes', () => {
    const quiz1 = requestAdminQuizCreate(user.body.token, 'Chiggen', validDetails.QUIZDESCRIPTION);
    const question1 = {
      question: 'What does KFC sell?',
      duration: 2,
      points: 5,
    };

    const question2 = {
      question: 'What does KFC sell?',
      duration: 2,
      points: 5,
    };

    requestAdminQuizQuestionCreate(quiz1.body.quizId, token, question1.question, question1.duration, question1.points, answers);
    const quizQuestion = requestAdminQuizQuestionCreate(quiz1.body.quizId, token, question2.question, question2.duration, question2.points, answers);
    expect(quizQuestion.body).toStrictEqual({ error: 'Sum of the question durations in quiz exceeds 3 minutes' });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('The points awarded for the question are less than 1 or greater than 10', () => {
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, question.question, question.duration, 0, answers);
    expect(quizQuestion.body).toStrictEqual({ error: 'Points awarded for the question are less than 1' });
    expect(quizQuestion.statusCode).toStrictEqual(400);

    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, token, question.question, question.duration, 11, answers);
    expect(quizQuestion2.body).toStrictEqual({ error: 'Points awarded for the question are greater than 10' });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  test('The length of any answer is shorter than 1 character long or longer than 30 characters long', () => {
    const noCharacterAnswer = [
      { answer: '', correct: false },
      { answer: 'something', correct: true },
    ];
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, question.question, question.duration, question.points, noCharacterAnswer);
    expect(quizQuestion.body).toStrictEqual({ error: 'length of answer shorter than 1 character' });
    expect(quizQuestion.statusCode).toStrictEqual(400);

    const manyCharacterAnswer = [
      { answer: 'a'.repeat(31), correct: false },
      { answer: 'cheese', correct: true }
    ];
    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, token, question.question, question.duration, question.points, manyCharacterAnswer);
    expect(quizQuestion2.body).toStrictEqual({ error: 'Length of answer longer than 30 characters' });
    expect(quizQuestion2.statusCode).toStrictEqual(400);
  });

  test('Any answer strings are duplicates of one another (within the same question)', () => {
    const sameAnswers = [
      { answer: 'Chicken', correct: true },
      { answer: 'Chicken', correct: true },
    ];
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, question.question, question.duration, question.points, sameAnswers);
    expect(quizQuestion.body).toStrictEqual({ error: 'Answer strings are duplicates' });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('There are no correct answers', () => {
    const incorrectAnswersOnly = [
      { answer: 'Chicken', correct: false },
      { answer: 'Nuggets', correct: false }
    ];

    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, token, question.question, question.duration, question.points, incorrectAnswersOnly);
    expect(quizQuestion.body).toStrictEqual({ error: 'No correct answers' });
    expect(quizQuestion.statusCode).toStrictEqual(400);
  });

  test('Token is empty or invalid (does not refer to valid logged in user session', () => {
    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, -1, question.question, question.duration, question.points, answers);
    expect(quizQuestion.body).toStrictEqual({ error: 'Token invalid (does not refer to valid logged in user session' });
    expect(quizQuestion.statusCode).toStrictEqual(401);

    const quizQuestion2 = requestAdminQuizQuestionCreate(quiz.body.quizId, NaN, question.question, question.duration, question.points, answers);
    expect(quizQuestion2.body).toStrictEqual({ error: 'Token empty' });
    expect(quizQuestion2.statusCode).toStrictEqual(401);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const user1 = requestAdminAuthRegister('drizman123@gmail.com', validDetails.PASSWORD, 'Driz', 'Haj');

    const quizQuestion = requestAdminQuizQuestionCreate(quiz.body.quizId, user1.body.token, question.question, question.duration, question.points, answers);
    expect(quizQuestion.body).toStrictEqual({ error: 'User is not owner of this quiz' });
    expect(quizQuestion.statusCode).toStrictEqual(403);
  });
});

// When all tests are run clear the data
clear();

import request from 'sync-request-curl';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// Clears any lingering data elements before each test group
// eliminates any unexpected bugs.
function requestAdminQuizList ( authUserId: number ) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/list',
    {
      qs: {}
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  }
}

function requestAdminQuizCreate (authUserId: number, name: string, description: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    {
      json: {
        authUserId,
        name,
        description,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  }
}
function requestAdminQuizInfo (authUserId: number, quizId: number ) {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}`,
    {
      qs: {}
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  }
}
function requestAdminQuizRemove (authUserId: number, quizId: number ) {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId}`,
    {
      qs: {}
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  }
}
function requestAdminQuizNameUpdate (authUserId: number, quizId: number, name: string) {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/name`,
    {
      json: {
        name,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  }
}
function requestAdminQuizDescriptionUpdate (authUserId: number, quizId: number, description: string) {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/description`,
    {
      json: {
        description,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  }
}
beforeEach(() => {          
  clear();
});

enum validDetails {
  EMAIL = 'helloworld@gmail.com',
  PASSWORD = '1234UNSW',
  NAMEFIRST = 'Jack',
  NAMELAST = 'Rizzella',
  EMAIL2 = 'helloworld@gmail.com',
  PASSWORD2 = '4321UNSW',
  NAMEFIRST2 = 'Jamie',
  NAMELAST2 = 'Oliver',
  QUIZNAME = 'World Quiz',
  QUIZDESCRIPTION = 'About flags, countries and capitals!',
  QUIZNAME2 = 'Soccer Quiz',
  QUIZDESCRIPTION2 = 'GOOOAAAALLLL (Part 2)'
}
describe('Tests for adminQuizList', () => {
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
  
  test('Invalid authUserId', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizList(user.authUserId + 1)).toStrictEqual({error: expect.any(String)}); // 'authUserId is not a valid Id'
    expect(result.statusCode).toStrictEqual(400);
  });

  test('No quiz created by a user', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    expect(adminQuizList(user.authUserId)).toStrictEqual({quizzes: []}); // 'This user doesn't own any quizzes.' (Return empty array)
    expect(result.statusCode).toStrictEqual(200);
  })

  test('Successful output of quizzes owned by a User', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);

    expect(adminQuizList(user.authUserId)).toStrictEqual(
    { quizzes: [
      {
        quizId: quiz.quizId,
        name: expect.any(String),
      }
    ]
    });
    expect(result.statusCode).toStrictEqual(200);
  });

  test('Multiple quizzes created and a list of multiple quizzes outputted', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz1 = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    const quiz2 = adminQuizCreate(user.authUserId, validDetails.QUIZNAME2, validDetails.QUIZDESCRIPITON2);

    expect(adminQuizList(user.authUserId)).toStrictEqual(
      { quizzes: [
        {
          quizId: quiz1.quizId,
          name: expect.any(String),
        }, 
        {
          quizId: quiz2.quizId,
          name: expect.any(String),
        },
      ]
    });
    expect(result.statusCode).toStrictEqual(200);
  });

  test('Non quiz owner -> no list, quiz owner -> gives list', () => {
    const user1 = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = adminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = adminQuizCreate(user1.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);

    expect(adminQuizList(user2.authUserId)).toStrictEqual({quizzes: []}) // 'This user doesn't own any quizzes'

    expect(adminQuizList(user1.authUserId)).toStrictEqual(
      { quizzes: [
        {
          quizId: quiz.quizId,
          name: expect.any(String),
        }
      ]
    });
    expect(result.statusCode).toStrictEqual(200);
  });
});

describe('Tests for adminQuizCreate', () => {

    // Clear the database, and then make an user so that we can generate quizzes.
    
    beforeEach(() => {
      clear();  
           
    });
    test('Successful Quiz Created', () => {
      // user = {authUserId: number}
      const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST); 
      expect(adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON)).toStrictEqual({quizId: expect.any(Number)});
      expect(result.statusCode).toStrictEqual(200);
    })

	test('Contains Symbol', () => {
		expect(adminQuizCreate(user.authUserId, 'hell o1!', validDetails.QUIZDESCRIPITON)).toStrictEqual({error: expect.any(String)}); // 'Invalid Characters'
    expect(result.statusCode).toStrictEqual(400);
	});
	test('Less Than 3 Characters', () => {
		expect(adminQuizCreate(user.authUserId, 'h1', validDetails.QUIZDESCRIPITON)).toStrictEqual({error: expect.any(String)}); // 'Name Too Short'
    expect(result.statusCode).toStrictEqual(400);
	});
	test('More Than 30 Characters', () => {
		expect(adminQuizCreate(user.authUserId, 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhh1', validDetails.QUIZDESCRIPITON)).toStrictEqual({error: expect.any(String)}); // 'Name Too Long'
    expect(result.statusCode).toStrictEqual(400);
	});
	test('Existing Quiz', () => {
		//	Quiz with the same name has already been
		//	created by the user which mean this assumes
		//	a quiz already exists
    adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
		expect(adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON)).toStrictEqual({error: expect.any(String)}); // Existing Quiz
    expect(result.statusCode).toStrictEqual(400);
	});
	test('authUserId not valid', () => {
		//using 2 for now since the return for authUserId is currently 1
		expect(adminQuizCreate(user.authUserId + 1, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON)).toStrictEqual({error: expect.any(String)}); // Invalid User
    expect(result.statusCode).toStrictEqual(400);
	});
	test('Description is More than 100 Characters', () => {
		//using 2 for now since the return for authUserId is currently 1
		expect(adminQuizCreate(user.authUserId, validDetails.QUIZNAME, "This description is to be really long" +
		"and even longer than 100 characters which I don't really know how to do")).toStrictEqual({error: expect.any(String)}); // Description Too Long
    expect(result.statusCode).toStrictEqual(400);
	});
});

describe('Tests for adminQuizRemove', () => {
  beforeEach(() => {
    clear();
    const user1 = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = adminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = adminQuizCreate(user1.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
  });
  
  test('Invalid User ID.', () => {
    expect(adminQuizRemove(10, quiz.quizId)).toStrictEqual({error: expect.any(String)});
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Invalid quiz ID.', () => {
    expect(adminQuizRemove(user1.authUserId, 10)).toStrictEqual({error: expect.any(String)});
    expect(result.statusCode).toStrictEqual(400);
  });

  test('User does not own quiz.', () => {
    expect(adminQuizRemove(user2.authUserId, quiz.quizId)).toStrictEqual({error: expect.any(String)});
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Correct parameters given.', () => {
    expect(adminQuizRemove(user1.authUserId, quiz.quizId)).toStrictEqual({});
    expect(result.statusCode).toStrictEqual(200);
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

  test('Invalid authUserId', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizInfo(user.authUserId + 1, quiz.quizId)).toStrictEqual({error: expect.any(String)}); // 'authUserId is not a valid Id'
    expect(result.statusCode).toStrictEqual(400);
  });

  test('User is accessing a quiz that doesnt exit', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizInfo(user.authUserId, quiz.quizId + 1)).toStrictEqual({error: expect.any(String)}); // 'Quiz does not exist'
    expect(result.statusCode).toStrictEqual(400);
  });

  test('User is accessing a quiz that the user does not own', () => {
    const user1 = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = adminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = adminQuizCreate(user1.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizInfo(user2.authUserId, quiz.quizId)).toStrictEqual({error: expect.any(String)}); // 'Quiz is not owned by user'
    expect(result.statusCode).toStrictEqual(400);
  });
  
  test('Successful retrival of quiz info', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);

    expect(adminQuizInfo(user.authUserId, quiz.quizId)).toStrictEqual(
      {
        quizId: quiz.quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
      }
    );
    expect(result.statusCode).toStrictEqual(200);
  });

  test('Multiple quizzes created and info checked', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz1 = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    const quiz2 = adminQuizCreate(user.authUserId, validDetails.QUIZNAME2, validDetails.QUIZDESCRIPITON2);

    expect(adminQuizInfo(user.authUserId, quiz1.quizId)).toStrictEqual(
      {
        quizId: quiz1.quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
      }
    );
    expect(adminQuizInfo(user.authUserId, quiz2.quizId)).toStrictEqual(
      {
        quizId: quiz2.quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
      }
    );
    expect(result.statusCode).toStrictEqual(200);
  });
});


describe('Tests for adminQuizNameUpdate', () => {
  // Clear and create a valid quiz and user for the test to apply adminQuizNameUpdate
  beforeEach(() => {
    clear();
  });

  test('Sucessfully updated quiz name', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'Valid Name')).toStrictEqual({}); // Returns {} on success
    expect(result.statusCode).toStrictEqual(200);
  })

  test('Invalid AuthUserID', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizNameUpdate(user.authUserId + 1, quiz.quizId, 'Valid Name')).toStrictEqual({error: expect.any(String)}); // authUserId isnt valid
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Given QuizID does not match a valid quiz', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizNameUpdate(user.authUserId, quiz.quizId + 1, 'Valid Name')).toStrictEqual({error: expect.any(String)}); // No matching QuizID
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Given QuizID is not owned by user', () => {
    const user1 = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = adminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = adminQuizCreate(user1.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizNameUpdate(user2.authUserId)).toStrictEqual({error: expect.any(String)}) // User2 does not own the quiz 
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Name contains invalid characters', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'Inval!d Name')).toStrictEqual({error: expect.any(String)}); // Updated quiz name contains symbols
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Name is Less than 3 characters', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'to')).toStrictEqual({error: expect.any(String)}); // Updated quiz name is too short (<3)
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Name is More than 30 characters', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'theGivenUpdatedNameIsWayTooLong')).toStrictEqual({error: expect.any(String)}); // Updated name is too long (>30)
    expect(result.statusCode).toStrictEqual(400);
  });
  test('Name is already used by current logged in user for another quiz', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz1 = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    const quiz2 = adminQuizCreate(user.authUserId, validDetails.QUIZNAME2, validDetails.QUIZDESCRIPITON2);
    expect(adminQuizNameUpdate(user.authUserId, quiz2.quizId, 'PC games quiz')).toStrictEqual({error: expect.any(String)}); // User already owns a quiz with the provided name
    expect(result.statusCode).toStrictEqual(400);
  });
});

describe('Tests for adminQuizDescriptionUpdate', () => {
  // Clear and create a valid quiz and user for the test to apply adminQuizDescriptionUpdate
  beforeEach(() => {
    clear();
  });

  test('Sucessfully updated quiz description', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, 'Valid Description')).toStrictEqual({}); // Returns {} on success
    expect(result.statusCode).toStrictEqual(200);
  })

  test('Invalid AuthUserID', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizDescriptionUpdate(user.authUserId + 1, quiz.quizId, 'Valid Description')).toStrictEqual({error: expect.any(String)}); // authUserId isnt valid
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Given QuizID does not match a valid quiz', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId + 1, 'Valid Name')).toStrictEqual({error: expect.any(String)}); // No matching QuizID
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Given QuizID is not owned by user', () => {
    const user1 = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const user2 = adminAuthRegister(validDetails.EMAIL2, validDetails.PASSWORD2, validDetails.NAMEFIRST2, validDetails.NAMELAST2);
    const quiz = adminQuizCreate(user1.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizDescriptionUpdate(user2.authUserId)).toStrictEqual({error: expect.any(String)}) // User2 does not own the quiz 
    expect(result.statusCode).toStrictEqual(400);
  });

  test('Name is More than 100 characters', () => {
    const user = adminAuthRegister(validDetails.EMAIL, validDetails.PASSWORD, validDetails.NAMEFIRST, validDetails.NAMELAST);
    const quiz = adminQuizCreate(user.authUserId, validDetails.QUIZNAME, validDetails.QUIZDESCRIPITON);
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, 'theGivenUpdatedNameIsWaaaaaaaaaaaaaaaaaaaaaaayTooLong'
    + 'RanOutOfThingsToTypeSoHereIGoOnRambling' + 'ReallyHopeThisIsEnough')).toStrictEqual({error: expect.any(String)}); // Updated quiz description is too long (>100)
    expect(result.statusCode).toStrictEqual(400);
  });

});
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
} from './auth.js';

import {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
} from './quiz.js';

import {
  clear,
} from './other.js'

// Clears any lingering data elements before each test group
// eliminates any unexpected bugs.
beforeEach(() => {          
  clear();
});


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
   * Return Object
   * { quizzes: [
   *  { quizId,
   *    name,
   *  }
   *  ]
   * }
   */
  
  test('Invalid authUserId', () => {
    const user = adminAuthRegister('helloworld@gmail.com', '1234UNSW', 'Jack', 'Rizzella');
    const quiz = adminQuizCreate(user.authUserId, 'World Quiz', 'About flags, countries and capitals!');
    expect(adminQuizList(user.authUserId + 1)).toStrictEqual({error: expect.any(String)}); // 'authUserId is not a valid Id'
  });

  test('No quiz created by a user', () => {
    const user = adminAuthRegister('helloworld@gmail.com', '1234UNSW', 'Jack', 'Rizzella');
    expect(adminQuizList(user.authUserId)).toStrictEqual({quizzes: []}); // 'This user doesn't own any quizzes.' (Return empty array)
  })

  test('Successful output of quizzes owned by a User', () => {
    const user = adminAuthRegister('helloworld@gmail.com', '1234UNSW', 'Jack', 'Rizzella');
    const quiz = adminQuizCreate(user.authUserId, 'World Quiz', 'About flags, countries and capitals!');

    expect(adminQuizList(user.authUserId)).toStrictEqual(
    { quizzes: [
      {
        quizId: quiz.quizId,
        name: expect.any(String),
      }
    ]
    });
  });

  test('Multiple quizzes created and a list of multiple quizzes outputted', () => {
    const user = adminAuthRegister('helloworld@gmail.com', '1234UNSW', 'Jack', 'Rizzella');
    const quiz1 = adminQuizCreate(user.authUserId, 'Football Quiz', 'GOOOAAAALLLL');
    const quiz2 = adminQuizCreate(user.authUserId, 'Soccer Quiz', 'GOOOAAAALLLL (Part 2)');

    expect(adminQuizList(user.authUserId)).toStrictEqual(
      { quizzes: [
        {
          quizId: quiz1.quizId,
          name: quiz1.name
        }, 
        {
          quizId: quiz2.quizId,
          name: quiz2.quizname
        },
      ]
    });
  });

  test('Non quiz owner -> no list, quiz owner -> gives list', () => {
    const user1 = adminAuthRegister('someonenamedjames@gmail.com', '1234UNSW', 'James', 'Toually');
    const user2 = adminAuthRegister('someonenamedjill@gmail.com', 'NOTPASSWORD1234', 'Jill', 'Toually');
    const quiz = adminQuizCreate(user1.authUserId, 'Baby Names', 'Top 10 baby names for girls');

    expect(adminQuizList(user2.authUserId)).toStrictEqual({error: expect.any(String)}) // 'This user doesn't own any quizzes'

    expect(adminQuizList(user1.authUserId)).toStrictEqual(
      { quizzes: [
        {
          quizId: quiz.quizId,
          name: expect.any(String),
        }
      ]
    });
  });
});

describe('Tests for adminQuizCreate', () => {

    // Clear the database, and then make an user so that we can generate quizzes.
    beforeEach(() => {
      clear();  
      const user = adminAuthRegister('hello@gmail.com', '1234UNSW', 'jimmy', 'conner');      
    });
    test('Successful Quiz Created', () => {
      // user = {authUserId: number}
      expect(adminQuizCreate(user.authUserId, 'The Perfect Quiz 1', 'The Perfect Description')).toStrictEqual({quizId: expect.any(number)});
    })

	test('Contains Symbol', () => {
		expect(adminQuizCreate(user.authUserId, 'hell o1!', 'description')).toStrictEqual({error: expect.any(String)}); // 'Invalid Characters'
	});
	test('Less Than 3 Characters', () => {
		expect(adminQuizCreate(user.authUserId, 'h1', 'description')).toStrictEqual({error: expect.any(String)}); // 'Name Too Short'
	});
	test('More Than 30 Characters', () => {
		expect(adminQuizCreate(user.authUserId, 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhh1', 
		'description')).toStrictEqual({error: expect.any(String)}); // 'Name Too Long'
	});
	test('Existing Quiz', () => {
		//	Quiz with the same name has already been
		//	created by the user which mean this assumes
		//	a quiz already exists
		expect(adminQuizCreate(user.authUserId, 'The Perfect Quiz 3', 'description')).toStrictEqual({error: expect.any(String)}); // Existing Quiz
	});
	test('authUserId not valid', () => {
		//using 2 for now since the return for authUserId is currently 1
		expect(adminQuizCreate(user.authUserId + 1, 'The Perfect Quiz 2', 'description')).toStrictEqual({error: expect.any(String)}); // Invalid User
	});
	test('Description is More than 100 Characters', () => {
		//using 2 for now since the return for authUserId is currently 1
		expect(adminQuizCreate(user.authUserId, 'The Perfect Quiz 2', "This description is to be really long" +
		"and even longer than 100 characters which I don't really know how to do")).toStrictEqual({error: expect.any(String)}); // Description Too Long
	});
});

describe('Tests for adminQuizRemove', () => {

});

describe('Tests for adminQuizInfo', () => {
  /**
   * 1. [x] 2. [x] 3. [x] 4. [x] 5. []
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
    const user = adminAuthRegister('helloworld@gmail.com', '1234UNSW', 'Jack', 'Rizzella');
    const quiz = adminQuizCreate(user.authUserId, 'World Quiz', 'About flags, countries and capitals!');
    expect(adminQuizInfo(user.authUserId + 1, quiz.quizId)).toStrictEqual({error: expect.any(String)}); // 'authUserId is not a valid Id'
  });

  test('User is accessing a quiz that doesnt exit', () => {
    const user = adminAuthRegister('helloworld@gmail.com', '1234UNSW', 'Jack', 'Rizzella');
    const quiz = adminQuizCreate(user.authUserId, 'World Quiz', 'About flags, countries and capitals!');
    expect(adminQuizInfo(user.authUserId, quiz.quizId + 1)).toStrictEqual({error: expect.any(String)}); // 'Quiz does not exist'
  });

  test('User is accessing a quiz that the user does not own', () => {
    const user1 = adminAuthRegister('helloworld@gmail.com', '1234UNSW', 'Jack', 'Rizzella');
    const user2 = adminAuthRegister('someonenamedjill@gmail.com', 'NOTPASSWORD1234', 'Jill', 'Toually');
    const quiz = adminQuizCreate(user1.authUserId, 'World Quiz', 'About flags, countries and capitals!');
    expect(adminQuizInfo(user2.authUserId, quiz.quizId)).toStrictEqual({error: expect.any(String)}); // 'Quiz is not owned by user'
  });
  
  test('Successful retrival of quiz info', () => {
    const user = adminAuthRegister('helloworld@gmail.com', '1234UNSW', 'Jack', 'Rizzella');
    const quiz = adminQuizCreate(user.authUserId, 'World Quiz', 'About flags, countries and capitals!');

    expect(adminQuizInfo(user.authUserId, quiz.quizId)).toStrictEqual(
      {
        quizId: quiz.quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
      }
    );
  });

  test('Multiple quizzes created and info checked', () => {
    const user = adminAuthRegister('helloworld@gmail.com', '1234UNSW', 'Jack', 'Rizzella');
    const quiz1 = adminQuizCreate(user.authUserId, 'Football Quiz', 'GOOOAAAALLLL');
    const quiz2 = adminQuizCreate(user.authUserId, 'Soccer Quiz', 'GOOOAAAALLLL (Part 2)');

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
  });
});


describe('Tests for adminQuizNameUpdate', () => {
  // Clear and create a valid quiz and user for the test to apply adminQuizNameUpdate
  beforeEach(() => {
    clear();
    const user = adminAuthRegister('valid@gmail.com', 'validPassword1', 'Tyler', 'One');
    const quiz = adminQuizCreate(user.authUserId, 'PC games quiz', 'FPS games only');
  });

  test('Sucessfully updated quiz name', () => {
    expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'Valid Name')).toStrictEqual({}); // Returns {} on success
  })

  test('Invalid AuthUserID', () => {
    expect(adminQuizNameUpdate(user.authUserId + 1, quiz.quizId, 'Valid Name')).toStrictEqual({error: expect.any(String)}); // authUserId isnt valid
  });

  test('Given QuizID does not match a valid quiz', () => {
    expect(adminQuizNameUpdate(user.authUserId, quiz.quizId + 1, 'Valid Name')).toStrictEqual({error: expect.any(String)}); // No matching QuizID
  });

  test('Given QuizID is not owned by user', () => {
    const user2 = adminAuthRegister('doesntownquiz@gmail.com', 'returnerror2', 'John', 'Smith');
    expect(adminQuizNameUpdate(user2.authUserId)).toStrictEqual({error: expect.any(String)}) // User2 does not own the quiz 
  });

  test('Name contains invalid characters', () => {
    expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'Inval!d Name')),toStrictEqual({error: expect.any(String)}); // Updated quiz name contains symbols
  });

  test('Name is Less than 3 characters', () => {
    expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'to')),toStrictEqual({error: expect.any(String)}); // Updated quiz name is too short (<3)
  });
  test('Name is More than 30 characters', () => {
    expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'theGivenUpdatedNameIsWaayTooLong')),toStrictEqual({error: expect.any(String)}); // Updated quiz name is too long (>30)
  });
  test('Name is already used by current logged in user for another quiz', () => {
    const quiz2 = adminQuizCreate(user.authUserId, 'Soccer quiz', 'SUIII');
    expect(adminQuizNameUpdate(user.authUserId, quiz.quizId, 'Soccer quiz')),toStrictEqual({error: expect.any(String)}); // User already owns a quiz with the provided name
  });
});


describe('Tests for adminQuizDescriptionUpdate', () => {
  // Clear and create a valid quiz and user for the test to apply adminQuizNameUpdate
  beforeEach(() => {
    clear();
    const user = adminAuthRegister('valid@gmail.com', 'validPassword1', 'Tyler', 'One');
    const quiz = adminQuizCreate(user.authUserId, 'PC games quiz', 'FPS games only');
  });

  test('Sucessfully updated quiz description', () => {
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, 'Valid Description')).toStrictEqual({}); // Returns {} on success
  })

  test('Invalid AuthUserID', () => {
    expect(adminQuizDescriptionUpdate(user.authUserId + 1, quiz.quizId, 'Valid Description')).toStrictEqual({error: expect.any(String)}); // authUserId isnt valid
  });

  test('Given QuizID does not match a valid quiz', () => {
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId + 1, 'Valid Name')).toStrictEqual({error: expect.any(String)}); // No matching QuizID
  });

  test('Given QuizID is not owned by user', () => {
    const user2 = adminAuthRegister('doesntownquiz@gmail.com', 'returnerror2', 'John', 'Smith');
    expect(adminQuizDescriptionUpdate(user2.authUserId)).toStrictEqual({error: expect.any(String)}) // User2 does not own the quiz 
  });

  test('Name is More than 100 characters', () => {
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, 'theGivenUpdatedNameIsWaaaaaaaaaaaaaaaaaaaaaaayTooLong'
    + 'RanOutOfThingsToTypeSoHereIGoOnRambling' + 'ReallyHopeThisIsEnough')).toStrictEqual({error: expect.any(String)}); // Updated quiz description is too long (>100)
  });

});
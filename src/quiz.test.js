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
     *            ERROR CASES
     * 1. Case where there is an invalid authUserId
     * i.e. create an authUserId + 1 (will always be invalid)
     * 
     *            SUCCESS CASES/MISC 
     * 2. Single quiz created, list generated after inputing quiz owner
     * 
     * 3. Case where multiple quizzes are created with the same Id
     * i.e. gives back a list of quizzes
     * 
     * 4. Case where multiple authUserId, create a quiz, then use
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
      expect(adminQuizCreate(user.authUserId, ''))

    })

	test('Contains Symbol', () => {
		expect(adminQuizCreate(1, 'hell o1!', 'description')).toStrictEqual({error: expect.any(String)}); // 'Invalid Characters'
	});
	test('Less Than 3 Characters', () => {
		expect(adminQuizCreate(1, 'h1', 'description')).toStrictEqual({error: 'Name Too Short'});
	});
	test('More Than 30 Characters', () => {
		expect(adminQuizCreate('1', 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhh1', 
		'description')).toStrictEqual({error: 'Name Too Long'});
	});
	test('Existing Quiz', () => {
		//	Quiz with the same name has already been
		//	created by the user which mean this assumes
		//	a quiz already exists
		expect(adminQuizCreate('1', 'The Perfect Quiz 3', 'description')).toStrictEqual({error: 'Existing Quiz'});
	});
	test('authUserId not valid', () => {
		//using 2 for now since the return for authUserId is currently 1
		expect(adminQuizCreate('2', 'The Perfect Quiz 2', 'description')).toStrictEqual({error: 'Invalid User'});
	});
	test('Description is More than 100 Characters', () => {
		//using 2 for now since the return for authUserId is currently 1
		expect(adminQuizCreate('1', 'The Perfect Quiz 2', "This description is to be really long" +
		"and even longer than 100 characters which I don't really know how to do")).toStrictEqual({error: 'Description Too Long'});
	});
});

describe('Tests for adminQuizRemove', () => {

});

describe('Tests for adminQuizInfo', () => {
  /**
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
     * 1. Create user and create quiz using userId, use the 
     * quiz owner to check info (match return object)
     * 
     * 2. Create user and multiple quizzes using userId, 
     * find info on first quiz, then second quiz.
     * 
     */

  test
});

describe('Tests for adminQuizNameUpdate', () => {

});

describe('Tests for adminQuizDescriptionUpdate', () => {

});
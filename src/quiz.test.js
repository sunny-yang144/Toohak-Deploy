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
     * 1. Case where there is an invalid academicId 
     * i.e. create an academicId + 1 (will always be invalid)
     * 
     * 2. 
     * 
     * 
     */

    test('Invalid authUserId', () => {
        const user
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
		expect(adminQuizCreate(1, 'hell o1!', 'description')).toStrictEqual({error: expect.any(String)}); // 'Invalid Characters'
	});
	test('Less Than 3 Characters', () => {
		expect(adminQuizCreate(1, 'h1', 'description')).toStrictEqual({error: expect.any(String)}); // 'Name Too Short'
	});
	test('More Than 30 Characters', () => {
		expect(adminQuizCreate('1', 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhh1', 
		'description')).toStrictEqual({error: expect.any(String)}); // 'Name Too Long'
	});
	test('Existing Quiz', () => {
		//	Quiz with the same name has already been
		//	created by the user which mean this assumes
		//	a quiz already exists
		expect(adminQuizCreate('1', 'The Perfect Quiz 3', 'description')).toStrictEqual({error: expect.any(String)}); // Existing Quiz
	});
	test('authUserId not valid', () => {
		//using 2 for now since the return for authUserId is currently 1
		expect(adminQuizCreate('2', 'The Perfect Quiz 2', 'description')).toStrictEqual({error: expect.any(String)}); // Invalid User
	});
	test('Description is More than 100 Characters', () => {
		//using 2 for now since the return for authUserId is currently 1
		expect(adminQuizCreate('1', 'The Perfect Quiz 2', "This description is to be really long" +
		"and even longer than 100 characters which I don't really know how to do")).toStrictEqual({error: expect.any(String)}); // Description Too Long
	});
});

describe('Tests for adminQuizRemove', () => {

});

describe('Tests for adminQuizInfo', () => {

});

describe('Tests for adminQuizNameUpdate', () => {

});

describe('Tests for adminQuizDescriptionUpdate', () => {

});
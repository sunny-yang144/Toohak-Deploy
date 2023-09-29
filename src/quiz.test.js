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
    
});

describe('Tests for adminQuizCreate', () => {
	test('Contains Symbol', () => {
		expect(adminQuizCreate('1', 'hell o1!', 'description')).toStrictEqual({error: 'Invalid Characters'});
	});
	test('Less Than 3 Characters', () => {
		expect(adminQuizCreate('1', 'h1', 'description')).toStrictEqual({error: 'Name Too Short'});
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

});
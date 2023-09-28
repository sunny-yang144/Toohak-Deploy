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

});

describe('Tests for adminQuizDescriptionUpdate', () => {

});
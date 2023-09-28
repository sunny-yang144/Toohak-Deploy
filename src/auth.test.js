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

// You could also structure this to have error cases
describe('Tests for adminAuthRegister', () => {
    /*test('REMOVE ME', () => {
        expect(somefunction(param1, param2, param3)).toStrictEqual(
            {error: this is not a test}
        );
    });
    */
});

describe('Tests for adminAuthLogin', () => {

});

describe('Tests for adminUserDetails', () => {

});


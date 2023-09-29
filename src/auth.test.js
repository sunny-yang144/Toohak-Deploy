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
  let email = 'admin@example.com';
  let password = 'Chickens123';
  test('Login Success', () => {expect(adminAuthLogin(email, password)).toStrictEqual(
    {authUserId: 1});
  });

  test('Email does not exist', () => {expect(adminAuthLogin('notareal@email.com', password)).toStrictEqual(
    {error: 'Error, the provided email does not exist.'});
  });

  test('Incorrect password.', () => {expect(adminAuthLogin(email, 'wrongpassword')).toStrictEqual(
    {error: 'Error, invalid credentials.'});
  });
});

describe('Tests for adminUserDetails', () => {

});


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

// Couple suggestions:
// Add a test where once data is erased many other functions wouldn't
// work since there is not Id reference
// Can also check if data is empty where data is stored in
// dataStore.js
describe('Tests for clear', () => {

  test('Successfully returns empty object', () => {
    expect(clear()).toStrictEqual({});
  });

  test('Sucessfully removes user', () => {
    const user = adminAuthRegister('RealEmail@gmail.com', 'GoodPassword123', 'Real', 'Name');
    clear();
    // Since an error occurs, user must have been removed
    expect(adminQuizList(user.userId)).toStrictEqual({ error: expect.any(String)});
  });

  test('Sucessfully removes quiz', () => {
    const user = adminAuthRegister('RealEmail@gmail.com', 'GoodPassword123', 'Real', 'Name');
    const quiz = adminQuizCreate(user.userId, 'I have atleast 5', '');
    clear();
    const user2 = adminAuthRegister('Another@gmail.com', 'GoodPassword123', 'AnotherReal', 'Name');
    // Since an error occurs, quiz must have been removed
    expect(adminQuizInfo(user2.userId, quiz.quizId)).toStrictEqual({ error: expect.any(String)});
  });
});


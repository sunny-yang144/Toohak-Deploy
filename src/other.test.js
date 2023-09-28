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

});


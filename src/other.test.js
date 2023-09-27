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

// Please think of how you actually want to implement this
// Will you create a global database then add elements and
// see if elements are removed?
describe('Tests for clear', () => {

});


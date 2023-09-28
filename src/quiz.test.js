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

});

describe('Tests for adminQuizRemove', () => {

});

describe('Tests for adminQuizInfo', () => {

});

describe('Tests for adminQuizNameUpdate', () => {

});

describe('Tests for adminQuizDescriptionUpdate', () => {

});
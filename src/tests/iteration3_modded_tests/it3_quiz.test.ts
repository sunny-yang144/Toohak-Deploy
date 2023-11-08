import {
    requestAdminAuthRegister,
    requestAdminQuizListV2,
    requestAdminQuizCreateV2,
    requestAdminQuizRemoveV2,
    requestAdminQuizInfoV2,
    requestAdminQuizNameUpdateV2,
    requestAdminQuizDescriptionUpdateV2,
    requestAdminQuizTrashV2,
    requestAdminQuizTrashRestoreV2,
    requestAdminTrashRemoveV2,
    requestAdminQuizTransferV2,
    requestAdminQuizQuestionCreateV2,
    requestAdminQuizQuestionUpdateV2,
    requestAdminQuizQuestionDeleteV2,
    requestAdminQuizQuestionMoveV2,
    requestAdminQuizQuestionDuplicateV2,
    clear,
  } from '../test-helpers';
  
  import { expect } from '@jest/globals';
  
  import { v4 as uuidv4 } from 'uuid';
  import HTTPError from 'http-errors';
  
  // import { colours } from '../../dataStore';
  
  import { QuestionBody } from '../../dataStore';
  
    enum validDetails {
      EMAIL = 'helloworld@gmail.com',
      PASSWORD = '1234UNSW',
      NAMEFIRST = 'Jack',
      NAMELAST = 'Rizzella',
      EMAIL2 = 'helloworld1@gmail.com',
      PASSWORD2 = '4321UNSW',
      NAMEFIRST2 = 'Jamie',
      NAMELAST2 = 'Oliver',
      QUIZNAME = 'World Quiz',
      QUIZDESCRIPTION = 'About flags, countries and capitals!',
      QUIZNAME2 = 'Soccer Quiz',
      QUIZDESCRIPTION2 = 'GOOOAAAALLLL (Part 2)',
      IMAGEURL = 'https://www.digiseller.ru/preview/859334/p1_3713459_42ca8c03.jpg'
    }
  
  const sampleQuestion1: QuestionBody = {
    question: 'Who is the Monarch of England?',
    duration: 4,
    points: 5,
    answers: [
      {
        answer: 'Prince Charles',
        correct: true
      },
      {
        answer: 'Queen Elizabeth',
        correct: true
      }
    ]
  };
  
  beforeEach(() => {
    clear();
  });
  
  afterAll(() => {
    clear();
  });
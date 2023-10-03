import { getData, setData } from './dataStore'
import { isAlphanumeric } from 'validator'

/**
 * Lists out all of the Quizzes a user owns
 * 
 * Gives an error when:
 * 1. AuthUserId is not a valid user
 *
 * @param {number} authUserId
 * @returns {{ quizzes: 
 *      Array<{
 *        quizId: number,
 *        name: string
 *      }>
 * }} | errorMessage
 */

export function adminQuizList ( authUserId ) {
  let data = getData;
  // Check whether authUsedId is valid
  if (!data.users.some(user => user.UserId === authUserId)) {
    return { error: 'The user ID ${authUserId} is invalid!' };
  };
  // Find user with the inputted Id
  const user = data.users.find(user => user.UserId === authUserId);
  const quizzes = [];
  // Iterate through users quizzes and add their information to an array
  for (let quizId of user.ownedQuizzes) {
    const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
    // The "quiz" object that will go into the quizzes array
    const quizObject = {
      quizId: quiz.quizId,
      name: quiz.name
    };
    // Add this object to the quizzes array
    quizzes.push(quizObject);
  }
  return { quizzes: quizzes };
}

export function adminQuizCreate ( authUserId, name, description ) {
  return {
    quizId: 2
  }
}

export function adminQuizInfo ( authUserId, quizId ) {
  return quizInfo;
}

export function adminQuizRemove ( authUserId, quizId ) {
  return {};
}

/**
 * Updates the name of a quiz
 * 
 * Helper functions:
 * 1. isAlphanumericWithSpaces()
 *    Used to check if name uses valid characters.
 * 
 * Gives an error when:
 * 1. AuthUserId is not a valid user
 * 2. Quiz ID does not refer to a valid quiz
 * 3. Quiz ID does not refer to a quiz that this user owns
 * 4. Name contains invalid characters. Valid characters are alphanumeric and spaces
 * 5. Name is either less than 3 characters long or more than 30 characters long
 * 6. Name is already used by the current logged in user for another quiz
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} name
 * @returns {{}} | errorMessage
 */

export function adminQuizNameUpdate ( authUserId, quizId, name ) {
  let data = getData();

  if (!data.users.some(user => user.UserId === authUserId)) {
    return { error: 'The user ID ${authUserId} is invalid!' };
  };
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: 'The quiz Id ${quizId} is invalid!'};
  };
  if (!data.users.ownedQuizzes.includes(quizId)) {
    return { error: 'This quiz ${quizId} is not owned by this User!'};
  };
  if (!isAlphanumericWithSpaces(name)) {
    return { error: 'The name ${name} contains invalid characters'};
  };
  if (name.length < 3) {
    return { error: 'The name ${name} is too short (>2).' };
  };
  if (name.length > 30) {
    return { error: 'The name ${name} is too long (<30).' };
  };
  if (data.quizzes.some(quiz => quiz.quizName === name)) {
    return { error: '${name} is already used by another quiz! '}
  };

  // goto the quiz object with matching id, and change name.
  let editedQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  editedQuiz.quizName = name;
  setData(data);
  return {};
}


/**
 * Updates the description of a quiz
 * 
 * Gives an error when:
 * 1. AuthUserId is not a valid user
 * 2. Quiz ID does not refer to a valid quiz
 * 3. Quiz ID does not refer to a quiz that this user owns
 * 4. Description is more than 100 characters in length (note: empty strings are OK)
 * 
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} name
 * @returns {{}} | errorMessage
 */

export function adminQuizDescriptionUpdate ( authUserId, quizId, description ) {
  let data = getData();

  if (!data.users.some(user => user.UserId === authUserId)) {
    return { error: 'The user ID ${authUserId} is invalid!' };
  };
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: 'The quiz Id ${quizId} is invalid!'};
  };
  if (!data.users.ownedQuizzes.includes(quizId)) {
    return { error: 'This quiz ${quizId} is not owned by this User!'};
  };
  if (data.length > 100) {
    return { error: 'Description is too long (<100)!'};
  }
  // goto the quiz object with matching id, and change description.
  let editedQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  editedQuiz.description = description;
  setData(data);
  return {};
}

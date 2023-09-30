import { getData, setData } from './dataStore'
import { isAlphanumeric } from 'validator'

export function adminQuizList ( authUserId ) {
  return { quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
      }
    ]
  }
}

export function adminQuizCreate ( authUserId, name, description ) {
  return {
    quizId: 2
  }
}

export function adminQuizInfo ( authUserId, quizId ) {
  return {
    quizId: 1,
    name: 'My Quiz',
    timeCreated: 1683125870,
    timeLastEdited: 1683125871,
    description: 'This is my quiz',
  }
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

import { getData, setData } from './dataStore.js'


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
  let data = getData();
  // Find user with the inputted Id
  const user = data.users.find(user => user.userId === authUserId);
  // Check whether authUsedId is valid
  if (!user) {
    return { error: `The user ID ${authUserId} is invalid!` };
  };
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
  let data = getData();
  let user = data.users.find(user => user.userId === authUserId)
  // Check whether authUsedId is valid
  if (!user) {
    return { error: `The user ID ${authUserId} is invalid!` };
  };
  // Checks for invalid characters
  if (!isAlphanumericWithSpaces(name)) {
    return { error: `The quiz name ${name} contains invalid characters.` };
  }
  // Check if name is less than 3 characters long, or more than 30
  // characters long
  if (name.length < 3 || name.length > 30) {
    return { error: `The quiz name ${name} is of invalid length.` };
  }
  // Check if the quiz name is already used by the current logged in user for
  // another quiz
  if (data.quizzes.find(quiz => quiz.ownerId === authUserId && quiz.name === name)) {
    return { error: `User ID ${authUserId} already has quiz with name: ${name}` };
  }
  // Check if description length is more than 100 characters
  if (description.length > 100) {
    return { error: `Description is more than 100 characters.` };
  }

  // Add new quiz
  let newQuiz = { 
    quizId: data.quizzes.length,
    ownerId: authUserId,
    name: name,
    description: description
  };

  user.ownedQuizzes.push(newQuiz.quizId)

  data.quizzes.push(newQuiz);
  setData(data);
  return {
    quizId: newQuiz.quizId
  };
}

/**
 * Shows information relating to a specific quiz
 * 
 * Gives an error when:
 * 1. AuthUserId is not a valid user
 * 2. Quiz ID does not refer to a valid quiz
 * 3. Quiz ID does not refer to a quiz that this user owns
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {{
*   quizId: number,
*   name: string,
*   timeCreated: number,
*   timeLastEdited: number,
*   description: string
* }} | errorMessage
*/
export function adminQuizInfo ( authUserId, quizId ) {
  let data = getData();
  // Check whether authUsedId is valid
  if (!data.users.some(user => user.userId === authUserId)) {
    return { error: `The user ID ${authUserId} is invalid!` };
  };
  // Check whether quiz with quizId exists
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `The quiz Id ${quizId} is invalid!`};
  };
  // Check whether quiz with quizId is owned by user with authUserId
  if (!data.users.ownedQuizzes.includes(quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`};
  };
  // Find quiz with the inputted Id
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const quizInfo = {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
  }
  return quizInfo;
}
/*
  Permanently remove quiz given a quizId
  Returns error if:
    - AuthUserId is not valid
    - QuizId does not refer to a valid quiz
    - QuizId does not refer to a quiz the user owns
*/
export function adminQuizRemove ( authUserId, quizId ) {
  let data = getData();

  // Find given user
  const user = data.users.find(userFind => userFind.userId === authUserId);
  // Error, no authUserId found in users
  if (!user) {
    return { error: `Given authUserId ${authUserId} is not valid` }
  };
  // Error, no quizId found in quizzes
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    return { error: `Given quizId ${quizId} is not valid` }   
  };
  // Error, userId does not own quizId
  const ownQuiz = user.ownedQuizzes.find(ownQuiz => ownQuiz === quizId);
  if (!ownQuiz) {
    return { error: `Given authUserId ${authUserId} does not own quiz ${quizId}` }
  };
  // Success, remove quiz from array at index then return empty
  data.quizzes.splice(quizIndex, 1);
  setData(data);

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

  let user = data.users.find(user => user.userId === authUserId);

  if (!user) {
    return { error: `The user ID ${authUserId} is invalid!` };
  };
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `The quiz Id ${quizId} is invalid!`};
  };
  if (!user.ownedQuizzes.includes(quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`};
  };
  if (!isAlphanumericWithSpaces(name)) {
    return { error: `The name ${name} contains invalid characters`};
  };
  if (name.length < 3) {
    return { error: `The name ${name} is too short (>2).` };
  };
  if (name.length > 30) {
    return { error: `The name ${name} is too long (<30).` };
  };

  if (data.quizzes.find(quiz => quiz.ownerId === authUserId && quiz.name === name)) {
    return { error: `The name ${name} is already used by another quiz!` };
  };

  // goto the quiz object with matching id, and change name.
  let editedQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  editedQuiz.quizName = name;
  setData(data);
  return {};
}

/**
 * Checks if characters in the string are alphanumeric
 * or spaces
 * 
 * @param {string} str 
 * @returns {boolean}
 */
function isAlphanumericWithSpaces(str) {
  return /^[A-Za-z0-9\s]+$/.test(str);
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

  let user = data.users.find(user => user.userId === authUserId);

  if (!user) {
    return { error: `The user ID ${authUserId} is invalid!` };
  };  
  if (!data.quizzes.some(quiz => quiz.quizId === quizId)) {
    return { error: `The quiz Id ${quizId} is invalid!`};
  };
  if (!user.ownedQuizzes.includes(quizId)) {
    return { error: `This quiz ${quizId} is not owned by this User!`};
  };
  if (description.length > 100) {
    return { error: 'Description is too long (<100)!'};
  }

  // goto the quiz object with matching id, and change description.
  let editedQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  editedQuiz.description = description;
  setData(data);
  return {};
}

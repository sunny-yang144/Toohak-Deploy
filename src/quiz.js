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

export function adminQuizNameUpdate ( authUserId, quizId, name ) {
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

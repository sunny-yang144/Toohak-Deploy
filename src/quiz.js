
function adminQuizList ( authUserId ) {
    return { quizzes: [
        {
          quizId: 1,
          name: 'My Quiz',
        }
      ]
    }
}

function adminQuizCreate ( authUserId, name, description ) {
  return {
    quizId: 2
  }
}

function adminQuizInfo ( authUserId, quizId ) {
    return {
      quizId: 1,
      name: 'My Quiz',
      timeCreated: 1683125870,
      timeLastEdited: 1683125871,
      description: 'This is my quiz',
    }
}

function adminQuizRemove ( authUserId, quizId ) {
  return {};
}

function adminQuizNameUpdate ( authUserId, quizId, name ) {
  return {};
}

function adminQuizDescriptionUpdate (authUserId, quizId, description) {
    return {};
}
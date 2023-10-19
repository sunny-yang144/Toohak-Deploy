// Do not delete this file
function echo(value) {
  if (value.echo && value.echo === 'echo') {
    // Return a descriptive error message for easy debugging
    return { error: 'Cannot echo an object with the property \'echo\'.', statusCode: 400 };
  }
  return value;
}

export { echo };

console.log({
  "users": [
    {
      "userId": 0,
      "email": "helloworld@gmail.com",
      "nameFirst": "Jack",
      "nameLast": "Rizzella",
      "password": "1234UNSW",
      "numSuccessfulLogins": 0,
      "numFailedPasswordsSinceLastLogin": 0,
      "ownedQuizzes": [],
      "tokens": [
        {
          "sessionId": 0,
          "userId": 0
        }
      ]
    }
  ],
  "quizzes": [],
  "tokens": [
    {
      "sessionId": 0,
      "userId": 0
    }
  ]
});
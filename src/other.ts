import { setData, getData, Token, User, DataStore } from './dataStore'

export function clear (): Record<string, never> {
  setData({
    users: [],
    tokens: [],
  });
  return {}
}

/**
 * @param { Token[] } idArray
 * 
 * Takes in an array, finds the highest SessionId then returns a number higher 
 * than all current sessionId in the dataStore
 * 
 * @returns { Number } Max + 1
 */
export function generateId (idArray: Token[]) {
  if (idArray.length === 0) {
    return 0;
  }
  let max = idArray[0].sessionId;
  for (const token of idArray) {
    if (token.sessionId > max) {
      max = token.sessionId;
    }
  }
  return max + 1;
}

/**
 * 
 * @param { User } user 
 * Generates a sessionId, makes a new token and pushes it to the respective user,
 * then pushes to a tokens array with a reference to the user who owns the token.
 * 
 * @returns { Number } Token
 */
export function generateToken (user: User) {
  let data = getData();
  const sessionId = generateId(data.tokens);
  const token = {
    sessionId: sessionId,
    user: user,
  };
  user.tokens.push(token);
  data.tokens.push(token);
  setData(data);
  return token;
}
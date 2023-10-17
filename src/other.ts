import { setData, Token, User, DataStore } from './dataStore'

export function clear (): Record<string, never> {
  setData({
    users: [],
    tokens: [],
  });
  return {}
}

function generateId (idArray: Token[]) {
  let max = idArray[0].sessionId;
  for (const token of idArray) {
    if (token.sessionId > max) {
      max = token.sessionId;
    }
  }
  return max + 1;
}

export function generateToken (data: DataStore, user: User) {
  const sessionId = generateId(data.tokens);
  const token = {
    sessionId: sessionId,
    user: user,
  };
  user.tokens.push(token);
  data.tokens.push(token);
  return token;
}
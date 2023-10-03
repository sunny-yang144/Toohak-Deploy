import { setData } from './dataStore.js'

export function clear () {
  setData({
    users: [],
    quizzes: [],
  });
  return {}
}
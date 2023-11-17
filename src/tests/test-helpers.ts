import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from '../config.json';
import { QuestionBody, actions } from '../dataStore';
const SERVER_URL = `${url}:${port}`;
import HTTPError from 'http-errors';
import { IncomingHttpHeaders } from 'http';

const TIMEOUT_MS = 10000;

interface Payload {
  [key: string]: unknown;
}

const requestHelperOld = (
  method: HttpVerb,
  path: string,
  payload: Payload,
  headers: IncomingHttpHeaders = {}
) => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method.toUpperCase())) {
    qs = payload;
  } else {
    json = payload;
  }
  const url = SERVER_URL + path;
  const res = request(method, url, { qs, json, headers, timeout: TIMEOUT_MS });
  const responseBody = JSON.parse(res.body.toString());

  return {
    body: responseBody,
    statusCode: res.statusCode
  };
};

export function clear() {
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/clear',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
    }
  );
  return JSON.parse(res.body.toString());
}

export function requestAdminAuthRegister (email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelperOld('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast }, {});
}

export function requestAdminAuthLogin (email: string, password: string) {
  return requestHelperOld('POST', '/v1/admin/auth/login', { email, password }, {});
}

export function requestAdminUserDetails (token: string) {
  return requestHelperOld('GET', '/v1/admin/user/details', { token }, {});
}

export function requestAdminQuizList (token: string) {
  return requestHelperOld('GET', '/v1/admin/quiz/list', { token }, {});
}

export function requestAdminQuizCreate (token: string, name: string, description: string) {
  return requestHelperOld('POST', '/v1/admin/quiz', { token, name, description }, {});
}

export function requestAdminQuizInfo (token: string, quizId: number) {
  return requestHelperOld('GET', `/v1/admin/quiz/${quizId}`, { token }, {});
}

export function requestAdminQuizRemove (token: string, quizId: number) {
  return requestHelperOld('DELETE', `/v1/admin/quiz/${quizId}`, { token }, {});
}

export function requestAdminQuizNameUpdate (token: string, quizId: number, name: string) {
  return requestHelperOld('PUT', `/v1/admin/quiz/${quizId}/name`, { token, name }, {});
}

export function requestAdminQuizDescriptionUpdate (token: string, quizId: number, description: string) {
  return requestHelperOld('PUT', `/v1/admin/quiz/${quizId}/description`, { token, description }, {});
}
/// /////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////     ITERATION 2      //////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////

export function requestAdminAuthLogout (token: string) {
  return requestHelperOld('POST', '/v1/admin/auth/logout', { token }, {});
}

export function requestAdminUserDetailsUpdate (token: string, email: string, nameFirst: string, nameLast: string) {
  return requestHelperOld('PUT', '/v1/admin/user/details', { token, email, nameFirst, nameLast }, {});
}

export function requestAdminUserPasswordUpdate (token: string, oldPassword: string, newPassword: string) {
  return requestHelperOld('PUT', '/v1/admin/user/password', { token, oldPassword, newPassword }, {});
}

export function requestAdminQuizTransfer (token: string, userEmail: string, quizId: number) {
  return requestHelperOld('POST', `/v1/admin/quiz/${quizId}/transfer`, { token, userEmail }, {});
}

export function requestAdminQuizTrash (token: string) {
  return requestHelperOld('GET', '/v1/admin/quiz/trash', { token }, {});
}

export function requestAdminTrashRemove (token: string, quizIds: number[]) {
  return requestHelperOld('DELETE', '/v1/admin/quiz/trash/empty', { token, quizIds: JSON.stringify(quizIds) }, {});
}

export function requestAdminQuizQuestionCreate (quizId: number, token: string, questionBody: QuestionBody) {
  return requestHelperOld('POST', `/v1/admin/quiz/${quizId}/question`, { token, questionBody }, {});
}

export function requestAdminQuizQuestionDelete (quizId: number, questionId: number, token: string) {
  return requestHelperOld('DELETE', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token }, {});
}

export function requestAdminQuizQuestionMove (quizId: number, questionId: number, token: string, newPosition: number) {
  return requestHelperOld('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}/move`, { token, newPosition }, {});
}

export function requestAdminQuizQuestionDuplicate (quizId: number, questionId: number, token: string) {
  return requestHelperOld('POST', `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { token }, {});
}

export function requestAdminQuizTrashRestore (quizId: number, token: string) {
  return requestHelperOld('POST', `/v1/admin/quiz/${quizId}/restore`, { token }, {});
}

export function requestAdminQuizQuestionUpdate (quizId: number, questionId: number, token: string, questionBody: QuestionBody) {
  return requestHelperOld('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token, questionBody }, {});
}

/// /////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////     ITERATION 2      //////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////

export function requestAdminAuthLogoutV2 (token: string) {
  return requestHelper('POST', '/v2/admin/auth/logout', { }, { token });
}

export function requestAdminUserDetailsV2 (token: string) {
  return requestHelper('GET', '/v2/admin/user/details', { }, { token });
}

export function requestAdminUserDetailsUpdateV2 (token: string, email: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/v2/admin/user/details', { email, nameFirst, nameLast }, { token });
}

export function requestAdminUserPasswordUpdateV2 (token: string, oldPassword: string, newPassword: string) {
  return requestHelper('PUT', '/v2/admin/user/password', { oldPassword, newPassword }, { token });
}

export function requestAdminQuizListV2 (token: string) {
  return requestHelper('GET', '/v2/admin/quiz/list', {}, { token });
}

export function requestAdminQuizCreateV2 (token: string, name: string, description: string) {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });
}

export function requestAdminQuizRemoveV2 (token: string, quizId: number) {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}`, {}, { token });
}

export function requestAdminQuizInfoV2 (token: string, quizId: number) {
  return requestHelper('GET', `/v2/admin/quiz/${quizId}`, {}, { token });
}

export function requestAdminQuizNameUpdateV2 (token: string, quizId: number, name: string) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/name`, { name }, { token });
}

export function requestAdminQuizDescriptionUpdateV2 (token: string, quizId: number, description: string) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/description`, { description }, { token });
}

export function requestAdminQuizTrashV2 (token: string) {
  return requestHelper('GET', '/v2/admin/quiz/trash', {}, { token });
}

export function requestAdminQuizTrashRestoreV2 (quizId: number, token: string) {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/restore`, {}, { token });
}

export function requestAdminTrashRemoveV2 (token: string, quizIds: number[]) {
  return requestHelper('DELETE', '/v2/admin/quiz/trash/empty', { quizIds: JSON.stringify(quizIds) }, { token });
}

export function requestAdminQuizTransferV2 (token: string, userEmail: string, quizId: number) {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/transfer`, { userEmail }, { token });
}

export function requestAdminQuizQuestionCreateV2 (quizId: number, token: string, questionBody: QuestionBody) {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question`, { questionBody }, { token });
}

export function requestAdminQuizQuestionUpdateV2 (quizId: number, questionId: number, token: string, questionBody: QuestionBody) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/question/${questionId}`, { questionBody }, { token });
}

export function requestAdminQuizQuestionDeleteV2 (quizId: number, questionId: number, token: string) {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}/question/${questionId}`, {}, { token });
}

export function requestAdminQuizQuestionMoveV2 (quizId: number, questionId: number, token: string, newPosition: number) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/question/${questionId}/move`, { newPosition }, { token });
}

export function requestAdminQuizQuestionDuplicateV2 (quizId: number, questionId: number, token: string) {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, {}, { token });
}

/// /////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////     ITERATION 3      //////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////
// Used from lab08_quiz.
// type ResponseBody = Record<string, unknown>;
const requestHelper = (
  method: HttpVerb,
  path: string,
  payload: Payload,
  headers: IncomingHttpHeaders = {}
) => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method.toUpperCase())) {
    qs = payload;
  } else {
    json = payload;
  }

  const url = SERVER_URL + path;
  const res = request(method, url, { qs, json, headers, timeout: TIMEOUT_MS });

  let responseBody;
  try {
    responseBody = JSON.parse(res.body.toString());
  } catch (err: unknown) {
    if (res.statusCode === 200) {
      throw HTTPError(500,
        `Non-jsonifiable body despite code 200: '${res.body}'.\nCheck that you are not doing res.json(undefined) instead of res.json({}), e.g. in '/clear'`
      );
    }
    responseBody = { error: 'Failed to parse JSON' };
  }

  const errorMessage = `[${res.statusCode}] ` + responseBody?.error || responseBody || 'No message specified!';

  // NOTE: the error is rethrown in the test below. This is useful becasuse the
  // test suite will halt (stop) if there's an error, rather than carry on and
  // potentially failing on a different expect statement without useful outputs
  switch (res.statusCode) {
    case 400: // BAD_REQUEST
      throw HTTPError(res.statusCode, errorMessage);
    case 401: // UNAUTHORIZED
      throw HTTPError(res.statusCode, errorMessage);
    case 403:
      throw HTTPError(res.statusCode, errorMessage);
    case 404: // NOT_FOUND
      throw HTTPError(res.statusCode, `Cannot find '${url}' [${method}]\nReason: ${errorMessage}\n\nHint: Check that your server.ts have the correct path AND method`);
    case 500: // INTERNAL_SERVER_ERROR
      throw HTTPError(res.statusCode, errorMessage + '\n\nHint: Your server crashed. Check the server log!\n');
    default:
      if (res.statusCode !== 200) {
        throw HTTPError(res.statusCode, errorMessage + `\n\nSorry, no idea! Look up the status code ${res.statusCode} online!\n`);
      }
  }
  return {
    body: responseBody,
  };
};

export function requestUpdateQuizThumbNail (quizId: number, token: string, imgUrl: string) {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/thumbnail`, { imgUrl }, { token });
}

export function requestViewSessionActivity (quizId: number, token: string) {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/sessions`, {}, { token });
}

export function requestNewSessionQuiz (quizId: number, token: string, autoStartNum: number) {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/session/start`, { autoStartNum }, { token });
}

export function requestUpdateSessionState (quizId: number, sessionId: number, token: string, action: actions) {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/session/${sessionId}`, { action }, { token });
}

export function requestGetSessionStatus (quizId: number, sessionId: number, token: string) {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionId}`, {}, { token });
}

export function requestGetQuizSessionResults (quizId: number, sessionId: number, token: string) {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, {}, { token });
}
export function requestGetQuizSessionResultsCSV (quizId: number, sessionId: number, token: string) {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionId}/results/CSV`, {}, { token });
}
export function requestGuestPlayerJoin (sessionId: number, name: string) {
  return requestHelper('POST', '/v1/player/join', { sessionId, name });
}
export function requestGetGuestPlayerStatus (playerId: number) {
  return requestHelper('GET', `/v1/player/${playerId}`, {});
}
export function requestFinalResults (playerId: number) {
  return requestHelper('GET', `/v1/player/${playerId}/results`, {});
}
export function requestPlayerAnswers (answerIds: number[], playerId: number, questionPosition: number) {
  return requestHelper('PUT', `/v1/player/${playerId}/question/${questionPosition}/answer`, { answerIds });
}
export function requestQuestionResults (playerId: number, questionPosition: number) {
  return requestHelper('GET', `/v1/player/${playerId}/question/${questionPosition}/results`, {});
}
export function requestPlayerQuestionInfo (playerId: number, questionPosition: number) {
  return requestHelper('GET', `/v1/player/${playerId}/question/${questionPosition}`, {});
}
export function requestAllChatMessages (playerId: number) {
  return requestHelper('GET', `/v1/player/${playerId}/chat`, {});
}
export function requestSendChatMessages (playerId: number, messageBody: object) {
  return requestHelper('POST', `/v1/player/${playerId}/chat`, { message: messageBody });
}

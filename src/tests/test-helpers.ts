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

export function requestAdminAuthRegister (email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: {
        email,
        password,
        nameFirst,
        nameLast,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}
export function requestAdminAuthLogin (email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/login',
    {
      json: {
        email,
        password,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}
export function requestAdminUserDetails (token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/user/details',
    {
      qs: {
        token
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminQuizList (token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/list',
    {
      qs: {
        token,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminQuizCreate (token: string, name: string, description: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    {
      json: {
        token,
        name,
        description,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}
export function requestAdminQuizInfo (token: string, quizId: number) {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}`,
    {
      qs: {
        token,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}
export function requestAdminQuizRemove (token: string, quizId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId}`,
    {
      qs: {
        token,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}
export function requestAdminQuizNameUpdate (token: string, quizId: number, name: string) {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/name`,
    {
      json: {
        token,
        name,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}
export function requestAdminQuizDescriptionUpdate (token: string, quizId: number, description: string) {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/description`,
    {
      json: {
        token,
        description,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}
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

/// /////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////     ITERATION 2      //////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////

export function requestAdminAuthLogout (token: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/logout',
    {
      json: { token }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminUserDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/details',
    {
      json: {
        token,
        email,
        nameFirst,
        nameLast,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminUserPasswordUpdate(token: string, oldPassword: string, newPassword: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/password',
    {
      json: {
        token,
        oldPassword,
        newPassword,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminQuizTransfer(token: string, userEmail: string, quizId: number) {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
    {
      json: {
        token,
        userEmail,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminQuizTrash (token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/trash',
    {
      qs: {
        token,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminTrashRemove (token: string, quizIds: number[]) {
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/admin/quiz/trash/empty',
    {
      qs: {
        token,
        quizIds: JSON.stringify(quizIds),
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminQuizQuestionCreate (quizId: number, token: string, questionBody: QuestionBody) {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
    {
      json: {
        token,
        questionBody,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminQuizQuestionDelete (quizId: number, questionId: number, token: string) {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
    {
      qs: {
        token,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminQuizQuestionMove (quizId: number, questionId: number, token: string, newPosition: number) {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/move`,
    {
      json: {
        token,
        newPosition,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminQuizQuestionDuplicate (quizId: number, questionId: number, token: string) {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      json: {
        token,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminQuizTrashRestore (quizId: number, token: string) {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/restore`,
    {
      json: {
        token,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminQuizQuestionUpdate (quizId: number, questionId: number, token: string, questionBody: QuestionBody) {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
    {
      json: {
        token,
        questionBody,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

/// /////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////     ITERATION 2      //////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////

export function requestAdminAuthLogoutV2 (token: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v2/admin/auth/logout',
    {
      headers: {
        token
      },
      json: {}
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}
export function requestAdminUserDetailsV2 (token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v2/admin/user/details',
    {
      headers: {
        token
      },
      qs: {}
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}
export function requestAdminUserDetailsUpdateV2 (token: string, email: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v2/admin/user/details',
    {
      headers: {
        token,
      },
      json: {
        email,
        nameFirst,
        nameLast,
      }
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}
export function requestAdminUserPasswordUpdateV2 (token: string, oldPassword: string, newPassword: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/v2/admin/user/password',
    {
      headers: {
        token,
      },
      json: {
        oldPassword,
        newPassword,
      }
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}
export function requestAdminQuizListV2 (token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v2/admin/quiz/list',
    {
      headers: {
        token,
      },
      qs: {}
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}
export function requestAdminQuizCreateV2 (token: string, name: string, description: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v2/admin/quiz',
    {
      headers: {
        token,
      },
      json: {
        name,
        description,
      }
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}
export function requestAdminQuizRemoveV2 (token: string, quizId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + `/v2/admin/quiz/${quizId}`,
    {
      headers: {
        token,
      },
      qs: {}
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}
export function requestAdminQuizInfoV2 (token: string, quizId: number) {
  const res = request(
    'GET',
    SERVER_URL + `/v2/admin/quiz/${quizId}`,
    {
      headers: {
        token,
      },
      qs: {}
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}
export function requestAdminQuizNameUpdateV2 (token: string, quizId: number, name: string) {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizId}/name`,
    {
      headers: {
        token,
      },
      json: {
        name,
      }
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}
export function requestAdminQuizDescriptionUpdateV2 (token: string, quizId: number, description: string) {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizId}/description`,
    {
      headers: {
        token,
      },
      json: {
        description,
      }
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}
export function requestAdminQuizTrashV2 (token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/v2/admin/quiz/trash',
    {
      headers: {
        token,
      },
      qs: {}
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: JSON.parse(res.body.toString()),
  };
}
export function requestAdminQuizTrashRestoreV2 (quizId: number, token: string) {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/restore`,
    {
      headers: {
        token,
      },
      json: {}
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}
export function requestAdminTrashRemoveV2 (token: string, quizIds: number[]) {
  const res = request(
    'DELETE',
    SERVER_URL + '/v2/admin/quiz/trash/empty',
    {
      headers: {
        token,
      },
      qs: {
        quizIds: JSON.stringify(quizIds),
      }
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}
export function requestAdminQuizTransferV2 (token: string, userEmail: string, quizId: number) {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/transfer`,
    {
      headers: {
        token,
      },
      json: {
        userEmail,
      }
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}

export function requestAdminQuizQuestionCreateV2 (quizId: number, token: string, questionBody: QuestionBody) {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question`,
    {
      headers: {
        token,
      },
      json: {
        questionBody,
      }
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}

export function requestAdminQuizQuestionUpdateV2 (quizId: number, questionId: number, token: string, questionBody: QuestionBody) {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}`,
    {
      headers: {
        token,
      },
      json: {
        questionBody,
      }
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}

export function requestAdminQuizQuestionDeleteV2 (quizId: number, questionId: number, token: string) {
  const res = request(
    'DELETE',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}`,
    {
      headers: {
        token,
      }
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}

export function requestAdminQuizQuestionMoveV2 (quizId: number, questionId: number, token: string, newPosition: number) {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}/move`,
    {
      headers: {
        token,
      },
      json: {
        newPosition,
      }
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
}

export function requestAdminQuizQuestionDuplicateV2 (quizId: number, questionId: number, token: string) {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      headers: {
        token,
      }
    }
  );
  const ret = JSON.parse(res.body.toString());
  if (res.statusCode !== 200) {
    throw HTTPError(res.statusCode, ret.error);
  }
  return {
    body: ret,
  };
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
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}/results`,
    {
      headers: {
        token,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
  };
}

export function requestGetQuizSessionResultsCSV (quizId: number, sessionId: number, token: string) {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}/results/CSV`,
    {
      headers: {
        token,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
  };
}
export function requestGuestPlayerJoin (sessionId: number, name: string) {
  const res = request(
    'POST',
    SERVER_URL + '/v1/player/join',
    {
      json: {
        name,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
  };
}
export function requestGetGuestPlayerStatus (playerId: number) {
  return requestHelper('GET', `/v1/player/${playerId}`, {});
}
export function requestFinalResults (playerId: number) {
  return requestHelper('GET', `/v1/player/${playerId}/results`, {});
}

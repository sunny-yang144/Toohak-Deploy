import request from 'sync-request-curl';
import { port, url } from './config.json';
import { Answer } from './dataStore';
const SERVER_URL = `${url}:${port}`;

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
export function requestAdminQuizList (token: number) {
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
    SERVER_URL + '/v1/admin/quiz/trash}',
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
  // Package the array so it can be sent through HTTP;
  const encodedQuizIds = encodeURIComponent(JSON.stringify(quizIds));
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/admin/quiz/trash/empty}',
    {
      qs: {
        token,
        encodedQuizIds,
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

export function requestAdminQuizQuestionCreate (quizId: number, token: number, question: string, duration: number, points: number, answers: Answer[]) {
  const encodedAnswers = encodeURIComponent(JSON.stringify(answers));
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
    {
      json: {
        token,
        questionBody: {
          question,
          duration,
          points,
          encodedAnswers,
        },
      }
    }
  );
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
}

import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { QuestionBody } from '../dataStore';
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
  return {
    body: JSON.parse(res.body.toString()),
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
  return {
    body: JSON.parse(res.body.toString()),
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
  return {
    body: JSON.parse(res.body.toString()),
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
  return {
    body: JSON.parse(res.body.toString()),
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
  return {
    body: JSON.parse(res.body.toString()),
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
  return {
    body: JSON.parse(res.body.toString()),
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
  return {
    body: JSON.parse(res.body.toString()),
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
  return {
    body: JSON.parse(res.body.toString()),
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
  return {
    body: JSON.parse(res.body.toString()),
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
  return {
    body: JSON.parse(res.body.toString()),
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
  return {
    body: JSON.parse(res.body.toString()),
  };
}

import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import {
  adminAuthRegister,
  adminUserDetails,
  adminAuthLogin,
  adminAuthLogout,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate,
  guestPlayerJoin,
  guestPlayerStatus,
  currentQuestionInfoPlayer,
  playerAnswers,
  questionResults,
  finalResults,
  allChatMessages,
  sendChatMessages,
} from './auth';

import {
  adminQuizList,
  adminQuizCreate,
  adminQuizInfo,
  adminQuizRemove,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizTrash,
  adminQuizRestore,
  adminQuizTrashRemove,
  adminQuizTransfer,
  adminQuizQuestionCreate,
  adminQuizQuestionUpdate,
  adminQuizQuestionDelete,
  adminQuizQuestionMove,
  adminQuizQuestionDuplicate,
  updateQuizThumbNail,
  viewSessionActivity,
  newSessionQuiz,
  updateSessionState,
  getSessionStatus,
  getQuizSessionResults,
  getQuizSessionResultsCSV
} from './quiz';

import { clear } from './other';
import { setData, dataStoreFile } from './dataStore';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';
// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request

app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

// ========================================================================= //
// SERVER ROUTES
// ========================================================================= //

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;

  const response = adminAuthRegister(email, password, nameFirst, nameLast);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  const response = adminAuthLogin(email, password);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;

  const response = adminUserDetails(token);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;

  const response = adminQuizList(token);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});
// Need to define trash before /v1/admin/quiz/:quizid
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;

  const response = adminQuizTrash(token);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;

  const response = adminQuizCreate(token, name, description);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);

  const token = req.query.token as string;

  const response = adminQuizRemove(token, quizId);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.query.token as string;

  const response = adminQuizInfo(token, quizId);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, name } = req.body;

  const response = adminQuizNameUpdate(token, quizId, name);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, description } = req.body;

  const response = adminQuizDescriptionUpdate(token, quizId, description);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = clear();
  res.json(response);
});

/// /////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////     ITERATION 2      //////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;

  const response = adminAuthLogout(token);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;

  const response = adminUserDetailsUpdate(token, email, nameFirst, nameLast);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;

  const response = adminUserPasswordUpdate(token, oldPassword, newPassword);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token } = req.body;

  const response = adminQuizRestore(token, quizId);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizIds = JSON.parse(req.query.quizIds as string) as number[];

  const response = adminQuizTrashRemove(token, quizIds);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, userEmail } = req.body;

  const response = adminQuizTransfer(quizId, token, userEmail);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, questionBody } = req.body;

  const response = adminQuizQuestionCreate(quizId, token, questionBody);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, questionBody } = req.body;

  const response = adminQuizQuestionUpdate(quizId, questionId, token, questionBody);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.query.token as string;

  const response = adminQuizQuestionDelete(quizId, questionId, token);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, newPosition } = req.body;

  const response = adminQuizQuestionMove(quizId, questionId, token, newPosition);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token } = req.body;

  const response = adminQuizQuestionDuplicate(quizId, questionId, token);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

/// /////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////     MODIFIED ITERATION 2      /////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const response = adminAuthLogout(token);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const response = adminUserDetails(token);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { email, nameFirst, nameLast } = req.body;
  const response = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { oldPassword, newPassword } = req.body;
  const response = adminUserPasswordUpdate(token, oldPassword, newPassword);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const response = adminQuizList(token);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});
// Need to define trash in front of /v2/admin/quiz:quizid
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  console.log("NNNNNNNNNNNNNNNNNNN");
  const response = adminQuizTrash(token);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { name, description } = req.body;
  const response = adminQuizCreate(token, name, description);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const response = adminQuizRemove(token, quizId);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const response = adminQuizInfo(token, quizId);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const { name } = req.body;
  const response = adminQuizNameUpdate(token, quizId, name);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const { description } = req.body;
  const response = adminQuizDescriptionUpdate(token, quizId, description);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const response = adminQuizRestore(token, quizId);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizIds = JSON.parse(req.query.quizIds as string) as number[];
  const response = adminQuizTrashRemove(token, quizIds);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const { userEmail } = req.body;
  const response = adminQuizTransfer(quizId, token, userEmail);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const { questionBody } = req.body;
  const response = adminQuizQuestionCreate(quizId, token, questionBody);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token as string;
  const { questionBody } = req.body;
  const response = adminQuizQuestionUpdate(quizId, questionId, token, questionBody);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token as string;
  const response = adminQuizQuestionDelete(quizId, questionId, token);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token as string;
  const { newPosition } = req.body;
  const response = adminQuizQuestionMove(quizId, questionId, token, newPosition);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.headers.token as string;
  const response = adminQuizQuestionDuplicate(quizId, questionId, token);
  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

/// /////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////     ITERATION 3 NEW      ///////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////

app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const { imgUrl } = req.body;
  res.json(updateQuizThumbNail(quizId, token, imgUrl));
});

app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  res.json(viewSessionActivity(token, quizId));
});

app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.headers.token as string;
  const { autoStartNum } = req.body;
  res.json(newSessionQuiz(quizId, token, autoStartNum));
});

app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.headers.token as string;
  const { action } = req.body;
  res.json(updateSessionState(quizId, sessionId, token, action));
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.headers.token as string;
  res.json(getSessionStatus(quizId, sessionId, token));
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.headers.token as string;
  res.json(getQuizSessionResults(quizId, sessionId, token));
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results/csv', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.headers.token as string;
  res.json(getQuizSessionResultsCSV(quizId, sessionId, token));
});

app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;
  res.json(guestPlayerJoin(sessionId, name));
});

app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  res.json(guestPlayerStatus(playerId));
});

app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  res.json(currentQuestionInfoPlayer(playerId, questionPosition));
});

app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const { answerIds } = req.body;
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  res.json(playerAnswers(answerIds, playerId, questionPosition));
});

app.get('/v1/player/:playerid/question/:questionposition/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  res.json(questionResults(playerId, questionPosition));
});

app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  res.json(finalResults(playerId));
});

app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  res.json(allChatMessages(playerId));
});

app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const { messageBody } = req.body;
  res.json(sendChatMessages(playerId, messageBody));
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    404 Not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  if (fs.existsSync(dataStoreFile)) {
    const serializedData = fs.readFileSync(dataStoreFile, 'utf8');
    setData(JSON.parse(serializedData));
  }
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});

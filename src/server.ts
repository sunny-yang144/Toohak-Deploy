import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process, { allowedNodeEnvironmentFlags } from 'process';
import { 
  adminAuthRegister, 
  adminUserDetails, 
  adminAuthLogin,
  adminAuthLogout,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate, 
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
} from './quiz';

import { clear } from './other';
import { setData, dataStoreFile } from './dataStore';
import { addAbortListener } from 'events';

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
  const ret = echo(data);
  if ('error' in ret) {
    res.status(400);
  }
  return res.json(ret);
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

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////     ITERATION 2      //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

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

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token } = req.body;

  const response = adminQuizRestore(quizId, token);

  if ('error' in response) {
    return res.status(response.statusCode).json({
      error: response.error
    });
  }
  res.json(response);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const encodedQuizIds = req.query.encodedQuizIds;

  if (typeof encodedQuizIds !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing encodedQuizIds parameter' });
  }

  let quizIds;
  try {
    quizIds = JSON.parse(decodeURIComponent(encodedQuizIds));

    if (!Array.isArray(quizIds) || !quizIds.every(id => typeof id === 'number')) {
      return res.status(400).json({ error: 'Invalid quizIds parameter. It should be an array of numbers.' });
    }
  } catch (error) {
    return res.status(400).json({ error: 'Failed to parse encodedQuizIds parameter.' });
  }

  // From the error handling above, quizIds is assumed to be a number array.
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

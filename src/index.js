const express = require('express');
const readTalkers = require('./utils/readFile');
const createToken = require('./utils/createToken');
const validateEmail = require('./middlewares/validateEmail');
const validatePsw = require('./middlewares/validatePsw');
const writeTalkers = require('./utils/writeFile');
const auth = require('./middlewares/auth');
const validateAge = require('./middlewares/validateAge');
const validateName = require('./middlewares/validateName');
const validadeTalk = require('./middlewares/validadeTalk');
const validateWatchedAt = require('./middlewares/validateWatchedAt');
const validateRate = require('./middlewares/validateRate');
const validateRateParams = require('./middlewares/validateRateParams');
const validateWatchedAtParams = require('./middlewares/validateWatchedAtParams');
const validateRatePatch = require('./middlewares/validateRatePatch');
const { findAll } = require('./db/talkerDB');

const app = express();

app.use(express.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

app.get('/talker/db', async (_req, res) => {
  const [result] = await findAll();
  if (result.length === 0) {
    return res.status(200).json([]);
  }
  const talkersObj = result.map((e) => ({
    name: e.name,
    age: e.age,
    id: e.id,
    talk: {
      watchedAt: e.talk_watched_at,
      rate: e.talk_rate,
    },
  }));
  res.status(200).json(talkersObj);
});

app.get('/talker/search',
 auth,
 validateRateParams,
 validateWatchedAtParams,
 async (req, res) => {
  const { q, rate, date } = req.query;
  const talkers = await readTalkers();
  let filteredTalkers = talkers;

  if (q && q.trim() !== '') {
    filteredTalkers = filteredTalkers.filter((e) => e.name.includes(q));
  }

  if (rate) {
    filteredTalkers = filteredTalkers.filter((el) => el.talk.rate === Number(rate));
  }

  if (date) {
    filteredTalkers = filteredTalkers.filter((ele) => ele.talk.watchedAt === date);
  }

  res.status(200).json(filteredTalkers);
});

app.get('/talker', async (_req, res) => {
  const talkers = await readTalkers();
  if (talkers.length === 0) {
    return res.status(200).json([]);
  }
  return res.status(200).json(talkers);
});

app.get('/talker/:id', async (req, res) => {
  const talkers = await readTalkers();
  const id = +req.params.id;
  const talkerById = talkers.find((e) => e.id === id);
  if (!talkerById) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  return res.status(200).json(talkerById);
});

app.post('/login', validateEmail, validatePsw, (req, res) => {
  const token = createToken();
  return res.status(200).json({ token });
});

app.post('/talker',
auth,
validateName,
validateAge,
validadeTalk,
validateWatchedAt,
validateRate,
      async (req, res) => {
  const talkerBody = req.body;
  const talkers = await readTalkers();
  const newId = talkers.length + 1;
  const newTalker = { id: newId, ...talkerBody };
  talkers.push(newTalker);
  await writeTalkers(talkers);
  res.status(201).send(newTalker);
});

app.put('/talker/:id',
auth,
validateName,
validateAge,
validadeTalk,
validateWatchedAt,
validateRate,
      async (req, res) => {
  const talkerId = Number(req.params.id);
  const talkerBody = req.body;
  const talkers = await readTalkers();
  const index = talkers.findIndex((e) => e.id === talkerId);
  if (index < 1) { return res.status(404).json({ message: 'Pessoa palestrante não encontrada' }); }
  const updTalker = { id: talkerId, ...talkerBody };
  talkers.splice(index, 1, updTalker);
  
  await writeTalkers(talkers);
  res.status(200).send(updTalker);
});

app.delete('/talker/:id', auth, async (req, res) => {
  const talkerId = Number(req.params.id);
  const talkers = await readTalkers();
  const updTalkers = talkers.filter((e) => e.id !== talkerId);
  await writeTalkers(updTalkers);
  res.sendStatus(204);
});

app.patch('/talker/rate/:id', auth, validateRatePatch, async (req, res) => {
  const talkerId = Number(req.params.id);
  const { rate } = req.body;
  const talkers = await readTalkers();
  const index = talkers.findIndex((e) => e.id === talkerId);
  talkers[index].talk.rate = rate;
  await writeTalkers(talkers);

  res.sendStatus(204);
});

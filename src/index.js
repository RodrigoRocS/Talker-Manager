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
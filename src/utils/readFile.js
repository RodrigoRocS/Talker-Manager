const fs = require('fs').promises;
const path = require('path');

const talkerPath = path.resolve(__dirname, '../talker.json');

const readTalkers = async () => {
  try {
    const data = await fs.readFile(talkerPath);
    return JSON.parse(data);
  } catch (error) {
    console.error(`${error}`);
  }
};

module.exports = readTalkers;
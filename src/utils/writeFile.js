const fs = require('fs').promises;
const path = require('path');

const talkerPath = path.resolve(__dirname, '../talker.json');

const writeTalkers = async (data) => {
    const newData = JSON.stringify(data);
    await fs.writeFile(talkerPath, newData);
};

module.exports = writeTalkers;
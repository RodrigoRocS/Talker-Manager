const conn = require('./connection');

const findAll = async () => conn.execute('SELECT * FROM talkers');

module.exports = { findAll };
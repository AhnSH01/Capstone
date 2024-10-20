var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost',
  user: 'capstone',
  password: '3wjs3qhr',
  database: 'capstone'
});

module.exports = conn;
삭제된 파일 정보
app/src/mysql/mysql.js

"use strict";

var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost',
  user: '',
  password: '',
  database: ''
});

module.exports = conn;

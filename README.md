삭제된 파일 정보
app/src/config/db.js
해당 경로에 파일 생성해서 아래 코드 넣으면 됩니다.

"use strict";

var mysql = require('mysql');
var conn = mysql.createConnection({
  host: '',
  user: '',
  password: '',
  database: ''
});

module.exports = conn;

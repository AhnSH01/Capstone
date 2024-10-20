"use strict";

var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost',
  user: 'capstone',
  password: '3wjs3qhr',
  database: 'capstone'
});


function get_date() { // YYYY-MM-DD
  let today = new Date();

  let year = today.getFullYear(); // 년도
  let month = today.getMonth() + 1;  // 월
  let date = today.getDate();  // 날짜

  return (year + '-' + month + '-' + date)
}

function get_datetime() { // YYYY-MM-DD HH:MM:SS
  let today = new Date();

  let year = today.getFullYear(); // 년도
  let month = today.getMonth() + 1;  // 월
  let date = today.getDate();  // 날짜
  let hours = today.getHours(); // 시
  let minutes = today.getMinutes();  // 분
  let seconds = today.getSeconds();  // 초

  return (year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds)
}


// 데이터 삽입
function sql_insert(sql) {
  return new Promise((resolve) => {
    conn.query(sql, function (err, results) {
      if (err) throw err;
      console.log("record inserted successfully");
      resolve(results);
    });
  })
}

async function sql_insert_user(login_id, password, adress, name, phone_number, gender, age) {
  var sql = `INSERT INTO user (login_id, password, adress, name, phone_number, gender, age) VALUES ('${login_id}', '${password}', '${adress}', '${name}', '${phone_number}', '${gender}', '${age}')`;
  let results = await sql_insert(sql);
  console.log(`id = ${results.insertId}`);
}

async function sql_insert_video(user_id, S3_URL) {
  var sql = `INSERT INTO video (user_id, date, S3_URL) VALUES ('${user_id}', '${get_date()}', '${S3_URL}')`;
  let results = await sql_insert(sql);
  console.log(`id = ${results.insertId}`);
}

async function sql_insert_video_event(video_id, push) {
  var sql = `INSERT INTO video_event (video_id, datetime, push) VALUES ('${video_id}', '${get_datetime()}', '${push}')`;
  let results = await sql_insert(sql);
  console.log(`id = ${results.insertId}`);
}

async function sql_insert_options(user_id, push, theme, language) {
  var sql = `INSERT INTO options (user_id, push, theme, language) VALUES ('${user_id}', '${push}', '${theme}', '${language}')`;
  let results = await sql_insert(sql);
}

async function sql_insert_doorlock_event(user_id, password, push) {
  var sql = `INSERT INTO doorlock_event (user_id, datetime, password, push) VALUES ('${user_id}', '${get_datetime()}', '${password}', '${push}')`;
  let results = await sql_insert(sql);
  console.log(`id = ${results.insertId}`);
}

async function sql_insert_report(user_id, event_id, event_type) {
  var sql = `INSERT INTO report (user_id, datetime, event_id, event_type) VALUES ('${user_id}', '${get_datetime()}', '${event_id}', '${event_type}')`;
  let results = await sql_insert(sql);
  console.log(`id = ${results.insertId}`);
}


// 데이터 검색
function sql_select(table) {
  conn.query(`select * from ${table}`, function (error, results, fields) {
    if (error) throw error;
    // console.log(`${table}: ${JSON.stringify(results)}`);
    console.dir(results);
  });
}


// 데이터 삭제
function sql_delete(table, field, target) {
  var sql = `DELETE FROM ${table} WHERE ${field} = '${target}'`;
  conn.query(sql, function (err, results) {
    if (err) throw err;
    console.log("Number of recoreds deleted: " + results.affectedRows);
  });
}


// 데이터 수정
function sql_update(table, update_field, update_value, target_field, target_value) {
  var sql = `UPDATE ${table} SET ${update_field} = '${update_value}'`;

  if (target_field && target_value) {
    sql += `WHERE ${target_field} = '${target_value}'`;
  }

  conn.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results.affectedRows + " record(s) updated");
  });
}


async function main() {
  conn.connect();
  sql_select('video');

  // await sql_insert_user('test_id15', 'test_pw', 'test_adr', 'test_name', '010-1234-1234', 'male', 24);
  // await sql_insert_video(11, 'test_URL');
  // await sql_insert_video_event(12, 0);
  // await sql_insert_options(11, 1, 'Dark', 'English');
  // await sql_insert_doorlock_event(11, '123321', 1);
  // await sql_insert_report(8, 2, 0);

  // sql_delete('video', 'id', 9);
  // sql_delete('user', 'login_id', 'test_id6');

  // sql_update('video', 'user_id', 13, 'id', 7);
  // sql_update('video', 'date', get_date(), 'id', 7);

  conn.end();
}

main();
async function get_num() {
    await setTimeout(() => {
        return 10;
    }, 500);
}

async function test() {
    var num = '10.1';
    console.log(typeof(num));
    console.log(typeof(num) == 'number');
    if (typeof(num) == 'string') {
        num = "'" + num + "'";
    }
    console.log(num);
}

test();



// 짜놓고보니 필요없을 것 같아서 버렸지만
// 버리기엔 혹여나 쓸 일이 있을까 싶어 남겨둔 코드

// login_id로 search user_id
// function get_user_id(login_id) {
//   return new Promise((resolve) => {
//     conn.query(`select id from user WHERE login_id = '${login_id}'`, function (error, results, fields) {
//       if (error) throw error;
//       resolve(results[0]['id']);
//     });
//   })
// }


// async function sql_insert_video_event(user_id, video_id, video_S3_URL, push) {
//     var sql = `INSERT INTO video_event (user_id, video_id, video_S3_URL, datetime, push) VALUES (${user_id}, ${video_id}, '${video_S3_URL}', '${get_datetime()}', ${push})`;
//     var id = await sql_insert(sql);
    
//     // 만들고 보니까 굳이 이미 video_event에 video_id를 참조중인데
//     // video에서 또 event_id를 참조할 필요가 있는지 모르겠네
//     sql = `UPDATE video SET event_id = '${id}' WHERE id = '${video_id}'`;
//     conn.query(sql, function (err, result) {
//       if (err) throw err;
//       console.log("video foreign key updated successfully");
//     });
//   }


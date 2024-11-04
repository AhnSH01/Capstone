"use strict";

const pre_password = document.querySelector("#pre-password"),
    new_password = document.querySelector("#new-password"),
    confirm_password = document.querySelector("#confirm-password"),
    Btn = document.querySelector("#button");

Btn.addEventListener("click", login);

function login() {
    const req = {
        pre_password: pre_password.value,
        new_password: new_password.value,
        confirm_password: confirm_password.value,
    };

    fetch("/user/password", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(req),
    })
    .then((res) => res.json())
    .then((res) => {
        if (res.success) {
            alert(res)
        } else {
            if (!res.error) alert(res.msg);
        }
    })
    .catch((err) => {
        console.error(new Error("비밀번호 변경 중 에러 발생"));
    })
}
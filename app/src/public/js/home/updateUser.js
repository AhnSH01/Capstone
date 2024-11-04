"use strict";

// login-id, name, adress, phone-number, gender, age
const accessToken = document.querySelector("#token"),
    login_id = document.querySelector("#login-id"),
    user_name = document.querySelector("#name"),
    adress = document.querySelector("#adress"),
    phone_number = document.querySelector("#phone-number"),
    gender = document.querySelector("#gender"),
    age = document.querySelector("#age"),
    Btn = document.querySelector("#button");

Btn.addEventListener("click", login);

function login() {
    const req = {
        accessToken: accessToken.value,
        login_id: login_id.value,
        name: user_name.value,
        adress: adress.value,
        phone_number: phone_number.value,
        gender: gender.value,
        age: age.value,
    };

    fetch("/user", {
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
        console.error(new Error("유저정보 변경 중 에러 발생"));
    })
}
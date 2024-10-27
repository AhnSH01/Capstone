"use strict";

const UserStorage = require("./UserStorage");

class User {
    constructor(body) {
        this.body = body;
    }

    async login() {
        const client = this.body;
        try {
            const user = await UserStorage.getUserInfo(client.id);

            if (user) {
                if (user.login_id === client.id && user.password === client.password) {
                    return { success: true };
                } else {
                    return { success: false, msg: "비밀번호가 틀렸습니다." };
                }
            } else {
                return { success: false, msg: "찾을 수 없는 ID 입니다." };
            }
        } catch (error) {
            return { success: false, error };
        }
    }

    async register() {
        const client = this.body;

        try {
            return await UserStorage.save(client);
        } catch (error) {
            if (error.errno == 1062) return { success: false, msg: "이미 존재하는 ID입니다." };
            else return { success: false, error };
        }

    }
}

module.exports = User;
"use strict";

const UserStorage = require("./UserStorage");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class User {
    constructor(body) {
        this.body = body;
    }

    async getUser() {
        const client = this.body;

        try {
            const token = client.accessToken;
            const user = jwt.verify(token, process.env.ACCESS_SECRET);
            const userInfo = await UserStorage.getUserInfo(user.login_id);
            const { password, ...others } = userInfo;

            return { success: true, others };
        } catch (error) {
            return { success: false, error };
        }
    }

    async login() {
        const client = this.body;

        if (!client.id) return { success: false, msg: "아이디를 입력해주세요." };
        if (!client.password) return { success: false, msg: "비밀번호를 입력해주세요." };

        try {
            const user = await UserStorage.getUserInfo(client.id);

            if (user) {
                if (user.login_id === client.id && await bcrypt.compare(client.password, user.password)) {
                    try {
                        // access token 발급
                        const accessToken = jwt.sign({
                            id: user.id,
                            login_id: user.login_id,
                            name: user.name,
                        }, process.env.ACCESS_SECRET, {
                            expiresIn: '365d',
                            issuer: 'About Tech',
                        });

                        // refresh token 발급
                        const refreshToken = jwt.sign({
                            id: user.id,
                            login_id: user.login_id,
                            name: user.name,
                        }, process.env.REFRESH_SECRET, {
                            expiresIn: '24h',
                            issuer: 'About Tech',
                        });

                        return { success: true, msg: `${user.name}님 로그인`, accessToken, refreshToken };
                    } catch (error) {
                        return { success: false, error };
                    }
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

        if (!client.id) return { success: false, msg: "아이디를 입력해주세요." };
        if (client.password !== client.confirm_password) return { success: false, msg: "비밀번호가 일치하지 않습니다." };

        try {
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(client.password, salt);
            client.password = password;
            return await UserStorage.save(client);
        } catch (error) {
            if (error.errno == 1062) return { success: false, msg: "이미 존재하는 ID입니다." };
            else return { success: false, error };
        }

    }

    accessToken() {
        const client = this.body;

        try {
            const token = client.accessToken;
            const user = jwt.verify(token, process.env.ACCESS_SECRET);
            return { success: true, user };
        } catch (error) {
            return { success: false, error };
        }
    }

    refreshToken() {
        const client = this.body;

        try {
            const token = client.refreshToken;
            const user = jwt.verify(token, process.env.REFRESH_SECRET);

            // access token 발급
            const accessToken = jwt.sign({
                id: user.id,
                login_id: user.login_id,
                name: user.name,
            }, process.env.ACCESS_SECRET, {
                expiresIn: '365d',
                issuer: 'About Tech',
            });

            return { success: true, user, accessToken };
        } catch (error) {
            return { success: false, error };
        }
    }

    async updatePassword() {
        // const client = this.body; //accessToken, pre_password, new_password, confirm_password
        const client = this.body.body;

        if (!client.pre_password) return { success: false, msg: "기존 비밀번호를 입력해주세요." };
        if (!client.new_password) return { success: false, msg: "새 비밀번호를 입력해주세요." };
        if (client.new_password !== client.confirm_password) return { success: false, msg: "새 비밀번호가 일치하지 않습니다." };

        try {
            const token = this.body.cookies.accessToken;
            const payload = jwt.verify(token, process.env.ACCESS_SECRET);
            const user = await UserStorage.getUserInfo(payload.login_id);

            if (user) {
                if (await bcrypt.compare(client.pre_password, user.password)) {
                    try { // 비밀번호 업데이트
                        const salt = await bcrypt.genSalt(10);
                        const new_password = await bcrypt.hash(client.new_password, salt);

                        return await UserStorage.updatePassword(user.id, new_password);
                    } catch (error) {
                        return { success: false, error };
                    }
                } else {
                    return { success: false, msg: "기존 비밀번호가 틀렸습니다." };
                }
            } else {
                return { success: false, msg: "찾을 수 없는 ID 입니다. (유효하지않은 토큰)" };
            }
        } catch (error) {
            return { success: false, error };
        }
    }
}

module.exports = User;
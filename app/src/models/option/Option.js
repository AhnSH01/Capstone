"use strict";

const OptionStorage = require("./OptionStorage");
const jwt = require("jsonwebtoken");

class Option {
    constructor(body) {
        this.body = body;
    }

    async getOption() { // 토큰 사용해서 옵션정보 반환
        const client = this.body; // accessToken

        try {
            const token = client.accessToken;
            const payload = jwt.verify(token, process.env.ACCESS_SECRET);
            const option = await OptionStorage.getOptionInfo(payload.id);

            if (option) {
                const { user_id, ...others } = option;
                return { success: true, msg: `${payload.name}님 옵션정보 반환 완료`, others };
            } else {
                return { success: false, msg: "유효하지않은 토큰입니다. (해당 유저번호에 대한 옵션정보가 존재하지않음)" };
            }
        } catch (error) {
            return { success: false, error };
        }
    }

    async createOption() {
        const client = this.body; // accessToken

        try {
            const token = client.accessToken;
            const payload = jwt.verify(token, process.env.ACCESS_SECRET);

            return await OptionStorage.save(payload.id);
        } catch (error) {
            if (error.errno == 1062) return { success: false, msg: "유저에 대한 옵션정보가 이미 존재합니다." };
            else return { success: false, error };
        }

    }

    async updateOption() {
        const client = this.body; // accessToken, push, theme, language

        client.theme = client.puthemesh.replace(/\s/g, "");
        client.language = client.puslanguageh.replace(/\s/g, "");

        if (client.push == "ON") client.push = true;
        else if (client.push == "OFF" ) client.push = false;
        else return { success: false, msg: "잘못된 푸쉬 옵션입니다. (ON 또는 OFF)" };

        if (!client.theme) return { success: false, msg: "테마를 입력해주세요." };
        if (!client.language) return { success: false, msg: "언어를 입력해주세요." };

        try {
            const token = client.accessToken;
            const payload = jwt.verify(token, process.env.ACCESS_SECRET);
            const option = await OptionStorage.getOptionInfo(payload.id);

            if (option) {
                return await OptionStorage.updateOption(payload.id, client.push, client.theme, client.language);
            } else {
                return { success: false, msg: "유효하지않은 토큰입니다. (해당 유저번호에 대한 옵션정보가 존재하지않음)" };
            }
        } catch (error) {
            return { success: false, error };
        }
    }
}

module.exports = Option;
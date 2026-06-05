const express = require("express");
const oracledb = require('oracledb');
const router = express.Router();
const db = require("../db");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
require("dotenv").config();
const JWT_KEY = process.env.jwt_key;
const jwtAuthentication = require('../auth')

router.get("/", jwtAuthentication, async (req, res) => {
    console.log("USER ROUTE HIT");
    const userId = req.user.userId;
    let conn;
    try {
        conn = await db.getConnection();
        const result = await conn.execute(
            `SELECT * FROM USERS WHERE USER_ID = :userId`,
            { userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        res.json({
            result: "success",
            userId: userId,
            userInfo: result.rows[0],
        });
    } catch (error) {

        console.error('Error executing query', error);
        res.status(500).send('Error executing query');

    } finally {
        if (conn) {
            await conn.close();
        }
    }
});

router.post("/join", async (req, res) => {

    let conn;

    try {

        const { userId, email, pwd, nickname } = req.body;
        console.log(userId);
        console.log(email);
        console.log(pwd);
        console.log(nickname);


        if (!userId || !nickname || !email || !pwd) {
            return res.status(400).json({
                result: "fail",
                message: "필수값 누락"
            });
        }

        conn = await db.getConnection();

        const hashPwd = await bcrypt.hash(pwd, saltRounds);

        const userCheck = await conn.execute(
            `SELECT USER_ID FROM USERS WHERE USER_ID = :userId`,
            { userId }
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({
                result: false,
                message: "이미 존재하는 아이디입니다."
            });
        }

        const emailCheck = await conn.execute(
            `SELECT EMAIL FROM USERS WHERE EMAIL = :email`,
            { email }
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({
                result: false,
                message: "이미 가입된 이메일입니다."
            });
        }

        const result = await conn.execute(
            `
            INSERT INTO USERS
            (
                USER_ID,
                EMAIL,
                PASSWORD_HASH,
                NICKNAME
            )
            VALUES
            (
                :userId,
                :email,
                :hashPwd,
                :nickname
            )
            `,
            {
                userId,
                email,
                hashPwd,
                nickname
            },
            {
                autoCommit: true
            }
        );
        let isJoin = false;
        let message = "회원가입 실패!";

        if (result.rowsAffected > 0) {
            isJoin = true;
            message = "회원가입 성공!"
        } else {
            //실패
        }
        return res.json({
            result: isJoin,
            message: message
        });

    } catch (error) {

        console.error('Error executing query', error);
        return res.status(500).json({
            result: false,
            message: "서버 오류"
        });

    } finally {

        if (conn) {
            await conn.close();
        }

    }

});

router.post('/login', async (req, res) => {

    const { userId, pwd } = req.body;

    let connection;

    try {

        connection = await db.getConnection();

        const result = await connection.execute(
            `
            SELECT *
            FROM USERS
            WHERE USER_ID = :userId
            `,
            [userId],
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        let isLogin = false;
        let message = "아이디 또는 비밀번호가 일치하지 않습니다.";
        let token = null;

        if (result.rows.length > 0) {

            const match = await bcrypt.compare(
                pwd,
                result.rows[0].PASSWORD_HASH
            );

            if (match) {

                isLogin = true;
                message = "로그인 성공!";

                const payload = {
                    userId: result.rows[0].USER_ID,
                    nickname: result.rows[0].NICKNAME
                };

                token = jwt.sign(
                    payload,
                    process.env.JWT_KEY,
                    {
                        expiresIn: '1h'
                    }
                );
                console.log(token)
            }

        }

        res.json({
            result: isLogin,
            message: message,
            token: token
        });

    } catch (error) {

        console.error('Error executing query', error);

        res.status(500).json({
            result: false,
            message: '서버 오류'
        });

    } finally {

        if (connection) {
            await connection.close();
        }

    }

});


module.exports = router;
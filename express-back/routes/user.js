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
const multer = require('multer');
const fs = require('fs');

// 1. 멀터 스토리지 및 용량 제한 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/profiles/'),
    filename: (req, file, cb) => {
        // 한글 파일명 깨짐 방지 디코딩
        const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, Date.now() + '-' + decodedName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 최대 5MB 제한
});

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

router.post("/join", (req, res, next) => {
    upload.single('profileImg')(req, res, (err) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ result: false, message: "이미지 용량은 최대 5MB까지만 가능합니다." });
        } else if (err) {
            return res.status(500).json({ result: false, message: "파일 업로드 오류가 발생했습니다." });
        }
        next();
    });
}, async (req, res) => {

    let conn;

    try {
        // FormData로 전송되므로 req.body에서 텍스트 데이터를 그대로 추출
        const { userId, email, pwd, nickname } = req.body;
        console.log("가입 시도 ID:", userId);
        console.log("이메일:", email);
        console.log("닉네임:", nickname);

        if (!userId || !nickname || !email || !pwd) {
            // 파일이 업로드된 상태에서 필수값이 누락되면 물리 파일 청소
            if (req.file) {
                const uploadedPath = req.file.destination + req.file.filename;
                if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
            }
            return res.status(400).json({
                result: false,
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
            if (req.file) {
                const uploadedPath = req.file.destination + req.file.filename;
                if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
            }
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
            if (req.file) {
                const uploadedPath = req.file.destination + req.file.filename;
                if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
            }
            return res.status(400).json({
                result: false,
                message: "이미 가입된 이메일입니다."
            });
        }

        let host = `${req.protocol}://${req.get('host')}/`;
        let profileImageUrl = null;
        if (req.file) {
            profileImageUrl = host + req.file.destination + req.file.filename;
        }

        const result = await conn.execute(
            `
            INSERT INTO USERS
            (
                USER_ID,
                EMAIL,
                PASSWORD_HASH,
                NICKNAME,
                PROFILE_IMAGE
            )
            VALUES
            (
                :userId,
                :email,
                :hashPwd,
                :nickname,
                :profileImageUrl
            )
            `,
            {
                userId,
                email,
                hashPwd,
                nickname,
                profileImageUrl
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
            // 실패 시 파일 청소
            if (req.file) {
                const uploadedPath = req.file.destination + req.file.filename;
                if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
            }
        }

        return res.json({
            result: isJoin,
            message: message
        });

    } catch (error) {
        console.error('Error executing query', error);

        // 예기치 못한 서버 에러 발생 시 가입 실패 업로드된 파일 청소
        if (req.file) {
            const uploadedPath = req.file.destination + req.file.filename;
            if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
        }

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

// 비밀번호 변경 API
router.post('/password-update', jwtAuthentication, async (req, res) => {
    // 토큰 인증 미들웨어에서 해석해준 로그인 유저 ID (인증 구현에 맞게 req.user.id 등 조절)
    const userId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    let connection;

    // 1. 필수 예외 처리 (빈 값 및 비밀번호 확인 일치 여부)
    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: "모든 필드를 정확히 입력해주세요." });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: "새 비밀번호와 비밀번호 확인이 일치하지 않습니다." });
    }
    if (newPassword.length < 4) { // 보안을 위한 최소 글자수 제한
        return res.status(400).json({ success: false, message: "새 비밀번호는 최소 4자 이상이어야 합니다." });
    }

    try {
        connection = await db.getConnection();

        // 2. USERS 테이블에서 해당 사용자의 현재 암호화된 비밀번호(PASSWORD_HASH) 조회
        const result = await connection.execute(
            `
            SELECT PASSWORD_HASH
            FROM USERS
            WHERE USER_ID = :userId
            `,
            [userId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // 상단 선언된 명칭 확인 필요
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
        }

        const hashedPasswordInDB = result.rows[0].PASSWORD_HASH;

        // 3. 입력한 현재 비밀번호와 DB의 해시값 비교 검증
        const isMatch = await bcrypt.compare(currentPassword, hashedPasswordInDB);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "현재 비밀번호가 일치하지 않습니다." });
        }

        // 4. 새 비밀번호를 bcrypt를 이용해 똑같이 암호화 (Salt round: 10)
        const saltRounds = 10;
        const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // 5. Oracle DB 업데이트 수행
        await connection.execute(
            `
            UPDATE USERS 
            SET PASSWORD_HASH = :newHashedPassword 
            WHERE USER_ID = :userId
            `,
            [newHashedPassword, userId],
            { autoCommit: true }
        );

        res.json({
            success: true,
            message: "비밀번호가 안전하게 변경되었습니다."
        });

    } catch (error) {
        console.error('비밀번호 변경 중 서버 오류 발생:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

router.get("/:userId/profile", jwtAuthentication,
    async (req, res) => {

        const targetUserId = req.params.userId;
        const loginUserId = req.user.userId;

        let conn;

        try {

            conn = await db.getConnection();

            const result = await conn.execute(
                `
                SELECT
                    U.USER_ID,
                    U.NICKNAME,
                    U.PROFILE_IMAGE,
                    U.BIO,
                    U.CREATED_AT,

                    (
                        SELECT COUNT(*)
                        FROM POSTS P
                        WHERE P.USER_ID = U.USER_ID
                    ) AS POST_COUNT,

                    (
                        SELECT COUNT(*)
                        FROM FOLLOWS F
                        WHERE F.FOLLOWING_ID = U.USER_ID
                    ) AS FOLLOWERS,

                    (
                        SELECT COUNT(*)
                        FROM FOLLOWS F
                        WHERE F.FOLLOWER_ID = U.USER_ID
                    ) AS FOLLOWING,

                    (
                        SELECT COUNT(*)
                        FROM FOLLOWS F
                        WHERE F.FOLLOWER_ID = :loginUserId
                        AND F.FOLLOWING_ID = U.USER_ID
                    ) AS IS_FOLLOWING

                FROM USERS U
                WHERE U.USER_ID = :targetUserId
                `,
                {
                    loginUserId,
                    targetUserId
                },
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    result: "fail",
                    message: "사용자를 찾을 수 없습니다."
                });
            }

            const profile = result.rows[0];

            return res.json({
                result: "success",
                profile: {
                    ...profile,
                    IS_FOLLOWING: profile.IS_FOLLOWING > 0,
                    IS_ME: profile.USER_ID === loginUserId
                }
            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                result: "fail",
                message: "서버 오류"
            });

        } finally {

            if (conn) {
                await conn.close();
            }
        }
    }
);



module.exports = router;
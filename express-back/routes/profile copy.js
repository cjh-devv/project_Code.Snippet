const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const db = require('../db');
const jwtAuthentication = require('../auth')
const path = require('path');

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


// 닉네임 중복 체크
router.get('/check-nickname', async (req, res) => {
    const { nickname } = req.query;
    let connection;

    if (!nickname || nickname.trim() === '') {
        return res.json({ isAvailable: false, message: "닉네임을 입력해주세요." });
    }

    try {
        connection = await db.getConnection();
        const result = await connection.execute(
            `SELECT COUNT(*) AS CNT FROM USERS WHERE NICKNAME = :nickname`,
            [nickname],
            { outFormat: db.OUT_FORMAT_OBJECT }
        );

        const count = result.rows.CNT;
        if (count > 0) {
            return res.json({ isAvailable: false, message: "이미 사용 중인 닉네임입니다." });
        } else {
            return res.json({ isAvailable: true, message: "사용 가능한 닉네임입니다." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    } finally {
        if (connection) await connection.close();
    }
});


// 통합 프로필 수정 (닉네임 단독 OR 이미지 동시 변경 처리)
router.post('/update', (req, res, next) => {
    // 멀터 파일 용량 초과 에러(LIMIT_FILE_SIZE) 미들웨어 핸들링
    upload.single('profileImg')(req, res, (err) => {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: "이미지 용량은 최대 5MB까지만 가능합니다." });
        } else if (err) {
            return res.status(500).json({ success: false, message: "파일 업로드 오류가 발생했습니다." });
        }
        next();
    });
}, jwtAuthentication, async (req, res) => {
    const userId = req.user.userId; // 인증 미들웨어에서 파싱된 토큰 유저 ID
    console.log(req.body);
    const { nickname, isDeleteImage } = req.body;
    let connection;

    if (!nickname || nickname.trim() === '') {
        return res.status(400).json({ success: false, message: "닉네임을 정상적으로 입력해주세요." });
    }

    try {
        connection = await db.getConnection();
        let host = `${req.protocol}://${req.get('host')}/`;

        // 기존 파일 영구 삭제 처리를 위한 올드 이미지 경로 조회
        let findResult = await connection.execute(
            `SELECT PROFILE_IMAGE FROM USERS WHERE USER_ID = :userId`,
            [userId],
            { outFormat: db.OUT_FORMAT_OBJECT }
        );
        let oldProfileImage = findResult.rows[0]?.PROFILE_IMAGE;

        // 사용자가 '기본 이미지로 변경' 버튼을 누른 경우
        if (isDeleteImage === 'true') {
            await connection.execute(
                `UPDATE USERS SET NICKNAME = :nickname, PROFILE_IMAGE = NULL WHERE USER_ID = :userId`,
                [nickname, userId],
                { autoCommit: true }
            );

            // 기존 물리 파일 서버에서 청소 지우기
            if (oldProfileImage && oldProfileImage.includes('uploads/profiles')) {
                const filename = oldProfileImage.substring(oldProfileImage.lastIndexOf('/') + 1);
                const oldFilePath = path.join('uploads', 'profiles', filename);

                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            return res.json({ success: true, message: "기본 프로필로 초기화되었습니다.", nickname, profileImage: null });
        }

        if (req.file) {
            // 사용자가 이미지를 새로 업로드 한 경우
            let dest = req.file.destination;
            if (!dest.endsWith('/')) dest += '/';
            if (dest.startsWith('/')) dest = dest.substring(1);

            let newImageUrl = host + req.file.destination + req.file.filename;

            await connection.execute(
                `UPDATE USERS SET NICKNAME = :nickname, PROFILE_IMAGE = :newImageUrl WHERE USER_ID = :userId`,
                [nickname, newImageUrl, userId],
                { autoCommit: true }
            );

            // 이전 이미지가 기본값이 아니고 uploads 폴더 내 파일이라면 물리 서버에서 삭제
            if (oldProfileImage && oldProfileImage.includes('uploads/profiles')) {
                // 전체 URL 주소에서 맨 마지막 '파일명.확장자'만
                const filename = oldProfileImage.substring(oldProfileImage.lastIndexOf('/') + 1);
                // 물리 폴더 위치인 'uploads/profiles/파일명' 경로 생성
                const oldFilePath = path.join('uploads', 'profiles', filename);

                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            return res.json({
                success: true,
                message: "프로필 정보와 이미지가 수정되었습니다.",
                nickname,
                profileImage: newImageUrl
            });

        } else {
            // 이미지 변경 없이 닉네임만 수정한 경우
            await connection.execute(
                `UPDATE USERS SET NICKNAME = :nickname WHERE USER_ID = :userId`,
                [nickname, userId],
                { autoCommit: true }
            );

            return res.json({
                success: true,
                message: "닉네임이 성공적으로 수정되었습니다.",
                nickname,
                profileImage: oldProfileImage // 기존 이미지 주소 그대로 반환
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;

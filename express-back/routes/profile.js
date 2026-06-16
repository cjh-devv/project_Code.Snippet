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
    console.log("요청 데이터:", req.body);
    const { nickname, isDeleteImage, bio } = req.body;
    let connection;

    if (!nickname || nickname.trim() === '') {
        return res.status(400).json({ success: false, message: "닉네임을 정상적으로 입력해주세요." });
    }

    try {
        connection = await db.getConnection();

        // 1. 경로 실수를 막기 위해 호스트 끝의 슬래시를 제거하고 표준화
        let host = `${req.protocol}://${req.get('host')}`;

        // 기존 파일 영구 삭제 처리를 위한 올드 이미지 경로 조회
        let findResult = await connection.execute(
            `SELECT PROFILE_IMAGE FROM USERS WHERE USER_ID = :userId`,
            [userId],
            { outFormat: db.OUT_FORMAT_OBJECT }
        );
        
        // 대소문자 및 배열/객체 형태를 모두 방어하는 안전한 추출 구조
        let oldProfileImage = null;
        if (findResult && findResult.rows && findResult.rows.length > 0) {
            const firstRow = findResult.rows[0];
            
            // 객체 형식일 때 (대문자 또는 소문자 체크)
            if (typeof firstRow === 'object' && !Array.isArray(firstRow)) {
                oldProfileImage = firstRow.PROFILE_IMAGE || firstRow.profile_image || firstRow.Profile_Image;
            } 
            // 배열 형식일 때 (outFormat이 적용 안 되었을 경우 0번째 인덱스)
            else if (Array.isArray(firstRow)) {
                oldProfileImage = firstRow[0];
            }
        }

        console.log("확인된 최종 oldProfileImage 값:", oldProfileImage);

        const deletePhysicalFile = (imageUrl) => {
            console.log("=== [삭제 디버깅 시작] ===");
            console.log("1. DB에서 가져온 원본 이미지 URL:", imageUrl);
            
            if (!imageUrl) {
                console.log("실패: 이미지 URL이 비어있거나 존재하지 않습니다.");
                return;
            }
            
            const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            console.log("2. URL에서 추출한 최종 파일명:", filename);

            const pathOption1 = path.resolve(__dirname, '..', 'uploads', 'profiles', filename);
            const pathOption2 = path.resolve(__dirname, '..', '..', 'uploads', 'profiles', filename);

            console.log("3. [경로 후보 1] 검사 중:", pathOption1);
            console.log("   후보 1 존재 여부:", fs.existsSync(pathOption1));

            console.log("4. [경로 후보 2] 검사 중:", pathOption2);
            console.log("   후보 2 존재 여부:", fs.existsSync(pathOption2));

            if (fs.existsSync(pathOption1)) {
                fs.unlinkSync(pathOption1);
                console.log("[성공] 후보 1 경로에서 파일을 찾아서 삭제했습니다.");
            } else if (fs.existsSync(pathOption2)) {
                fs.unlinkSync(pathOption2);
                console.log("[성공] 후보 2 경로에서 파일을 찾아서 삭제했습니다.");
            } else {
                console.log("[실패] 두 경로 모두에서 실제 파일을 찾지 못했습니다.");
            }
            console.log("=== [삭제 디버깅 종료] ===");
        };


        // 사용자가 '기본 이미지로 변경' 버튼을 누른 경우
        if (isDeleteImage === 'true') {
            await connection.execute(
                `UPDATE USERS SET NICKNAME = :nickname, BIO = :bio, PROFILE_IMAGE = NULL WHERE USER_ID = :userId`,
                [ nickname, bio, userId ],
                { autoCommit: true }
            );

            // 기존 물리 파일 서버에서 삭제
            deletePhysicalFile(oldProfileImage);

            return res.json({ success: true, message: "기본 프로필로 초기화되었습니다.", nickname, profileImage: null });
        }

        if (req.file) {
            // 사용자가 이미지를 새로 업로드 한 경우
            // 멀터 destination의 슬래시 유무 정돈
            let dest = req.file.destination;
            if (dest.startsWith('/')) dest = dest.substring(1);
            if (!dest.endsWith('/')) dest += '/';

            let newImageUrl = `${host}/${dest}${req.file.filename}`;

            await connection.execute(
                `UPDATE USERS SET NICKNAME = :nickname, PROFILE_IMAGE = :profileImageUrl, BIO = :bio WHERE USER_ID = :userId`,
                {
                    nickname: nickname,
                    profileImageUrl: newImageUrl, // 변수명 불일치 버그 해결
                    bio: bio,
                    userId: userId
                },
                { autoCommit: true }
            );

            // 이전 이미지가 존재한다면 물리 서버에서 삭제
            deletePhysicalFile(oldProfileImage);

            return res.json({
                success: true,
                message: "프로필 정보와 이미지가 수정되었습니다.",
                nickname,
                profileImage: newImageUrl
            });

        } else {
            // 이미지 변경 없이 닉네임만 수정한 경우
            await connection.execute(
                `UPDATE USERS SET NICKNAME = :nickname, BIO = :bio WHERE USER_ID = :userId`,
                [nickname, bio, userId],
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
        console.error("프로필 수정 중 서버 에러 발생:", err);
        res.status(500).send("Server Error");
    } finally {
        if (connection) await connection.close();
    }
});


module.exports = router;

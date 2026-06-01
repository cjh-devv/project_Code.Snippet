console.log("COMMENT ROUTER LOADED");
const express = require('express');
const oracledb = require('oracledb');
const router = express.Router();

const db = require('../db');
const jwtAuthentication = require('../auth');

router.post('/', jwtAuthentication, async (req, res) => {

    const { postId, content } = req.body;

    if (!postId || !content?.trim()) {
        return res.status(400).json({
            result: "fail",
            message: "댓글 내용을 입력하세요."
        });
    }

    let conn;

    try {

        const userId = req.user.userId;

        conn = await db.getConnection();

        // 존재하지 않는 게시글에 댓글 작성 방지
        const postCheck = await conn.execute(
            `
            SELECT POST_ID
            FROM POSTS
            WHERE POST_ID = :postId
            `,
            { postId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (postCheck.rows.length === 0) {
            return res.status(404).json({
                result: "fail",
                message: "게시글이 존재하지 않습니다."
            });
        }

        await conn.execute(
            `
            INSERT INTO COMMENTS
            (
                COMMENT_ID,
                POST_ID,
                USER_ID,
                CONTENT
            )
            VALUES
            (
                SEQ_COMMENTS.NEXTVAL,
                :postId,
                :userId,
                :content
            )
            `,
            {
                postId,
                userId,
                content
            },
            {
                autoCommit: true
            }
        );

        res.json({
            result: "success",
            message: "댓글 등록 완료"
        });

    } catch (error) {

        console.error('Error executing query', error);

        res.status(500).json({
            result: "fail",
            message: "서버 오류"
        });

    } finally {

        if (conn) {
            await conn.close();
        }

    }

});

router.get('/post/:postId', async (req, res) => {

    const { postId } = req.params;

    let conn;

    try {

        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT 
                c.COMMENT_ID,
                c.CONTENT,
                c.CREATED_AT,
                c.USER_ID
            FROM COMMENTS c
            WHERE c.POST_ID = :postId
            ORDER BY c.CREATED_AT DESC
            `,
            { postId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({
            result: "success",
            data: result.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            result: "fail",
            message: "댓글 조회 실패"
        });

    } finally {
        if (conn) await conn.close();
    }

});

router.put('/:commentId', jwtAuthentication, async (req, res) => {

    const { commentId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
        return res.status(400).json({
            result: "fail",
            message: "댓글 내용을 입력하세요."
        });
    }

    let conn;

    try {

        const userId = req.user.userId;

        conn = await db.getConnection();

        // 1. 댓글 존재 + 작성자 확인
        const commentCheck = await conn.execute(
            `
            SELECT USER_ID
            FROM COMMENTS
            WHERE COMMENT_ID = :commentId
            `,
            { commentId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (commentCheck.rows.length === 0) {
            return res.status(404).json({
                result: "fail",
                message: "댓글이 존재하지 않습니다."
            });
        }

        const commentOwner = commentCheck.rows[0].USER_ID;

        // 2. 작성자 검증
        if (commentOwner !== userId) {
            return res.status(403).json({
                result: "fail",
                message: "댓글 수정 권한이 없습니다."
            });
        }

        // 3. 업데이트
        await conn.execute(
            `
            UPDATE COMMENTS
            SET CONTENT = :content,
                UPDATED_AT = SYSDATE
            WHERE COMMENT_ID = :commentId
            `,
            {
                content,
                commentId
            },
            { autoCommit: true }
        );

        res.json({
            result: "success",
            message: "댓글 수정 완료"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            result: "fail",
            message: "서버 오류"
        });

    } finally {
        if (conn) await conn.close();
    }
});

router.delete('/:commentId', jwtAuthentication, async (req, res) => {
        console.log("DELETE HIT");
    const { commentId } = req.params;

    let conn;

    try {

        const userId = req.user.userId;

        conn = await db.getConnection();

        // 1. 댓글 존재 + 작성자 확인
        const commentCheck = await conn.execute(
            `
            SELECT USER_ID
            FROM COMMENTS
            WHERE COMMENT_ID = :commentId
            `,
            { commentId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (commentCheck.rows.length === 0) {
            return res.status(404).json({
                result: "fail",
                message: "댓글이 존재하지 않습니다."
            });
        }

        const commentOwner = commentCheck.rows[0].USER_ID;

        // 2. 권한 체크
        if (commentOwner !== userId) {
            return res.status(403).json({
                result: "fail",
                message: "댓글 삭제 권한이 없습니다."
            });
        }

        // 3. 삭제
        await conn.execute(
            `
            DELETE FROM COMMENTS
            WHERE COMMENT_ID = :commentId
            `,
            { commentId },
            { autoCommit: true }
        );

        res.json({
            result: "success",
            message: "댓글 삭제 완료"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            result: "fail",
            message: "서버 오류"
        });

    } finally {
        if (conn) await conn.close();
    }

});

module.exports = router;
const express = require("express");
const router = express.Router();
const jwtAuthentication = require('../auth')
const db = require("../db");
const oracledb = require("oracledb");

router.get("/followers", jwtAuthentication, async (req, res) => {

    const userId = req.user.userId;

    let conn;

    try {

        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                U.USER_ID,
                U.NICKNAME,
                U.PROFILE_IMAGE
            FROM FOLLOWS F
            JOIN USERS U
                ON F.FOLLOWER_ID = U.USER_ID
            WHERE F.FOLLOWING_ID = :userId
            `,
            { userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({
            result: "success",
            list: result.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            result: "fail"
        });

    } finally {

        if (conn) {
            await conn.close();
        }
    }
});

router.get("/followings", jwtAuthentication, async (req, res) => {

    const userId = req.user.userId;

    let conn;

    try {

        conn = await db.getConnection();

        const result = await conn.execute(
            `
            SELECT
                U.USER_ID,
                U.NICKNAME,
                U.PROFILE_IMAGE
            FROM FOLLOWS F
            JOIN USERS U
                ON F.FOLLOWING_ID = U.USER_ID
            WHERE F.FOLLOWER_ID = :userId
            `,
            { userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({
            result: "success",
            list: result.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            result: "fail"
        });

    } finally {

        if (conn) {
            await conn.close();
        }
    }
});

router.post(
    "/:userId/follow",
    jwtAuthentication,
    async (req, res) => {

        const followerId = req.user.userId;
        const followingId = req.params.userId;

        let conn;

        try {

            if (followerId === followingId) {
                return res.status(400).json({
                    result: "fail",
                    message: "자기 자신은 팔로우할 수 없습니다."
                });
            }

            conn = await db.getConnection();

            const exists = await conn.execute(
                `
                SELECT 1
                FROM FOLLOWS
                WHERE FOLLOWER_ID = :followerId
                AND FOLLOWING_ID = :followingId
                `,
                {
                    followerId,
                    followingId
                },
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT
                }
            );

            if (exists.rows.length > 0) {
                return res.status(409).json({
                    result: "fail",
                    message: "이미 팔로우한 사용자입니다."
                });
            }

            await conn.execute(
                `
                INSERT INTO FOLLOWS (
                    FOLLOWER_ID,
                    FOLLOWING_ID
                )
                VALUES (
                    :followerId,
                    :followingId
                )
                `,
                {
                    followerId,
                    followingId
                },
                {
                    autoCommit: true
                }
            );

            return res.json({
                result: "success",
                message: "팔로우 완료"
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

router.delete(
    "/:userId/follow",
    jwtAuthentication,
    async (req, res) => {

        const followerId = req.user.userId;
        const followingId = req.params.userId;

        let conn;

        try {

            conn = await db.getConnection();

            await conn.execute(
                `
                DELETE FROM FOLLOWS
                WHERE FOLLOWER_ID = :followerId
                AND FOLLOWING_ID = :followingId
                `,
                {
                    followerId,
                    followingId
                },
                {
                    autoCommit: true
                }
            );

            return res.json({
                result: "success",
                message: "언팔로우 완료"
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

// router.get("/followers", jwtAuthentication, getUserProfile);

// router.get("/followings", jwtAuthentication, getUserProfile);

module.exports = router;
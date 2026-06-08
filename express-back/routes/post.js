const express = require('express');
const oracledb = require('oracledb');
const db = require("../db");
const router = express.Router();
const jwtAuthentication = require('../auth')

router.post('/', jwtAuthentication, async (req, res) => {

    const { title, content, codeBlock, tags = [] } = req.body;

    if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({
            result: "fail",
            message: "제목과 내용을 입력하세요."
        });
    }

    let conn;

    try {

        const userId = req.user.userId;

        conn = await db.getConnection();

        // 1. 게시글 INSERT + POST_ID 받기
        const postResult = await conn.execute(
            `
            INSERT INTO POSTS (
                POST_ID,
                TITLE,
                USER_ID,
                CONTENT,
                CODE_BLOCK,
                CREATED_AT
            )
            VALUES (
                SEQ_POSTS.NEXTVAL,
                :title,
                :userId,
                :content,
                :codeBlock,
                SYSDATE
            )
            RETURNING POST_ID INTO :postId
            `,
            {
                userId,
                title,
                content,
                codeBlock,
                postId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: false }
        );

        const postId = postResult.outBinds.postId[0];

        // 2. 태그 처리
        for (let tag of tags) {

            const result = await conn.execute(
                `SELECT TAG_ID FROM TAGS WHERE TAG_NAME = :tag`,
                { tag },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            let tagId;

            if (result.rows.length === 0) {
                const insert = await conn.execute(
                    `
                    INSERT INTO TAGS (TAG_ID, TAG_NAME)
                    VALUES (SEQ_TAGS.NEXTVAL, :tag)
                    RETURNING TAG_ID INTO :id
                    `,
                    {
                        tag,
                        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                    }
                );

                tagId = insert.outBinds.id[0];

            } else {
                tagId = result.rows[0].TAG_ID;
            }

            await conn.execute(
                `
                INSERT INTO POST_TAGS (POST_TAG_ID, POST_ID, TAG_ID)
                VALUES (SEQ_POST_TAGS.NEXTVAL, :postId, :tagId)
                `,
                { postId, tagId }
            );
        }

        // 3. commit
        await conn.commit();

        res.json({
            result: "success",
            message: "게시글 + 태그 저장 완료",
            postId
        });

    } catch (error) {

        console.error(error);

        if (conn) {
            await conn.rollback();
        }

        res.status(500).json({
            result: "fail",
            message: "서버 오류"
        });

    } finally {
        if (conn) await conn.close();
    }
});

//내가 쓴 글 만 조회
router.get('/', jwtAuthentication, async (req, res) => {

    let conn;
    try {
        const userId = req.user.userId;
        conn = await db.getConnection();
        let result = await conn.execute(
            `SELECT * FROM POSTS WHERE USER_ID = :userId`,
            [userId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log(result.rows)
        res.json({
            result: "success",
            list: result.rows
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

//마이페이지 내가쓴글 조회
router.get('/mypost', jwtAuthentication, async (req, res) => {

    let conn;
    try {
        const userId = req.user.userId;
        conn = await db.getConnection();
        let result = await conn.execute(
            `SELECT
             P.POST_ID,
             P.TITLE,
             P.CREATED_AT,
             P.CODE_BLOCK,
             -- 좋아요 수
                (SELECT COUNT(*)
                 FROM POST_LIKES L
                 WHERE L.POST_ID = P.POST_ID) AS LIKE_COUNT,

                 -- 북마크 수
                 (SELECT COUNT(*)
                 FROM BOOKMARKS B
                 WHERE B.POST_ID = P.POST_ID) AS BOOKMARK_COUNT,

                -- 댓글 수
                (SELECT COUNT(*)
                 FROM COMMENTS C
                 WHERE C.POST_ID = P.POST_ID) AS COMMENT_COUNT
             FROM POSTS P WHERE USER_ID = :userId
             ORDER BY POST_ID DESC
             `,
            { userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log(result.rows)
        res.json({
            result: "success",
            list: result.rows
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

router.get('/feed', jwtAuthentication, async (req, res) => {
    console.log("FEED API HIT");
    let conn;

    try {

        const userId = req.user.userId;
        console.log("FEED API HIT");
        // 1. pagination
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const offset = (page - 1) * size;

        conn = await db.getConnection();
        console.log("DB CONNECT OK");
        // 2. 게시글 + 좋아요 + 댓글 + isLiked
        const result = await conn.execute(
            `
            SELECT
                P.POST_ID,
                P.USER_ID,
                P.TITLE,
                P.CONTENT,
                P.CODE_BLOCK,
                P.CREATED_AT,
                P.UPDATED_AT,

                -- 좋아요 수
                (SELECT COUNT(*)
                 FROM POST_LIKES L
                 WHERE L.POST_ID = P.POST_ID) AS LIKE_COUNT,
                -- 북마크 수
                 (SELECT COUNT(*)
                 FROM BOOKMARKS B
                 WHERE B.POST_ID = P.POST_ID) AS BOOKMARK_COUNT,
                -- 댓글 수
                (SELECT COUNT(*)
                 FROM COMMENTS C
                 WHERE C.POST_ID = P.POST_ID) AS COMMENT_COUNT,

                -- 내가 좋아요 눌렀는지
                (SELECT COUNT(*)
                 FROM POST_LIKES L2
                 WHERE L2.POST_ID = P.POST_ID
                 AND L2.USER_ID = :userId) AS IS_LIKED,

             -- 내가 북마크 눌렀는지 (1이면 참, 0이면 거짓)
                (SELECT COUNT(*)
                 FROM BOOKMARKS B
                 WHERE B.POST_ID = P.POST_ID
                   AND B.USER_ID = :userId) AS IS_BOOKMARKED,
                   
                (SELECT PROFILE_IMAGE
                FROM USERS U
                WHERE U.USER_ID = P.USER_ID
                AND U.USER_ID = :userId) AS PROFILE_IMAGE
                
            FROM POSTS P
            ORDER BY P.CREATED_AT DESC
            OFFSET :offsetVal ROWS
            FETCH NEXT :sizeVal ROWS ONLY
            `,
            {
                userId,
                offsetVal: offset,
                sizeVal: size
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const posts = result.rows;

        // 3. 전체 개수
        const totalResult = await conn.execute(
            `
            SELECT COUNT(*) AS TOTAL
            FROM POSTS
            `,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const total = totalResult.rows[0].TOTAL;

        // 4. 태그 전체 조회 (N+1 방지)
        const tagResult = await conn.execute(
            `
            SELECT 
                PT.POST_ID,
                T.TAG_NAME
            FROM POST_TAGS PT
            JOIN TAGS T ON PT.TAG_ID = T.TAG_ID
            `,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // 5. tag mapping
        const tagMap = {};

        tagResult.rows.forEach(row => {
            if (!tagMap[row.POST_ID]) {
                tagMap[row.POST_ID] = [];
            }
            tagMap[row.POST_ID].push(row.TAG_NAME);
        });

        // 6. 최종 feed 조립
        const feed = posts.map(post => ({
            ...post,
            IS_LIKED: post.IS_LIKED > 0,
            TAGS: tagMap[post.POST_ID] || []
        }));
        console.log(posts[0])
        // 7. response
        res.json({
            result: "success",
            data: {
                list: feed,
                pagination: {
                    page,
                    size,
                    total,
                    totalPages: Math.ceil(total / size)
                }
            }
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            result: "fail",
            message: "feed 조회 실패"
        });

    } finally {

        if (conn) await conn.close();

    }

});

router.get('/search', async (req, res) => {

    const { keyword, tag } = req.query;

    let conn;

    try {

        conn = await db.getConnection();

        let sql = `
            SELECT DISTINCT p.*
            FROM POSTS p
            LEFT JOIN POST_TAGS pt ON p.POST_ID = pt.POST_ID
            LEFT JOIN TAGS t ON pt.TAG_ID = t.TAG_ID
            WHERE 1=1
        `;

        let binds = {};

        // 1. keyword 검색 (제목 + 내용)
        if (keyword?.trim()) {
            sql += `
                AND (
                    p.TITLE LIKE :keyword
                    OR p.CONTENT LIKE :keyword
                    OR t.TAG_NAME LIKE :keyword
                )
            `;
            binds.keyword = `%${keyword?.trim()}%`;
        }

        // 2. tag 검색
        if (tag) {
            sql += `
                AND LOWER(t.TAG_NAME) LIKE LOWER(:tag)
            `;
            binds.tag = `%${tag}%`;
        }

        sql += ` ORDER BY p.POST_ID DESC`;

        const result = await conn.execute(
            sql,
            binds,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({
            result: "success",
            count: result.rows.length,
            data: result.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            result: "fail",
            message: "검색 실패"
        });

    } finally {
        if (conn) await conn.close();
    }

});

// 북마크 목록 조회 
router.get('/my-bookmarks', jwtAuthentication, async (req, res) => {
    const userId = req.user.userId; // 로그인한 유저 ID 자동 추출
    let conn;

    try {
        conn = await db.getConnection();

        // 사용자가 북마크한 게시글 목록 조회 (최신 북마크 순 정렬)
        const result = await conn.execute(
            `
            SELECT 
                B.BOOKMARK_ID,
                B.CREATED_AT AS BOOKMARKED_AT,
                P.POST_ID,
                P.TITLE,
                P.CONTENT,
                P.USER_ID AS AUTHOR_ID,
                P.CREATED_AT AS POST_CREATED_AT
            FROM BOOKMARKS B
            JOIN POSTS P ON B.POST_ID = P.POST_ID
            WHERE B.USER_ID = :userId
            ORDER BY B.CREATED_AT DESC
            `,
            { userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({
            result: "success",
            count: result.rows.length,
            list: result.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            result: "fail",
            message: "서버 오류로 북마크 목록을 가져오지 못했습니다."
        });
    } finally {
        if (conn) await conn.close();
    }
});


router.get('/:postId', async (req, res) => {
    console.log("🔥 POST DETAIL ROUTE HIT");   // ← 여기

    console.log("req.params:", req.params);    // ← 여기

    console.log("postId type:", typeof req.params.postId);
    console.log("postId value:", req.params.postId);
    const { postId } = req.params;
    if (isNaN(postId)) {
        return res.status(400).json({
            result: "fail",
            message: "잘못된 게시글 ID"
        });
    }
    let conn;
    try {
        conn = await db.getConnection();
        const result = await conn.execute(
            `SELECT * FROM POSTS WHERE POST_ID = :postId`,
            { postId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        console.log(result.rows)
        if (result.rows.length == 0) {
            return res.status(404).json({
                result: "fail",
                message: "게시글이 존재하지 않습니다."
            });
        }
        res.json({
            result: "success",
            info: result.rows[0],
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

//글 댓글 태그조회 좋아요눌렀는지
router.get('/:postId/detail', jwtAuthentication, async (req, res) => {
    const userId = req.user.userId;
    const { postId } = req.params;

    let conn;

    try {

        conn = await db.getConnection();

        // 1. 게시글 조회
        const postResult = await conn.execute(
            `
            SELECT 
                P.POST_ID,
                P.TITLE,
                P.CONTENT,
                P.CODE_BLOCK,
                P.USER_ID,
                P.CREATED_AT,
                (SELECT COUNT(*) 
                FROM POST_LIKES L 
                WHERE L.POST_ID = P.POST_ID) AS LIKE_COUNT,
                (SELECT COUNT(*)
                 FROM COMMENTS C
                 WHERE C.POST_ID = P.POST_ID) AS COMMENT_COUNT,
                 -- 북마크 수
                 (SELECT COUNT(*)
                 FROM BOOKMARKS B
                 WHERE B.POST_ID = P.POST_ID) AS BOOKMARK_COUNT,
                (SELECT COUNT(*)
                 FROM POST_LIKES L2
                 WHERE L2.POST_ID = P.POST_ID
                 AND L2.USER_ID = :userId) AS IS_LIKED,
               -- 내가 북마크 눌렀는지 (1이면 참, 0이면 거짓)
                (SELECT COUNT(*)
                 FROM BOOKMARKS B
                 WHERE B.POST_ID = P.POST_ID
                   AND B.USER_ID = :userId) AS IS_BOOKMARKED
            FROM POSTS P
            WHERE P.POST_ID = :postId
            `,
            { postId, userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (postResult.rows.length === 0) {
            return res.status(404).json({
                result: "fail",
                message: "게시글이 존재하지 않습니다."
            });
        }

        const post = postResult.rows[0];

        // 2. 댓글 조회
        const commentResult = await conn.execute(
            `
            SELECT 
                COMMENT_ID,
                CONTENT,
                USER_ID,
                CREATED_AT
            FROM COMMENTS
            WHERE POST_ID = :postId
            ORDER BY CREATED_AT DESC
            `,
            { postId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const comments = commentResult.rows;

        // 3. 태그 조회
        const tagResult = await conn.execute(
            `
                SELECT T.TAG_NAME
                FROM TAGS T
                JOIN POST_TAGS PT ON T.TAG_ID = PT.TAG_ID
                WHERE PT.POST_ID = :postId
            `,
            { postId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const tags = tagResult.rows.map(t => t.TAG_NAME);

        // 4. 좋아요 눌렀는지
        const isLikedResult = await conn.execute(
            `
            SELECT COUNT(*) AS IS_LIKED
            FROM POST_LIKES
            WHERE 
            POST_ID = :postId
            AND USER_ID = :userId
            `,
            { postId, userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const IS_LIKED = (isLikedResult.rows[0]?.IS_LIKED || 0) > 0;

        // 5. 합쳐서 반환
        res.json({
            result: "success",
            data: {
                post: {
                    ...post,
                    TAGS: tags || [],
                    IS_LIKED
                },
                comments
            }
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

router.put('/:postId', jwtAuthentication, async (req, res) => {
    const userId = req.user.userId;

    const { postId } = req.params;
    const { title, content, codeBlock } = req.body;

    let conn;
    try {
        conn = await db.getConnection();
        const postResult = await conn.execute(
            `
                SELECT USER_ID
                FROM POSTS
                WHERE POST_ID = :postId
            `,
            [postId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (postResult.rows.length == 0) {
            return res.status(404).json({
                result: "fail",
                message: "게시글이 존재하지 않습니다."
            });
        }

        if (postResult.rows[0].USER_ID != userId) {
            return res.status(403).json({
                result: "fail",
                message: "수정 권한이 없습니다."
            });
        }

        let result = await conn.execute(
            `
            UPDATE POSTS SET
            TITLE = :title,
            CONTENT = :content,
            CODE_BLOCK = :codeBlock,
            UPDATED_AT = SYSDATE
            WHERE POST_ID = :postId
            `,
            { title, content, codeBlock, postId },
            { autoCommit: true }
        );

        if (result.rowsAffected == 0) {
            return res.status(500).json({
                result: "fail",
                message: "수정 실패"
            });
        }

        res.json({
            result: "success",
            message: "수정 성공!"
        })

    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Error executing query');
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});

router.delete('/:postId', jwtAuthentication, async (req, res) => {
    const userId = req.user.userId;
    const { postId } = req.params;

    let conn;

    try {
        conn = await db.getConnection();

        const postResult = await conn.execute(
            `
                SELECT USER_ID
                FROM POSTS
                WHERE POST_ID = :postId
            `,
            [postId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (postResult.rows.length == 0) {
            return res.status(404).json({
                result: "fail",
                message: "게시글이 존재하지 않습니다."
            });
        }

        if (postResult.rows[0].USER_ID != userId) {
            return res.status(403).json({
                result: "fail",
                message: "삭제 권한이 없습니다."
            });
        }

        const result = await conn.execute(
            `
        DELETE FROM POSTS WHERE POST_ID = :postId
      `,
            [postId],
            { autoCommit: true }
        );

        if (result.rowsAffected == 0) {
            return res.status(500).json({
                result: "fail",
                message: "삭제 실패"
            });
        }

        res.json({
            result: "success",
            message: "삭제 성공!"
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

router.post('/:postId/like', jwtAuthentication, async (req, res) => {

    const { postId } = req.params;
    const userId = req.user.userId;

    let conn;

    try {

        conn = await db.getConnection();

        await conn.execute(
            `
            INSERT INTO POST_LIKES (
                LIKE_ID,
                POST_ID,
                USER_ID
            )
            VALUES (
                SEQ_POST_LIKES.NEXTVAL,
                :postId,
                :userId
            )
            `,
            { postId, userId },
            { autoCommit: true }
        );

        res.json({
            result: "success",
            message: "좋아요 완료"
        });

    } catch (err) {

        // 중복 좋아요 처리
        if (err.code === 'ORA-00001') {
            return res.status(400).json({
                result: "fail",
                message: "이미 좋아요를 눌렀습니다."
            });
        }

        console.error(err);

        res.status(500).json({
            result: "fail",
            message: "서버 오류"
        });

    } finally {
        if (conn) await conn.close();
    }

});

router.delete('/:postId/like', jwtAuthentication, async (req, res) => {

    const { postId } = req.params;
    const userId = req.user.userId;

    let conn;

    try {

        conn = await db.getConnection();

        await conn.execute(
            `
            DELETE FROM POST_LIKES
            WHERE POST_ID = :postId
              AND USER_ID = :userId
            `,
            { postId, userId },
            { autoCommit: true }
        );

        res.json({
            result: "success",
            message: "좋아요 취소 완료"
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

router.post('/:postId/like/toggle', jwtAuthentication, async (req, res) => {

    const { postId } = req.params;
    const userId = req.user.userId;

    let conn;

    try {

        conn = await db.getConnection();

        // 1. 기존 좋아요 존재 확인
        const check = await conn.execute(
            `
            SELECT LIKE_ID
            FROM POST_LIKES
            WHERE POST_ID = :postId
              AND USER_ID = :userId
            `,
            { postId, userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // 2. 이미 좋아요 있음 → 삭제
        if (check.rows.length > 0) {

            await conn.execute(
                `
                DELETE FROM POST_LIKES
                WHERE POST_ID = :postId
                  AND USER_ID = :userId
                `,
                { postId, userId },
                { autoCommit: true }
            );

            return res.json({
                result: "success",
                action: "unlike",
                message: "좋아요 취소"
            });
        }

        // 3. 없으면 추가
        await conn.execute(
            `
            INSERT INTO POST_LIKES (
                LIKE_ID,
                POST_ID,
                USER_ID
            )
            VALUES (
                SEQ_POST_LIKES.NEXTVAL,
                :postId,
                :userId
            )
            `,
            { postId, userId },
            { autoCommit: true }
        );

        res.json({
            result: "success",
            action: "like",
            message: "좋아요 완료"
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

router.post('/:postId/bookmark/toggle', jwtAuthentication, async (req, res) => {

    const { postId } = req.params;
    const userId = req.user.userId; // 로그인한 유저 ID 자동 추출

    let conn;

    try {
        conn = await db.getConnection();

        // 1. 기존 북마크 존재 확인
        const check = await conn.execute(
            `
            SELECT BOOKMARK_ID
            FROM BOOKMARKS
            WHERE POST_ID = :postId
              AND USER_ID = :userId
            `,
            { postId, userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // 2. 이미 북마크 있음 → 취소(삭제)
        if (check.rows.length > 0) {
            await conn.execute(
                `
                DELETE FROM BOOKMARKS
                WHERE POST_ID = :postId
                  AND USER_ID = :userId
                `,
                { postId, userId },
                { autoCommit: true }
            );

            return res.json({
                result: "success",
                action: "unbookmark",
                message: "북마크 취소 완료"
            });
        }

        // 3. 없으면 추가 (BOOKMARK_ID는 IDENTITY이므로 INSERT 시 생략 가능)
        await conn.execute(
            `
            INSERT INTO BOOKMARKS (
                POST_ID,
                USER_ID
            )
            VALUES (
                :postId,
                :userId
            )
            `,
            { postId, userId },
            { autoCommit: true }
        );

        res.json({
            result: "success",
            action: "bookmark",
            message: "북마크 등록 완료"
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
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Box,
    Chip,
    Divider,
    IconButton,
    Avatar,
    List,
    ListItem,
    TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import React, { useState, useEffect } from 'react';
import Tooltip from '@mui/material/Tooltip';


function PostDetailModal({ open, onClose, feed, refreshFeed }) {
    console.log(feed);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const [likeInfo, setLikeInfo] = useState({
        IS_LIKED: feed?.IS_LIKED,
        LIKE_COUNT: feed?.LIKE_COUNT
    });
    useEffect(() => {
        if (feed) {
            setLikeInfo({
                IS_LIKED: feed.IS_LIKED,
                LIKE_COUNT: feed.LIKE_COUNT
            });
        }
    }, [feed]);

    const loadComments = () => {

        fetch(`http://localhost:3010/comment/post/${feed.POST_ID}`)
            .then(res => res.json())
            .then(data => {
                setComments(data.data);
            })
            .catch(err => {
                alert("댓글 조회 실패");
            });

    };
    useEffect(() => {
        if (open && feed?.POST_ID) {
            loadComments();
        }
    }, [open, feed]);

    const handleAddComment = () => {

        if (!newComment.trim()) return;

        fetch("http://localhost:3010/comment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                postId: feed.POST_ID,
                content: newComment
            })
        })
            .then(res => res.json())
            .then(data => {

                if (data.result === "success") {

                    setNewComment("");
                    loadComments(); // 다시 DB 조회
                }

            });

    };

    // 게시글 삭제
    const handleDelete = () => {

        if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

        fetch("http://localhost:3010/post/" + feed.POST_ID, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                onClose();
                refreshFeed(); // feed 다시 로딩
            })
            .catch(err => {
                alert("서버 에러 발생!");
            });
    };

    //좋아요 토글
    const handleLike = () => {
        fetch(
            `http://localhost:3010/post/${feed.POST_ID}/like/toggle`,
            {
                method: "POST",
                headers: {
                    "Authorization":
                        "Bearer " + localStorage.getItem("token")
                }
            }
        )
            .then(res => res.json())
            .then(data => {

                refreshFeed();

                setLikeInfo(prev => ({
                    ...prev,
                    IS_LIKED: !prev.IS_LIKED,
                    LIKE_COUNT:
                        prev.LIKE_COUNT +
                        (prev.IS_LIKED ? -1 : 1)
                }));

            });

    };

    // 댓삭
    const handleDeleteComment = (commentId) => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
            fetch(
                `http://localhost:3010/comment/${commentId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization":
                            "Bearer " + localStorage.getItem("token")
                    }
                }
            )
                .then(res => res.json())
                .then(data => {
                    loadComments();
                });
        };
    };

    //댓 수정
    const handleEditCommentStart = (c) => {
        setEditingCommentId(c.COMMENT_ID);
        setEditContent(c.CONTENT);
    }
    //댓 수정저장
    const handleEditCommentSave = (commentId) => {

        fetch(
            `http://localhost:3010/comment/${commentId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    content: editContent
                })
            }
        )
            .then(res => res.json())
            .then(data => {

                loadComments();

                setEditingCommentId(null);
                setEditContent("");

            });

    };

    // 댓 수정 취소
    const handleEditCommentCancel = () => {
        setEditingCommentId(null);
        setEditContent("");
    };

    // 복사 버튼 부분
    // 복사 완료 문구 표시를 위한 state
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = async (textToCopy) => {
        try {
            // 클립보드 API
            await navigator.clipboard.writeText(textToCopy);

            // 복사 성공 시 2초간 버튼 텍스트 변경
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("복사 실패:", err);
            alert("복사에 실패했습니다.");
        }
    };

    if (!feed) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >

            <DialogTitle sx={{ fontWeight: "bold" }}>
                {feed?.TITLE}

                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 10, top: 10 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>

                <Box sx={{ p: 2 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        by {feed?.USER_ID} · {new Date(feed?.CREATED_AT).toLocaleString('ko-KR')}
                    </Typography>
                    <Typography sx={{ mt: 2, whiteSpace: "pre-line" }}>
                        {feed?.CONTENT}
                    </Typography>

                    {feed?.CODE_BLOCK && (
                        <Box
                            sx={{
                                position: "relative", // 복사 버튼의 기준점
                                mt: 2,
                                p: 2,
                                pt: 4, // 우상단 버튼과 글자가 안 겹치게 패딩 탑
                                bgcolor: "#f6f8fa",
                                borderRadius: 2,
                                fontFamily: "monospace",
                                fontSize: 13,
                                overflowX: "auto",
                                whiteSpace: "pre-line"
                            }}
                        >
                            {/* 코드 본문 */}
                            {feed.CODE_BLOCK}

                            {/* 우측 상단 고정 복사 버튼 */}
                            <Box sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                            }}>
                                <Tooltip title={isCopied ? "복사 완료!" : "복사하기"} placement="top">
                                    <IconButton
                                        onClick={() => {
                                            handleCopy(feed.CODE_BLOCK);
                                        }}
                                        size="small"
                                        color={isCopied ? "success" : "default"}
                                        sx={{
                                            backgroundColor: "rgba(255, 255, 255, 0.8)", // 살짝 배경을 넣어 코드와 구별
                                            "&:hover": {
                                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                            },
                                            boxShadow: "0 1px 3px rgba(0,0,0,1)", // 가벼운 그림자 효과
                                            p: 0.5 // 패딩을 더 줄여 버튼 크기를 최소화
                                        }}
                                    >
                                        {isCopied ? (
                                            <CheckIcon sx={{ fontSize: 16 }} /> // 아이콘 크기도 숫자로 더 미세하게 조절
                                        ) : (
                                            <ContentCopyIcon sx={{ fontSize: 16 }} />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    )}

                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                    {feed?.TAGS?.map((tag) => (
                        <Chip
                            key={tag}
                            label={`#${tag}`}
                            size="small"
                        />
                    ))}
                </Box>
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2,
                    py: 1,
                    mt: 2
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton
                            aria-label="like"
                            onClick={handleLike}
                            sx={{ color: likeInfo?.IS_LIKED ? "error.main" : "text.secondary" }}
                        >
                            {likeInfo?.IS_LIKED ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                        <Typography variant="h6">
                            {likeInfo?.LIKE_COUNT}
                        </Typography>
                    </Box>

                </Box>
                <Box sx={{ p: 2 }}>

                    <Typography
                        variant="h6"
                        sx={{ mb: 2 }}
                    >
                        댓글 ({comments.length})
                    </Typography>

                    <List
                        sx={{
                            maxHeight: 300,
                            overflowY: "auto"
                        }}>
                        {comments.map((c) => (
                            <ListItem
                                key={c.COMMENT_ID}
                                alignItems="flex-start"
                                sx={{
                                    display: "block",
                                    borderBottom: "1px solid #f0f0f0",
                                    py: 1
                                }}
                            >

                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Avatar sx={{ width: 28, height: 28 }}>
                                        {c.USER_ID?.charAt(0).toUpperCase()}
                                    </Avatar>

                                    <Typography fontWeight="bold" fontSize={13}>
                                        {c.USER_ID}
                                    </Typography>
                                </Box>

                                {editingCommentId === c.COMMENT_ID ? (

                                    <>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            sx={{ mt: 1 }}
                                        />

                                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                            <Button size="small" variant="contained"
                                                onClick={() => handleEditCommentSave(c.COMMENT_ID)}
                                            >
                                                저장
                                            </Button>

                                            <Button size="small"
                                                onClick={handleEditCommentCancel}
                                            >
                                                취소
                                            </Button>
                                        </Box>
                                    </>

                                ) : (

                                    <>
                                        <Typography sx={{ mt: 1, fontSize: 14 }}>
                                            {c.CONTENT}
                                        </Typography>

                                        {decoded.userId === c.USER_ID && (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "flex-end",
                                                    gap: 1,
                                                    mt: 1
                                                }}
                                            >
                                                <Button size="small" onClick={() => handleEditCommentStart(c)}>수정</Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteComment(c.COMMENT_ID)}
                                                >
                                                    삭제
                                                </Button>
                                            </Box>
                                        )}
                                    </>
                                )}
                            </ListItem>
                        ))}
                    </List>

                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="댓글을 입력하세요"
                        />

                        <Button
                            variant="contained"
                            onClick={handleAddComment}
                        >
                            등록
                        </Button>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions>

                {decoded.userId === feed?.USER_ID && (
                    <Box>
                        <Button
                            onClick={() =>
                                navigate(`/edit/${feed.POST_ID}`)
                            }
                        >
                            수정
                        </Button>
                        <Button color="error" onClick={handleDelete}>
                            삭제
                        </Button>
                    </Box>
                )}

                <Button onClick={onClose}>
                    닫기
                </Button>

            </DialogActions>

        </Dialog>
    );
}

export default PostDetailModal;
import React, { useState } from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Button,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    TextField,
    Chip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

import CloseIcon from '@mui/icons-material/Close';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export default function PostCard({ feed, refreshFeed }) {

    const [open, setOpen] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");

    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);

    const navigate = useNavigate();

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

    // Dialog 열릴 때 호출
    const handleOpen = () => {
        console.log("🔥 CLICKED FEED OBJECT:", feed);  // ← 여기

        console.log("🔥 POST_ID:", feed.POST_ID);     // ← 여기

        setSelectedFeed(feed);
        setOpen(true);

        loadComments(); // DB에서 가져오기
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedFeed(null);
        setComments([]);
    };

    // 댓글 추가
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
                handleClose();
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

                setSelectedFeed(prev => ({
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

    return (
        <>
            {/* 카드 */}
            <Card
                onClick={handleOpen}
                sx={{
                    cursor: "pointer",
                    borderRadius: 3,
                    overflow: "hidden",
                    height: "100%",
                    transition: "0.2s",
                    borderRadius: 3,

                    "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: 6
                    }
                }}
            >
                <CardContent>

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                    >
                        {feed.TITLE}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 1,
                            minHeight: 40
                        }}
                    >
                        {feed.CONTENT?.slice(0, 80)}
                        {feed.CONTENT?.length > 80 ? "..." : ""}
                    </Typography>

                    {feed.CODE_BLOCK && (
                        <Box
                            sx={{
                                mt: 2,
                                p: 1.5,
                                bgcolor: "#f6f8fa",
                                borderRadius: 2,
                                fontFamily: "monospace",
                                fontSize: 12,
                                maxHeight: 80,
                                overflow: "hidden"
                            }}
                        >
                            {feed.CODE_BLOCK.slice(0, 100)}
                            {feed.CODE_BLOCK.length > 100 ? "..." : ""}
                        </Box>
                    )}

                    <Box
                        sx={{
                            mt: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2
                            }}
                        >
                            <Typography fontSize={14}>
                                ❤️ {feed.LIKE_COUNT}
                            </Typography>

                            <Typography fontSize={14}>
                                💬 {feed.COMMENT_COUNT}
                            </Typography>

                        </Box>

                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                by {feed.USER_ID}
                            </Typography>
                            {" · "}
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {new Date(feed.CREATED_AT)
                                    .toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            mt: 1,
                            display: "flex",
                            gap: 0.5,
                            flexWrap: "wrap"
                        }}
                    >
                        {feed.TAGS?.slice(0, 3).map(tag => (
                            <Chip
                                key={tag}
                                label={`#${tag}`}
                                size="small"
                            />
                        ))}
                    </Box>
                </CardContent>

            </Card>

            {/* Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="md"
            >

                <DialogTitle sx={{ fontWeight: "bold" }}>
                    {selectedFeed?.TITLE}

                    <IconButton
                        onClick={handleClose}
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
                            by {selectedFeed?.USER_ID} · {new Date(selectedFeed?.CREATED_AT).toLocaleString('ko-KR')}
                        </Typography>
                        <Typography sx={{ mt: 2, whiteSpace: "pre-line" }}>
                            {selectedFeed?.CONTENT}
                        </Typography>

                        {selectedFeed?.CODE_BLOCK && (
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    bgcolor: "#f6f8fa",
                                    borderRadius: 2,
                                    fontFamily: "monospace",
                                    fontSize: 13,
                                    overflowX: "auto",
                                    whiteSpace: "pre-line"
                                }}
                            >
                                {selectedFeed.CODE_BLOCK}
                            </Box>
                        )}

                    </Box>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                        {selectedFeed?.TAGS?.map((tag) => (
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
                                sx={{ color: selectedFeed?.IS_LIKED ? "error.main" : "text.secondary" }}
                            >
                                {selectedFeed?.IS_LIKED ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            </IconButton>
                            <Typography variant="h6">
                                {selectedFeed?.LIKE_COUNT}
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

                    {decoded.userId === selectedFeed?.USER_ID && (
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

                    <Button onClick={handleClose}>
                        닫기
                    </Button>

                </DialogActions>

            </Dialog>
        </>
    );
}
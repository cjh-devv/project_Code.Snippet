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
    TextField
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import { jwtDecode } from 'jwt-decode';

export default function PostCard({ feed, refreshFeed }) {

    const [open, setOpen] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");

    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);

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

    return (
        <>
            {/* 카드 */}
            <Card onClick={handleOpen} style={{ cursor: 'pointer' }}>

                <CardMedia
                    component="img"
                    height="200"
                    image={feed.IMGPATH}
                    alt="이미지 없음"
                />

                <CardContent>
                    <Typography variant="body2">
                        {feed.TITLE}
                    </Typography>
                </CardContent>

            </Card>

            {/* Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="lg"
            >

                <DialogTitle>
                    {selectedFeed?.TITLE}

                    <IconButton
                        onClick={handleClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ display: 'flex' }}>

                    {/* 왼쪽 */}
                    <Box sx={{ flex: 1, p: 2 }}>

                        <Typography variant="h5">
                            {selectedFeed?.TITLE}
                        </Typography>

                        <Typography sx={{ mt: 2 }}>
                            {selectedFeed?.CONTENT}
                        </Typography>

                        {selectedFeed?.CODE_BLOCK && (
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    bgcolor: "#f5f5f5",
                                    borderRadius: 2,
                                    fontFamily: "monospace"
                                }}
                            >
                                {selectedFeed.CODE_BLOCK}
                            </Box>
                        )}

                    </Box>

                    {/* 오른쪽 댓글 */}

                    <Box sx={{ width: 300, borderLeft: "1px solid #ddd", pl: 2, }}>

                        <Typography variant="h6">
                            ❤️ {selectedFeed?.LIKE_COUNT}
                        </Typography>

                        <Button
                            variant="contained"
                            sx={{ mt: 1, mb: 2 }}
                            onClick={handleLike}
                        >
                            {selectedFeed?.IS_LIKED
                                ? "취소"
                                : "좋아요"}
                        </Button>

                        <Typography variant="h6">댓글</Typography>

                        <List>
                            {comments.map((c, i) => (
                                <ListItem key={i} alignItems="flex-start" sx={{
                                    display: "block",
                                    borderBottom: "1px solid #eee",
                                    py: 1
                                }}>
                                    <ListItemAvatar>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1
                                            }}
                                        >
                                            <Avatar>
                                                {c.USER_ID?.charAt(0).toUpperCase()}  {/* 아이디의 첫 글자를 아바타로 표시 */}
                                            </Avatar>
                                            <Typography fontWeight="bold">
                                                {c.USER_ID}
                                            </Typography>
                                        </Box>
                                    </ListItemAvatar>
                                    {editingCommentId === c.COMMENT_ID ? (
                                        <>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                value={editContent}
                                                onChange={(e) =>
                                                    setEditContent(e.target.value)
                                                }
                                            />

                                            <Button
                                                onClick={() =>
                                                    handleEditCommentSave(c.COMMENT_ID)
                                                }
                                            >
                                                저장
                                            </Button>
                                        </>
                                    ) : (
                                        <Typography>
                                            {c.CONTENT}
                                        </Typography>
                                    )}

                                    {decoded.userId === c.USER_ID && (
                                        <Box sx={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: 1,
                                            mt: 1
                                        }}>
                                            <Button
                                                color="info"
                                                onClick={() => handleEditCommentStart(c)}
                                                size="small"
                                            >수정
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteComment(c.COMMENT_ID)}
                                            >삭제
                                            </Button>
                                        </Box>)}
                                </ListItem>
                            ))}
                        </List>

                        <TextField
                            fullWidth
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />

                        <Button onClick={handleAddComment}>
                            댓글 추가
                        </Button>

                    </Box>

                </DialogContent>

                <DialogActions>

                    {decoded.userId === selectedFeed?.USER_ID && (
                        <Button color="error" onClick={handleDelete}>
                            삭제
                        </Button>
                    )}

                    <Button onClick={handleClose}>
                        닫기
                    </Button>

                </DialogActions>

            </Dialog>
        </>
    );
}
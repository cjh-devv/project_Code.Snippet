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

export default function PostCard({ feed, refreshFeed }) {

    const [open, setOpen] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');


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
                "Authorization": localStorage.getItem("token")
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

    // 삭제
    const handleDelete = () => {

        if (!window.confirm("진짜 삭제?")) return;

        fetch("http://localhost:3010/feed/" + feed.POST_ID, {
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
                    {selectedFeed?.CONTENT}

                    <IconButton
                        onClick={handleClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ display: 'flex' }}>

                    {/* 왼쪽 */}
                    <Box sx={{ flex: 1 }}>
                        <Typography>{selectedFeed?.CONTENT}</Typography>
                    </Box>

                    {/* 오른쪽 댓글 */}
                    <Box sx={{ width: 300, ml: 2 }}>

                        <Typography variant="h6">댓글</Typography>

                        <List>
                            {comments.map((c, i) => (
                                <ListItem key={i}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            {c.id.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={c.text} secondary={c.id} />
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

                    <Button color="error" onClick={handleDelete}>
                        삭제
                    </Button>

                    <Button onClick={handleClose}>
                        닫기
                    </Button>

                </DialogActions>

            </Dialog>
        </>
    );
}
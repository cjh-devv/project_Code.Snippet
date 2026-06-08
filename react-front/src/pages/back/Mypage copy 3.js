import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Avatar,
    Paper,
    Divider,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Stack
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PostDetailModal from '../components/PostDetailModal';

function MyPage() {
    let [posts, setPosts] = useState([]);
    let [info, setInfo] = useState(null);
    const navigate = useNavigate();
    const [selectedPost, setSelectedPost] = useState(null);
    let [open, setOpen] = useState(false);
    const [feed, setFeed] = useState([]);

    function handleGetMyInfo() {
        fetch("http://localhost:3010/user", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => {

                if (
                    res.status === 401 ||
                    res.status === 403
                ) {

                    alert("로그인이 만료되었습니다.");

                    localStorage.removeItem("token");

                    window.location.href = "/";

                    throw new Error("UNAUTHORIZED");
                }

                return res.json();

            })
            .then(data => {
                setInfo(data);
                console.log("info =", data)
            })
            .catch(err => {
                if (err.message === "UNAUTHORIZED") {
                    return;
                }
                console.error(err);
                alert("서버 에러 발생!");
            });
    };

    useEffect(() => {
        handleGetMyInfo();
    }, []);

    function handleGetMyPost() {
        fetch("http://localhost:3010/post/mypost", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => {

                if (
                    res.status === 401 ||
                    res.status === 403
                ) {

                    alert("로그인이 만료되었습니다.");

                    localStorage.removeItem("token");

                    window.location.href = "/";

                    throw new Error("UNAUTHORIZED");
                }

                return res.json();

            })
            .then(data => {
                setPosts(data.list);
            })
            .catch(err => {
                if (err.message === "UNAUTHORIZED") {
                    return;
                }
                console.error(err);
                alert("서버 에러 발생!");
            });
    };

    useEffect(() => {
        handleGetMyPost();
    }, []);

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            {/* 프로필 섹션 */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: 'linear-gradient(to bottom right, #ffffff, #fcfcfd)'
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 4 }}>
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            border: '3px solid #fff'
                        }}
                    />

                    <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="h5" fontWeight="700" color="text.primary">
                                {info?.userInfo.NICKNAME}
                            </Typography>
                            <Button variant="outlined" size="small" sx={{ borderRadius: 2, textTransform: 'none' }}>
                                프로필 수정
                            </Button>
                        </Box>

                        {/* 활동 통계 */}
                        <Box sx={{ display: 'flex', gap: 4, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" size="small">게시글</Typography>
                                <Typography variant="h6" fontWeight="600">{posts.length}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">팔로워</Typography>
                                <Typography variant="h6" fontWeight="600">1.2k</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">팔로잉</Typography>
                                <Typography variant="h6" fontWeight="600">340</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* 게시글 리스트 섹션 */}
            <Paper
                elevation={0}
                sx={{
                    mt: 4,
                    p: 4,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                    내가 작성한 게시글
                </Typography>

                <List disablePadding>
                    {posts.map((post, index) => (
                        <React.Fragment key={post.POST_ID}>
                            {index > 0 && <Divider component="li" />}
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        py: 2.5,
                                        px: 2,
                                        borderRadius: 2,
                                        my: 0.5,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                            transform: 'translateX(4px)'
                                        }
                                    }}
                                    onClick={() => {
                                        setOpen(true);
                                        fetch(`http://localhost:3010/post/${post.POST_ID}/detail`, {
                                            headers: {
                                                "Authorization": "Bearer " + localStorage.getItem("token")
                                            }
                                        })
                                            .then(res => {

                                                if (
                                                    res.status === 401 ||
                                                    res.status === 403
                                                ) {

                                                    alert("로그인이 만료되었습니다.");

                                                    localStorage.removeItem("token");

                                                    window.location.href = "/";

                                                    throw new Error("UNAUTHORIZED");
                                                }

                                                return res.json();

                                            })
                                            .then(data => {
                                                console.log(data)
                                                setFeed(data.data);
                                                console.log("feed = ", data.data)
                                            })
                                            .catch(err => {
                                                alert("서버 에러 발생!");
                                            });
                                    }}
                                >
                                    <ListItemText
                                        primary={post.TITLE}
                                        primaryTypographyProps={{ fontWeight: '600', color: 'text.primary' }}
                                        secondary={new Date(post?.CREATED_AT).toLocaleString('ko-KR')}
                                        secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.5, display: 'block' } }}
                                    />
                                    <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', ml: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <FavoriteBorderIcon fontSize="small" sx={{ color: '#ff4d4f' }} />
                                            <Typography variant="body2" fontWeight="500">
                                                {post.LIKE_COUNT}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <ChatBubbleOutlineIcon fontSize="small" sx={{ color: '#1890ff' }} />
                                            <Typography variant="body2" fontWeight="500">
                                                {post.COMMENT_COUNT}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </ListItemButton>
                            </ListItem>
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
            <PostDetailModal
                open={open}
                onClose={() => {
                    setOpen(false);
                    setSelectedPost(null);
                }}
                feed={feed.post}
                refreshFeed={handleGetMyPost}
            />
        </Container>
    );
}

export default MyPage;

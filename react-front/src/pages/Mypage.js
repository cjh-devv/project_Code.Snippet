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
    Stack,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PostDetailModal from '../components/PostDetailModal';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmailIcon from '@mui/icons-material/Email';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileBio } from '../components/ProfileBio';

function MyPage() {
    let [posts, setPosts] = useState([]);
    let [info, setInfo] = useState(null);
    const navigator = useNavigate();
    const [selectedPost, setSelectedPost] = useState(null);
    let [open, setOpen] = useState(false);
    const [feed, setFeed] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);            // 북마크 목록 데이터
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // 취소 팝업 띄우기 온오프
    const [targetPostId, setTargetPostId] = useState(null);    // 삭제 대상 포스트 ID 저장

    function handleGetMyInfo() {
        fetch("/api/user", {
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
        fetch("/api/post/mypost", {
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
                setPosts(data.list || []);
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

    // 북마크 목록 API 호출 함수
    function handleGetMyBookmarks() {
        fetch("/api/post/my-bookmarks", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    alert("로그인이 만료되었습니다.");
                    localStorage.removeItem("token");
                    window.location.href = "/";
                    throw new Error("UNAUTHORIZED");
                }
                return res.json();
            })
            .then(data => {
                setBookmarks(data.list || []);
            })
            .catch(err => {
                if (err.message === "UNAUTHORIZED") return;
                console.error(err);
                alert("서버 에러 발생!");
            });
    }

    // 북마크 취소(토글) 실행 함수
    function handleDeleteBookmark() {
        if (!targetPostId) return;

        fetch(`/api/post/${targetPostId}/bookmark/toggle`, {
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    alert("로그인이 만료되었습니다.");
                    localStorage.removeItem("token");
                    window.location.href = "/";
                    throw new Error("UNAUTHORIZED");
                }
                return res.json();
            })
            .then(data => {
                alert("북마크가 취소되었습니다.");
                setDeleteDialogOpen(false);
                handleGetMyBookmarks();
            })
            .catch(err => {
                if (err.message === "UNAUTHORIZED") return;
                console.error(err);
                alert("삭제 처리 중 에러가 발생했습니다.");
            });
    }

    useEffect(() => {
        handleGetMyBookmarks();
    }, []);


    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            {/* 프로필 섹션 */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, sm: 4 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'rgba(0, 0, 0, 0.07)',
                    background: 'linear-gradient(to bottom right, #ffffff, #fcfdfd)',
                    boxShadow: '0 12px 32px -6px rgba(0, 0, 0, 0.03), 0 4px 12px -2px rgba(0, 0, 0, 0.01)'
                }}
            >
                {/* 1. 상단 프로필 영역 */}
                <ProfileHeader info={info} navigator={navigator} />

                {/* 2. 하단 README 영역 */}
                <ProfileBio bio={info?.userInfo?.BIO} />
            </Paper>
            {/* 게시글 리스트 섹션 */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mt: 4,
                    borderRadius: 5, // 조금 더 둥글고 부드럽게 변경
                    border: '1px solid',
                    borderColor: 'rgba(0, 0, 0, 0.04)', // 테두리를 더 연하게 변경
                    background: 'linear-gradient(to bottom right, #ffffff, #fefeff)',
                    // 은은하고 고급스러운 레이어드 그림자 효과 적용
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.03), 0 4px 12px -2px rgba(0, 0, 0, 0.02)'
                }}
            >
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                    내가 작성한 게시글 ({posts?.length || 0})
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
                                        fetch(`/api/post/${post.POST_ID}/detail`, {
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
            {/* 북마크 모아보기 섹션 */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mt: 4,
                    borderRadius: 5,
                    border: '1px solid',
                    borderColor: 'rgba(0, 0, 0, 0.04)',
                    background: 'linear-gradient(to bottom right, #ffffff, #fefeff)',
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.03), 0 4px 12px -2px rgba(0, 0, 0, 0.02)'
                }}
            >
                <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                    북마크 모아보기
                </Typography>

                <List disablePadding>
                    {bookmarks.length === 0 ? (
                        <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                            북마크한 게시글이 없습니다.
                        </Typography>
                    ) : (
                        bookmarks.map((bookmark, index) => (
                            <React.Fragment key={bookmark.BOOKMARK_ID}>
                                {index > 0 && <Divider component="li" />}
                                <ListItem
                                    disablePadding
                                    secondaryAction={
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                setTargetPostId(bookmark.POST_ID);
                                                setDeleteDialogOpen(true);
                                            }}
                                            sx={{ mr: 1, fontWeight: '600' }}
                                        >
                                            취소
                                        </Button>
                                    }
                                >
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
                                            fetch(`/api/post/${bookmark.POST_ID}/detail`, {
                                                headers: {
                                                    "Authorization": "Bearer " + localStorage.getItem("token")
                                                }
                                            })
                                                .then(res => {
                                                    if (res.status === 401 || res.status === 403) {
                                                        alert("로그인이 만료되었습니다.");
                                                        localStorage.removeItem("token");
                                                        window.location.href = "/";
                                                        throw new Error("UNAUTHORIZED");
                                                    }
                                                    return res.json();
                                                })
                                                .then(data => {
                                                    setFeed(data.data);
                                                })
                                                .catch(err => {
                                                    alert("서버 에러 발생!");
                                                });
                                        }}
                                    >
                                        <ListItemText
                                            primary={bookmark.TITLE}
                                            primaryTypographyProps={{ fontWeight: '600', color: 'text.primary' }}
                                            secondary={`저장일: ${new Date(bookmark.BOOKMARKED_AT).toLocaleDateString('ko-KR')}`}
                                            secondaryTypographyProps={{ variant: 'caption', sx: { mt: 0.5, display: 'block' } }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Paper>

            {/* 북마크 취소 재확인 팝업 (MUI Dialog) */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ fontWeight: '700' }}>북마크 취소</DialogTitle>
                <DialogContent>
                    <DialogContentText>해당 게시글을 북마크 목록에서 삭제하시겠습니까?</DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" sx={{ fontWeight: '600' }}>취소</Button>
                    <Button onClick={handleDeleteBookmark} color="error" variant="contained" disableElevation sx={{ fontWeight: '600', borderRadius: 2 }}>확인</Button>
                </DialogActions>
            </Dialog>
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

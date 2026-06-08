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
    Chip
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PostDetailModal from '../components/PostDetailModal';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmailIcon from '@mui/icons-material/Email';
import LockOpenIcon from '@mui/icons-material/LockOpen';

function MyPage() {
    let [posts, setPosts] = useState([]);
    let [info, setInfo] = useState(null);
    const navigator = useNavigate();
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

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            {/* 프로필 섹션 */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: 5, // 조금 더 둥글고 부드럽게 변경
                    border: '1px solid',
                    borderColor: 'rgba(0, 0, 0, 0.04)', // 테두리를 더 연하게 변경
                    background: 'linear-gradient(to bottom right, #ffffff, #fefeff)',
                    // 은은하고 고급스러운 레이어드 그림자 효과 적용
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.03), 0 4px 12px -2px rgba(0, 0, 0, 0.02)'
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 4 }}>
                    <Avatar
                        // PROFILE_IMAGE가 없거나 null이면 public의 /logo512.png를 기본값으로 사용
                        src={info?.userInfo?.PROFILE_IMAGE || "/logo512.png"}
                        sx={{
                            width: 100,
                            height: 100,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            border: '3px solid #fff'
                        }}
                    />

                    {/* 레이아웃 분할 컨테이너 */}
                    <Box sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'center', md: 'flex-start' },
                        gap: 3,
                        width: '100%'
                    }}>
                        {/* 가운데 영역: 닉네임, 버튼, 활동 통계 */}
                        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Typography variant="h5" fontWeight="700" color="text.primary" sx={{ mr: { sm: 1 } }}>
                                    {info?.userInfo?.NICKNAME}
                                </Typography>
                                {/* 버튼 래퍼: 모바일 환경에서 가로 정렬을 유지하기 위한 박스 */}
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {/* 1. 프로필 수정 버튼 */}
                                    <Button
                                        onClick={() => navigator("/profile/edit", { state: { tab: 0 } })}
                                        variant="contained"
                                        size="small"
                                        disableElevation
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: '600',
                                            px: 2,
                                            py: 0.6,
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        프로필 수정
                                    </Button>

                                    {/* 2. 비밀번호 변경 버튼 */}
                                    <Button
                                        onClick={() => navigator("/profile/edit", { state: { tab: 1 } })}
                                        variant="outlined"
                                        size="small"
                                        color="secondary"
                                        startIcon={<LockOpenIcon fontSize="small" />}
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: '600',
                                            borderColor: 'divider',
                                            color: 'text.secondary',
                                            px: 1.8,
                                            py: 0.6,
                                            fontSize: '0.85rem',
                                            '&:hover': {
                                                borderColor: 'text.secondary',
                                                backgroundColor: 'action.hover'
                                            }
                                        }}
                                    >
                                        비밀번호 변경
                                    </Button>
                                </Box>
                            </Box>

                            {/* 활동 통계 */}
                            <Box sx={{ display: 'flex', gap: 4, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">게시글</Typography>
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

                        {/* 오른쪽 영역: 가입 정보 및 고유 ID 태그 */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: { xs: 'center', md: 'flex-end' },
                            gap: 1.2,
                            pt: { xs: 0, md: 0.5 }
                        }}>
                            {/* 1. 유저 고유 ID 배지 (추천 항목: 간단하고 실용적) */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    User ID
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'action.selected', px: 1, py: 0.3, borderRadius: 1.5, fontWeight: '600', color: 'text.primary' }}>
                                    #{info?.userInfo?.USER_ID || '0000'}
                                </Typography>
                            </Box>

                            {/* 2. 세련되게 다듬은 가입일 배지 */}
                            <Chip
                                icon={<CalendarMonthIcon fontSize="small" sx={{ color: 'primary.main !important' }} />}
                                label={`FROM : ${info?.userInfo?.CREATED_AT
                                    ? new Date(info.userInfo.CREATED_AT).toLocaleString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : '-'
                                    }`}
                                variant="outlined" // 기존 soft에서 테두리 스타일로 변경하여 더 깔끔함 제고
                                size="medium"
                                sx={{
                                    fontWeight: '600',
                                    borderColor: 'primary.light',
                                    bgcolor: 'primary.lighter', // MUI 기본 테마에 없을 시 생략 가능, 은은한 배경색 적용
                                    color: 'primary.dark',
                                    borderRadius: '20px',
                                    px: 0.5
                                }}
                            />

                            {/* 3. 이메일 정보 */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mt: 0.5 }}>
                                <EmailIcon fontSize="small" sx={{ opacity: 0.7 }} />
                                <Typography variant="body2" sx={{ fontSize: '0.85rem', letterSpacing: -0.3 }}>
                                    {info?.userInfo?.EMAIL}
                                </Typography>
                            </Box>
                        </Box>

                    </Box>
                </Box>
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

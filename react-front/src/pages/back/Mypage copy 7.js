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

    // 북마크 목록 API 호출 함수
    function handleGetMyBookmarks() {
        fetch("http://localhost:3010/post/my-bookmarks", {
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

        fetch(`http://localhost:3010/post/${targetPostId}/bookmark/toggle`, {
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
                {/* 상단 메인 영역 (아바타 + 유저 정보 우측 정렬) */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    gap: { xs: 3, sm: 4 }
                }}>
                    {/* 프로필 이미지 (기존 유지) */}
                    <Avatar
                        src={info?.userInfo?.PROFILE_IMAGE || "/logo512.png"}
                        sx={{
                            width: 100,
                            height: 100,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            border: '3px solid #fff'
                        }}
                    />

                    {/* 유저 상세 정보 컨테이너 */}
                    <Box sx={{ flexGrow: 1, width: '100%' }}>
                        {/* 닉네임 & 유저 ID 배지 (★ 절대 고정 영역) */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'center', sm: 'flex-start' },
                            justifyContent: 'space-between',
                            gap: 2,
                            mb: 2
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textAlign: { xs: 'center', sm: 'left' } }}>
                                <Typography variant="h5" fontWeight="700" color="text.primary">
                                    {info?.userInfo?.NICKNAME}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'action.selected', px: 1, py: 0.3, borderRadius: 1.5, fontWeight: '600', color: 'text.secondary' }}>
                                    #{info?.userInfo?.USER_ID || '0000'}
                                </Typography>
                            </Box>

                            {/* 우측 버튼 그룹 */}
                            <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' }, justifyContent: 'center' }}>
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
                                        py: 0.7,
                                        fontSize: '0.85rem',
                                        flex: { xs: 1, sm: 'initial' }
                                    }}
                                >
                                    프로필 수정
                                </Button>
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
                                        py: 0.7,
                                        fontSize: '0.85rem',
                                        flex: { xs: 1, sm: 'initial' },
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

                        {/* 활동 통계 (SNS형 수평 레이아웃) */}
                        <Box sx={{
                            display: 'flex',
                            gap: 4,
                            justifyContent: { xs: 'center', sm: 'flex-start' },
                            mb: 2
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="600">POSTS</Typography>
                                <Typography variant="h6" fontWeight="700" sx={{ lineHeight: 1 }}>{posts.length}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="600">FOLLOWERS</Typography>
                                <Typography variant="h6" fontWeight="700" sx={{ lineHeight: 1 }}>1.2k</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="600">FOLLOWING</Typography>
                                <Typography variant="h6" fontWeight="700" sx={{ lineHeight: 1 }}>340</Typography>
                            </Box>
                        </Box>

                        {/* 가입일 및 메일 정보 (활동통계 밑으로 이동) */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'center', sm: 'center' },
                            gap: 2,
                            justifyContent: 'flex-start'
                        }}>
                            {/* 캘린더 아이콘 복구 */}
                            <Chip
                                icon={<CalendarMonthIcon fontSize="small" sx={{ color: 'primary.main !important', fontSize: '1rem' }} />}
                                label={`SINCE : ${info?.userInfo?.CREATED_AT
                                    ? new Date(info.userInfo.CREATED_AT).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                    }).replace(/\. /g, '-').replace('.', '')
                                    : '-'
                                    }`}
                                variant="outlined"
                                size="small"
                                sx={{
                                    fontWeight: '600',
                                    fontFamily: 'monospace',
                                    borderColor: 'rgba(25, 118, 210, 0.15)',
                                    bgcolor: 'rgba(25, 118, 210, 0.02)',
                                    color: 'primary.dark',
                                    borderRadius: 1.5,
                                    px: 0.5
                                }}
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary' }}>
                                <EmailIcon sx={{ opacity: 0.5, fontSize: '1.1rem' }} />
                                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                    {info?.userInfo?.EMAIL}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* 하단 서브 영역 (꾸며진 개발자 README/BIO 스타일) */}
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'rgba(0,0,0,0.04)' }}>
                    <Box sx={{
                        bgcolor: 'action.hover', // 은은한 코드 블록 느낌의 회색 배경
                        border: '1px solid',
                        borderColor: 'action.selected',
                        borderRadius: 2,
                        p: 2,
                        position: 'relative',
                        '&::before': { // 상단 가상 요소로 파일명 마킹 효과 시각화
                            content: '"README.md"',
                            position: 'absolute',
                            top: -10,
                            left: 12,
                            bgcolor: 'background.paper',
                            px: 1,
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            color: 'text.disabled',
                            fontFamily: 'monospace',
                            border: '1px solid',
                            borderColor: 'action.selected',
                            borderRadius: 1
                        }
                    }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.primary',
                                whiteSpace: "pre-wrap",
                                lineHeight: 1.6,
                                fontFamily: 'monospace', // 개발자 감성을 위한 고정폭 폰트 통일
                                letterSpacing: -0.2,
                                fontSize: '0.875rem'
                            }}
                        >
                            {info?.userInfo?.BIO || "$ cat intro.txt\n> 등록된 자기소개가 없습니다."}
                        </Typography>
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
                                            fetch(`http://localhost:3010/post/${bookmark.POST_ID}/detail`, {
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

import React, { useContext, useState } from 'react';
import { UserContext } from './context/UserContext';
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
    Chip,
    Tooltip,
    Divider
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

import CloseIcon from '@mui/icons-material/Close';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/Bookmark';
import UserProfileModal from "./UserProfileModal";
import UserLink from "./UserLink";

export default function PostCard({ feed, refreshFeed }) {

    const [open, setOpen] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const { globalUserInfo } = useContext(UserContext);
    const { refreshUserInfo } = useContext(UserContext);
    console.log(globalUserInfo);
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

    //북마크 토글
    const handleBookmark = () => {
        fetch(`http://localhost:3010/post/${selectedFeed?.POST_ID}/bookmark/toggle`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.result === "success") {
                    // 현재 상세 피드 상태값(selectedFeed)의 IS_BOOKMARKED만 반대로 토글
                    refreshFeed();
                    setSelectedFeed(prev => ({
                        ...prev,
                        IS_BOOKMARKED: data.action === "bookmark", // 'bookmark'면 true, 'unbookmark'면 false
                        BOOKMARK_COUNT:
                            prev.BOOKMARK_COUNT +
                            (prev.IS_BOOKMARKED ? -1 : 1)
                    }));
                }
            })
            .catch(err => console.error(err));
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

    const handleFollowToggle = () => {
        fetch(`http://localhost:3010/follow/${selectedFeed.USER_ID}/follow`, {
            method: selectedFeed?.IS_FOLLOWING ? "DELETE" : "POST",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {

                if (data.result === "success") {

                    // 1) 현재 모달 UI 즉시 반영
                    setSelectedFeed(prev => ({
                        ...prev,
                        IS_FOLLOWING: !prev.IS_FOLLOWING,
                        FOLLOWER_COUNT: prev.FOLLOWER_COUNT + (prev.IS_FOLLOWING ? -1 : 1)
                    }));

                    // 2) 전역 유저 정보도 갱신 (팔로워 숫자 반영용)
                    if (refreshUserInfo) {
                        refreshUserInfo();
                    }
                }
            })
            .catch(err => {
                console.error(err);
            });
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

                            <Typography fontSize={14}>
                                🔖 {feed.BOOKMARK_COUNT}
                            </Typography>
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center', // 세로축 기준 가운데 정렬로 나란히 맞추기
                            gap: 1,               // 구성 요소 사이의 간격을 일정하게 배치
                            color: 'text.secondary'
                        }}>
                            <Avatar src={feed?.PROFILE_IMAGE || "/logo512.png"} sx={{
                                width: 24,       // 글씨 크기와 균형이 맞도록 아바타 크기 축소
                                height: 24,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                            }} />
                            <Typography
                                variant="caption"
                                fontWeight="600"
                                color="text.primary"
                            >
                                by {feed.USER_ID}
                            </Typography>
                            <Typography variant="caption" sx={{ mx: 0.2, opacity: 0.6 }}>·</Typography>
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
                        {/* 클릭시 유저프로필모달 */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 2
                            }}
                        >
                            {/* 좌측: 유저 정보 */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    cursor: "pointer"
                                }}
                                onClick={() => {
                                    setSelectedUserId(selectedFeed.USER_ID);
                                    setProfileOpen(true);
                                }}
                            >
                                <Avatar
                                    src={feed?.PROFILE_IMAGE || "/logo512.png"}
                                    sx={{ width: 32, height: 32 }}
                                />

                                <Box>
                                    <Typography fontWeight="600" fontSize={14}>
                                        {selectedFeed?.USER_ID}
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(selectedFeed?.CREATED_AT).toLocaleString('ko-KR')}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* 우측: 팔로우 버튼 */}
                            {/* {globalUserInfo?.USER_ID !== selectedFeed?.USER_ID && (
                                <Button
                                    size="small"
                                    variant={selectedFeed?.IS_FOLLOWING ? "outlined" : "contained"}
                                    sx={{
                                        borderRadius: 20,
                                        textTransform: "none"
                                    }}
                                    onClick={handleFollowToggle}
                                >
                                    {selectedFeed?.IS_FOLLOWING ? "언팔로우" : "팔로우"}
                                </Button>
                            )} */}
                        </Box>
                        <Typography sx={{ mt: 2, whiteSpace: "pre-line" }}>
                            {selectedFeed?.CONTENT}
                        </Typography>

                        {selectedFeed?.CODE_BLOCK && (
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
                                {selectedFeed.CODE_BLOCK}

                                {/* 우측 상단 고정 복사 버튼 */}
                                <Box sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                }}>
                                    <Tooltip title={isCopied ? "복사 완료!" : "복사하기"} placement="top">
                                        <IconButton
                                            onClick={() => {
                                                handleCopy(selectedFeed.CODE_BLOCK);
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
                        {selectedFeed?.TAGS?.map((tag) => (
                            <Chip
                                key={tag}
                                label={`#${tag}`}
                                size="small"
                                onClick={() => navigate(`/search?keyword=${tag}`)}
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
                        <Divider orientation="vertical" variant="middle" flexItem sx={{
                            mx: 1,                          // 좌우 여백 
                            borderRightWidth: '2.5px',      // 세로선 두께 설정 (기본은 1px 미만)
                            borderColor: 'text.secondary',  // 색상도 아이콘과 맞춰서 조금 더 선명하게 변경
                            height: '20px',                 // 높이가 너무 길다면 원하는 픽셀로 고정 가능
                            alignSelf: 'center'
                        }} />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <IconButton
                                aria-label="bookmark"
                                onClick={handleBookmark}
                                sx={{ color: selectedFeed?.IS_BOOKMARKED ? "primary.main" : "text.secondary" }}
                            >
                                {selectedFeed?.IS_BOOKMARKED ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                            </IconButton>
                            <Typography variant="h6">
                                {selectedFeed?.BOOKMARK_COUNT}
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

                                        <Typography
                                            fontWeight="bold"
                                            fontSize={13}
                                            sx={{ cursor: "pointer" }}
                                            onClick={(e) => {
                                                e.stopPropagation(); // 카드 클릭 이벤트 방지
                                                setSelectedUserId(c.USER_ID);
                                                setProfileOpen(true);
                                            }}
                                        >
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
                <UserProfileModal
                    open={profileOpen}
                    userId={selectedUserId}
                    onClose={() => setProfileOpen(false)}
                />
            </Dialog>
        </>
    );
}
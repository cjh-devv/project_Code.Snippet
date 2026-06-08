import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate 추가

import {
    Container,
    Typography,
    CircularProgress,
    Box,
    IconButton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // 뒤로가기 아이콘 추가
import NavigateNextIcon from "@mui/icons-material/NavigateNext"; // > 아이콘 추가

import UserCard from "../components/UserCard";
import UserProfileModal from "../components/UserProfileModal";

export default function FollowListPage() {
    const { type } = useParams();
    const navigate = useNavigate(); // 페이지 이동을 위한 훅

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleUserClick = (user) => {
        setSelectedUserId(user.USER_ID);
        setModalOpen(true);
    };

    const refreshUser = (targetUserId, isFollowing) => {
        setUsers(prev =>
            prev.map(user =>
                user.USER_ID === targetUserId
                    ? { ...user, IS_FOLLOWING: isFollowing }
                    : user
            )
        );
    };

    useEffect(() => {
        console.log("type =", type);
        const token = localStorage.getItem("token");
        const url =
            type === "followers"
                ? "http://localhost:3010/follow/followers"
                : "http://localhost:3010/follow/followings";

        fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setUsers(data.list || []);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [type]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            {/* 상단 네비게이션 영역 */}
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton
                    onClick={() => navigate(-1)}
                    sx={{ mr: 1, p: 0.5 }}
                    aria-label="뒤로가기"
                >
                    <ArrowBackIcon />
                </IconButton>

                {/* ID > 팔로워/팔로잉 구조 */}
                <Box display="flex" alignItems="center" flexWrap="wrap">
                    <Typography variant="h6" fontWeight={700}>
                        {type === "followers" ? "팔로워" : "팔로잉"}
                    </Typography>

                    {/* 인원수 배치: 타이틀 옆에 배치하여 한눈에 파악 가능 */}
                    <Typography
                        variant="body1"
                        fontWeight={600}
                        color="primary.main"
                        sx={{ ml: 1.5, bgcolor: "action.selected", px: 1, py: 0.2, borderRadius: 1 }}
                    >
                        {users.length}명
                    </Typography>
                </Box>
            </Box>

            {/* 사용자 목록 리스트 */}
            {users.length === 0 ? (
                <Typography color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
                    목록이 없습니다.
                </Typography>
            ) : (
                users.map(user => (
                    <UserCard
                        key={user.USER_ID}
                        user={user}
                        onUserClick={handleUserClick}
                        onFollowChange={refreshUser}
                    />
                ))
            )}

            <UserProfileModal
                open={modalOpen}
                userId={selectedUserId}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedUserId(null);
                }}
                onFollowChange={refreshUser}
            />
        </Container>
    );
}

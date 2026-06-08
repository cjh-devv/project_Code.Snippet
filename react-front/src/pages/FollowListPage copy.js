import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    Container,
    Typography,
    CircularProgress,
    Box
} from "@mui/material";

import UserCard from "../components/UserCard";
import UserProfileModal from "../components/UserProfileModal";

export default function FollowListPage() {

    const { type } = useParams();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId]
        = useState(null);
    const [modalOpen, setModalOpen]
        = useState(false);

    const handleUserClick = (user) => {

        setSelectedUserId(
            user.USER_ID
        );

        setModalOpen(true);
    };
    const refreshUser = (targetUserId, isFollowing) => {

        setUsers(prev =>
            prev.map(user =>
                user.USER_ID === targetUserId
                    ? {
                        ...user,
                        IS_FOLLOWING: isFollowing
                    }
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
            <Box
                display="flex"
                justifyContent="center"
                mt={5}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container
            maxWidth="sm"
            sx={{
                mt: 4,
                mb: 4
            }}
        >
            <Typography
                variant="h4"
                fontWeight={700}
            >
                {type === "followers"
                    ? `팔로워 ${users.length}`
                    : `팔로잉 ${users.length}`}
            </Typography>

            {users.length === 0 ? (
                <Typography
                    color="text.secondary"
                >
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
import {
    Dialog,
    DialogContent,
    IconButton,
    Avatar,
    Typography,
    Box,
    Button,
    CircularProgress
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { useEffect, useState } from "react";

export default function ProfileModal({
    open,
    userId,
    onClose
}) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        if (!open || !userId) {
            return;
        }

        const token = localStorage.getItem("token");

        setLoading(true);

        fetch(`/api/user/${userId}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setUser(data.user);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });

    }, [open, userId]);

    const handleFollowToggle = () => {

        const token = localStorage.getItem("token");

        fetch(
            `/api/follow/${userId}/toggle`,
            {
                method: "POST",
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        )
            .then(res => res.json())
            .then(data => {

                setUser(prev => ({
                    ...prev,
                    isFollowing:
                        !prev.isFollowing
                }));
            })
            .catch(console.error);
    };

    const DEFAULT_AVATAR = "/logo512.png";

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
        >
            <DialogContent>

                <Box
                    display="flex"
                    justifyContent="flex-end"
                >
                    <IconButton
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                {loading ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        py={5}
                    >
                        <CircularProgress />
                    </Box>
                ) : user ? (

                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >

                        <Avatar
                            src={
                                user.PROFILE_IMAGE
                            }
                            sx={{
                                width: 120,
                                height: 120,
                                mb: 2
                            }}
                            imgProps={{
                                onError: (e) => {
                                    e.target.src =
                                        DEFAULT_AVATAR;
                                }
                            }}
                        />

                        <Typography
                            variant="h5"
                            fontWeight={700}
                        >
                            {user.NICKNAME}
                        </Typography>

                        <Typography
                            color="text.secondary"
                        >
                            @{user.USER_ID}
                        </Typography>

                        <Typography
                            sx={{
                                mt: 2,
                                mb: 2,
                                textAlign: "center",
                                whiteSpace:
                                    "pre-wrap"
                            }}
                        >
                            {user.BIO ||
                                "자기소개가 없습니다."}
                        </Typography>

                        <Box
                            display="flex"
                            gap={3}
                            mb={3}
                        >
                            <Typography>
                                팔로워{" "}
                                {
                                    user.followerCount
                                }
                            </Typography>

                            <Typography>
                                팔로잉{" "}
                                {
                                    user.followingCount
                                }
                            </Typography>
                        </Box>

                        {!user.isMe && (
                            <Button
                                variant={
                                    user.isFollowing
                                        ? "outlined"
                                        : "contained"
                                }
                                onClick={
                                    handleFollowToggle
                                }
                            >
                                {user.isFollowing
                                    ? "언팔로우"
                                    : "팔로우"}
                            </Button>
                        )}

                    </Box>

                ) : (
                    <Typography>
                        사용자 정보를
                        불러오지 못했습니다.
                    </Typography>
                )}

            </DialogContent>
        </Dialog>
    );
}
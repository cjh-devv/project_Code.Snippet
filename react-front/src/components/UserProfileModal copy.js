import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Button,
    Avatar
} from "@mui/material";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { UserContext } from "../components/context/UserContext";

export default function UserProfileModal({
    open,
    userId,
    onFollowChange,
    onClose
}) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const { refreshUserInfo } = useContext(UserContext);
    const DEFAULT_AVATAR = "/logo512.png";
    const fetchProfile = async () => {

        try {

            const res = await fetch(
                `http://localhost:3010/user/${userId}/profile`,
                {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    }
                }
            );

            const data = await res.json();

            setProfile(data.profile);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {

        if (!open || !userId) return;

        fetchProfile();

    }, [open, userId]);

    const handleFollow = () => {

        setLoading(true);

        fetch(
            `http://localhost:3010/follow/${userId}/follow`,
            {
                method: "POST",
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem("token")}`
                }
            }
        )
            .then(res => res.json())
            .then(data => {

                setProfile(prev => ({
                    ...prev,
                    IS_FOLLOWING: true,
                    FOLLOWERS:
                        prev.FOLLOWERS + 1
                }));
                 refreshUserInfo();

                // 부모 반영
                if (onFollowChange) {
                    onFollowChange(userId, true);
                }

            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleUnfollow = () => {

        setLoading(true);

        fetch(
            `http://localhost:3010/follow/${userId}/follow`,
            {
                method: "DELETE",
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem("token")}`
                }
            }
        )
            .then(res => res.json())
            .then(data => {

                setProfile(prev => ({
                    ...prev,
                    IS_FOLLOWING: false,
                    FOLLOWERS:
                        prev.FOLLOWERS - 1
                }));

                 refreshUserInfo();

                // 부모 반영
                if (onFollowChange) {
                    onFollowChange(userId, false);
                }

            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    };
    
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>
                프로필
            </DialogTitle>

            <DialogContent>
                {profile && (
                    <>
                        <Avatar
                            src={profile.PROFILE_IMAGE || DEFAULT_AVATAR}
                            sx={{
                                width: 100,
                                height: 100
                            }}
                        />

                        <Typography variant="h6">
                            {profile.NICKNAME}
                        </Typography>
                        <Typography
                            color="text.secondary"
                        >
                            @{profile.USER_ID}
                        </Typography>
                        <Typography>
                            {profile.BIO || "자기소개가 없습니다."}
                        </Typography>

                        <Typography>
                            게시글 {profile.POST_COUNT}
                        </Typography>

                        <Typography>
                            팔로워 {profile.FOLLOWERS}
                        </Typography>

                        <Typography>
                            팔로잉 {profile.FOLLOWING}
                        </Typography>

                        {!profile?.IS_ME && (

                            profile?.IS_FOLLOWING ? (

                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    disabled={loading}
                                    onClick={handleUnfollow}
                                >
                                    언팔로우
                                </Button>

                            ) : (

                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    disabled={loading}
                                    onClick={handleFollow}
                                >
                                    팔로우
                                </Button>

                            )

                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
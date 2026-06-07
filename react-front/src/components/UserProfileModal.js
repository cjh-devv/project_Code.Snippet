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

export default function UserProfileModal({
    open,
    userId,
    onClose
}) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
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

    const handleFollow = async () => {

        try {

            setLoading(true);

            await fetch(
                `http://localhost:3010/follow/${userId}/follow`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            await fetchProfile();

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);
        }
    };

    const handleUnfollow = async () => {

        try {

            setLoading(true);

            await fetch(
                `http://localhost:3010/follow/${userId}/follow`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            await fetchProfile();

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);
        }
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
                            src={profile.PROFILE_IMAGE}
                            sx={{
                                width: 100,
                                height: 100
                            }}
                        />

                        <Typography variant="h6">
                            {profile.NICKNAME}
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
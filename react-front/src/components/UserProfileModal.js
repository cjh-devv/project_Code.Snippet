import React, { useState, useEffect, useContext } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Button,
    Avatar,
    Box,
    Stack,
    IconButton,
    Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // npm install @mui/icons-material 필요
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
                `/api/user/${userId}/profile`,
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
            `/api/follow/${userId}/follow`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        )
            .then(res => res.json())
            .then(data => {
                setProfile(prev => ({
                    ...prev,
                    IS_FOLLOWING: true,
                    FOLLOWERS: prev.FOLLOWERS + 1
                }));
                refreshUserInfo();
                if (onFollowChange) {
                    onFollowChange(userId, true);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleUnfollow = () => {
        setLoading(true);
        fetch(
            `/api/follow/${userId}/follow`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        )
            .then(res => res.json())
            .then(data => {
                setProfile(prev => ({
                    ...prev,
                    IS_FOLLOWING: false,
                    FOLLOWERS: prev.FOLLOWERS - 1
                }));
                refreshUserInfo();
                if (onFollowChange) {
                    onFollowChange(userId, false);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };
    
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, p: 1 } // 모달 테두리를 부드럽게 변경
            }}
        >
            {/* 상단 타이틀 및 닫기 버튼 */}
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">프로필</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {profile && (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textTransform: "none" }}>
                        
                        {/* 아바타 영역 */}
                        <Avatar
                            src={profile.PROFILE_IMAGE || DEFAULT_AVATAR}
                            sx={{
                                width: 90,
                                height: 90,
                                boxShadow: 2,
                                mb: 2
                            }}
                        />

                        {/* 유저 네임 스페이스 */}
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {profile.NICKNAME}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            @{profile.USER_ID}
                        </Typography>

                        {/* 자기 소개 글 */}
                        <Typography 
                            variant="body2" 
                            align="center" 
                            color="text.primary"
                            sx={{ 
                                px: 2, 
                                py: 1.5, 
                                width: '100%',
                                backgroundColor: 'action.hover', 
                                borderRadius: 2,
                                mb: 3,
                                minHeight: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {profile.BIO || "자기소개가 없습니다."}
                        </Typography>

                        <Divider sx={{ width: '100%', mb: 2 }} />

                        {/* 통계 지표 영역 (가로 배치) */}
                        <Stack 
                            direction="row" 
                            spacing={4} 
                            justifyContent="center" 
                            sx={{ width: '100%', mb: 3 }}
                        >
                            <Box textAlign="center">
                                <Typography variant="subtitle2" color="text.secondary">게시글</Typography>
                                <Typography variant="h6" fontWeight="bold">{profile.POST_COUNT}</Typography>
                            </Box>
                            <Box textAlign="center">
                                <Typography variant="subtitle2" color="text.secondary">팔로워</Typography>
                                <Typography variant="h6" fontWeight="bold">{profile.FOLLOWERS}</Typography>
                            </Box>
                            <Box textAlign="center">
                                <Typography variant="subtitle2" color="text.secondary">팔로잉</Typography>
                                <Typography variant="h6" fontWeight="bold">{profile.FOLLOWING}</Typography>
                            </Box>
                        </Stack>

                        {/* 액션 버튼 영역 */}
                        {!profile?.IS_ME && (
                            profile?.IS_FOLLOWING ? (
                                <Button
                                    variant="outlined"
                                    color="error" // 언팔로우 시 시각적 경고 효과
                                    fullWidth
                                    disabled={loading}
                                    onClick={handleUnfollow}
                                    sx={{ borderRadius: 2, py: 1, fontWeight: 'bold' }}
                                >
                                    언팔로우
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    disabled={loading}
                                    onClick={handleFollow}
                                    sx={{ borderRadius: 2, py: 1, fontWeight: 'bold', boxShadow: 'none' }}
                                >
                                    팔로우
                                </Button>
                            )
                        )}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

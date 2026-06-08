import React from 'react';
import { Box, Avatar, Typography, Button, Chip, ButtonBase } from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmailIcon from '@mui/icons-material/Email';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

export const ProfileHeader = ({ info, posts, navigator }) => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: { xs: 3, sm: 4 }
        }}>
            {/* 프로필 이미지 */}
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
                {/* 닉네임 & 유저 ID 배지 */}
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
                            <ManageAccountsIcon></ManageAccountsIcon>프로필 수정
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

                {/* 활동 통계 */}
                <Box sx={{
                    display: 'flex',
                    gap: 4,
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                    mb: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="600">POSTS</Typography>
                        <Typography variant="h6" fontWeight="700" sx={{ lineHeight: 1 }}>{posts?.length || 0}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* 팔로워 버튼 */}
                        <ButtonBase
                            onClick={() => navigate('/followers')}
                            sx={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: 0.8,
                                padding: '6px 12px',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                    '& .follow-text': { textDecoration: 'underline' }
                                }
                            }}
                        >
                            <Typography
                                className="follow-text"
                                variant="caption"
                                color="text.secondary"
                                fontWeight="700"
                                sx={{ letterSpacing: '0.5px' }}
                            >
                                팔로워
                            </Typography>
                            <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1, color: 'text.primary' }}>
                                1.2k
                            </Typography>
                        </ButtonBase>

                        {/* 팔로잉 버튼 */}
                        <ButtonBase
                            onClick={() => navigate('/following')}
                            sx={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: 0.8,
                                padding: '6px 12px',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                    '& .follow-text': { textDecoration: 'underline' }
                                }
                            }}
                        >
                            <Typography
                                className="follow-text"
                                variant="caption"
                                color="text.secondary"
                                fontWeight="700"
                                sx={{ letterSpacing: '0.5px' }}
                            >
                                팔로잉
                            </Typography>
                            <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1, color: 'text.primary' }}>
                                340
                            </Typography>
                        </ButtonBase>
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

                {/* 가입일 및 메일 정보 */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'center', sm: 'center' },
                    gap: 1.5,
                    justifyContent: 'flex-start'
                }}>
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

                    <Chip
                        icon={<EmailIcon fontSize="small" sx={{ color: 'text.secondary !important', fontSize: '0.95rem' }} />}
                        label={info?.userInfo?.EMAIL || 'no-email'}
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
                </Box>
            </Box>
        </Box>
    );
};

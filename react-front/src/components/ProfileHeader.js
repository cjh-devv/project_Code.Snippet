import React from 'react';
import { Box, Avatar, Typography, Button, Chip, ButtonBase } from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmailIcon from '@mui/icons-material/Email';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';

export const ProfileHeader = ({ info, navigator }) => {
    const MAIN_BLUE = '#0969DA';

    // 호버 및 공통 스타일 재사용을 위한 객체
    const buttonStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: '6px 14px',
        borderRadius: '6px', // 개발자 도구/코드 블록 느낌의 약간 각진 라운딩
        backgroundColor: '#ffffff',
        border: '1px solid',
        borderColor: '#d0d7de', // 깃허브 스타일의 연한 테두리
        transition: 'all 0.15s ease-in-out',
        cursor: "pointer",
        '&:hover': {
            borderColor: MAIN_BLUE,
            backgroundColor: 'rgba(9, 105, 218, 0.05)', // 은은한 블루 배경
            '& .icon-target, & .text-target': {
                color: MAIN_BLUE
            }
        }
    };
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
                            @{info?.userInfo?.USER_ID || '0000'}
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
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        {/* 팔로워 버튼 */}
                        <ButtonBase onClick={() => navigator('/follow/followers/')} sx={buttonStyle}>
                            <PeopleAltRoundedIcon
                                className="icon-target"
                                sx={{ fontSize: 16, color: '#57606a', transition: 'color 0.15s' }}
                            />
                            <Typography
                                className="text-target"
                                variant="caption"
                                fontWeight="600"
                                sx={{ color: '#57606a', transition: 'color 0.15s', letterSpacing: '0.3px' }}
                            >
                                팔로워
                            </Typography>
                            <Typography variant="body2" fontWeight="700" sx={{ color: '#24292f', ml: 0.2 }}>
                                {info?.userInfo?.FOLLOWER_COUNT ?? 0}
                            </Typography>
                        </ButtonBase>

                        {/* 팔로잉 버튼 */}
                        <ButtonBase onClick={() => navigator('/follow/followings')} sx={buttonStyle}>
                            <PersonAddAlt1RoundedIcon
                                className="icon-target"
                                sx={{ fontSize: 16, color: '#57606a', transition: 'color 0.15s' }}
                            />
                            <Typography
                                className="text-target"
                                variant="caption"
                                fontWeight="600"
                                sx={{ color: '#57606a', transition: 'color 0.15s', letterSpacing: '0.3px' }}
                            >
                                팔로잉
                            </Typography>
                            <Typography variant="body2" fontWeight="700" sx={{ color: '#24292f', ml: 0.2 }}>
                                {info?.userInfo?.FOLLOWING_COUNT ?? 0}
                            </Typography>
                        </ButtonBase>
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

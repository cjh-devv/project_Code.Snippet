import React from 'react';
import { Box, Typography } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import TerminalIcon from '@mui/icons-material/Terminal';

export const ProfileBio = ({ bio }) => {
    return (
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'rgba(0,0,0,0.04)' }}>
            <Box sx={{
                bgcolor: 'action.hover', 
                border: '1px solid',
                borderColor: 'action.selected',
                borderRadius: 2,
                position: 'relative',
                pt: 4, 
                pb: 2,
                px: 2
            }}>
                {/* 상단 파일명 탭 & 우측 툴바 장식 */}
                <Box sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, height: 32,
                    borderBottom: '1px solid',
                    borderColor: 'action.selected',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 1.5, bgcolor: 'rgba(0,0,0,0.01)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DescriptionIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: '700', color: 'text.secondary', fontFamily: 'monospace' }}>
                            README.md
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, opacity: 0.4 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.primary' }} />
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.primary' }} />
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.primary' }} />
                    </Box>
                </Box>

                {/* 본문 스크롤 영역 */}
                <Box sx={{ 
                    maxHeight: 250, 
                    overflowY: 'auto', 
                    pr: 0.5,
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-thumb': { bgcolor: 'action.selected', borderRadius: '4px' }
                }}>
                    {bio ? (
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.primary',
                                whiteSpace: "pre-wrap",
                                lineHeight: 1.6,
                                fontFamily: 'monospace',
                                letterSpacing: -0.2,
                                fontSize: '0.875rem'
                            }}
                        >
                            {bio}
                        </Typography>
                    ) : (
                        <Box sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.primary' }}>
                                <TerminalIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                                <span>cat intro.txt</span>
                            </Box>
                            <Box sx={{ pl: 2, color: 'text.disabled', fontStyle: 'italic' }}>
                                &gt; 등록된 자기소개 데이터가 존재하지 않습니다.
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

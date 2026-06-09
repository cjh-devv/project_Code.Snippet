import { Box, Typography } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { Link, useNavigate } from 'react-router-dom';

export default function Logo() {
    const MAIN_BLUE = '#6366f1'; // 깃허브 블루

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none'
            }}
        >
            {/* 심볼 아이콘 공간 */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: MAIN_BLUE,
                    color: '#ffffff',
                    marginRight: '10px',
                    boxShadow: '0 2px 6px rgba(9, 105, 218, 0.2)'
                }}
            >
                <CodeRoundedIcon sx={{ fontSize: 20 }} />
            </Box>

            {/* 브랜드 이름 텍스트 */}
            <Typography
                variant="h6"
                fontWeight="800"
                component={Link}
                to="/feed"
                sx={{
                    fontFamily: '"Fira Code", "Courier New", Courier, monospace',
                    color: '#1f2328',
                    display: 'flex',
                    alignItems: 'center',
                    letterSpacing: '-0.5px',
                    textDecoration: 'none'
                }}
            >
                Code
                <Box component="span" sx={{ color: MAIN_BLUE, mx: '2px', fontWeight: '900' }}>
                    .
                </Box>
                <Box
                    component="span"
                    sx={{
                        backgroundColor: 'rgba(9, 105, 218, 0.08)',
                        color: MAIN_BLUE,
                        px: '6px',
                        py: '2px',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: '700'
                    }}
                >
                    Snippet
                </Box>
            </Typography>
        </Box>
    );
}

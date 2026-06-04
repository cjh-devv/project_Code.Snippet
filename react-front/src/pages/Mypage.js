import React from 'react';

import {
    Container,
    Typography,
    Box,
    Avatar,
    Paper,
    Divider
} from '@mui/material';

function MyPage() {

    const posts = [
        {
            POST_ID: 1,
            TITLE: "JWT 인증 구현"
        },
        {
            POST_ID: 2,
            TITLE: "React 검색 기능"
        },
        {
            POST_ID: 3,
            TITLE: "Oracle LIKE 검색"
        }
    ];

    return (

        <Container
            maxWidth="md"
            sx={{ py: 4 }}
        >

            <Paper
                elevation={2}
                sx={{
                    p: 4,
                    borderRadius: 4,
                    textAlign: 'center'
                }}
            >

                <Avatar
                    sx={{
                        width: 90,
                        height: 90,
                        margin: '0 auto',
                        mb: 2
                    }}
                />

                <Typography
                    variant="h5"
                    fontWeight="bold"
                >
                    드림
                </Typography>

                <Typography
                    color="text.secondary"
                    sx={{ mt: 1 }}
                >
                    개발자를 위한 코드 기록 플랫폼
                </Typography>

                <Box
                    sx={{
                        mt: 3
                    }}
                >

                    <Typography
                        variant="h6"
                    >
                        게시글 12개
                    </Typography>

                </Box>

            </Paper>

            <Paper
                elevation={2}
                sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 4
                }}
            >

                <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                >
                    내가 작성한 게시글
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {
                    posts.map(post => (

                        <Box
                            key={post.POST_ID}
                            sx={{
                                py: 2,
                                borderBottom:
                                    '1px solid #eee',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor:
                                        '#f9fafb'
                                }
                            }}
                        >

                            <Typography
                                fontWeight="500"
                            >
                                {post.TITLE}
                            </Typography>

                        </Box>

                    ))
                }

            </Paper>

        </Container>

    );

}

export default MyPage;
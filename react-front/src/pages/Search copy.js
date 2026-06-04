import { useEffect, useState } from 'react';

import {
    Container,
    TextField,
    Typography,
    Box,
    CircularProgress
} from '@mui/material';

import Grid2 from '@mui/material/Grid2';

import PostCard from '../components/PostCard';

import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

function Search() {

    const [keyword, setKeyword] = useState("");

    const [feeds, setFeeds] = useState([]);

    const [loading, setLoading] = useState(false);

    function handleSearch(searchKeyword) {

        if (!searchKeyword.trim()) {

            setFeeds([]);
            return;
        }

        setLoading(true);

        fetch(
            `http://localhost:3010/post/search?keyword=${encodeURIComponent(searchKeyword)}`
        )
            .then(res => res.json())
            .then(data => {

                if (data.result === "success") {

                    setFeeds(data.data);

                }

            })
            .catch(err => {

                console.error("검색 실패", err);

            })
            .finally(() => {

                setLoading(false);

            });

    }

    useEffect(() => {

        const timer = setTimeout(() => {

            handleSearch(keyword);

        }, 300);

        return () => clearTimeout(timer);

    }, [keyword]);

    return (

        <Container
            maxWidth="lg"
            sx={{
                py: 4
            }}
        >

            <Box
                sx={{
                    mb: 4
                }}
            >

                <Typography
                    variant="h4"
                    fontWeight="bold"
                    gutterBottom
                >
                    검색
                </Typography>

                <TextField
                    fullWidth
                    placeholder="검색어를 입력하세요"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    slotProps={{
                        input: {
                            // 안쪽에 배치할 돋보기 아이콘
                            startAdornment: (
                                <InputAdornment position="start" sx={{ pl: 0.5 }}>
                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '9999px', // 완벽하게 둥근 모서리
                            paddingLeft: '12px',   // 아이콘과 테두리 사이 여백
                            backgroundColor: 'transparent',
                            transition: 'all 0.2s',
                            // 마우스 올렸을 때나 클릭했을 때 스타일을 커스텀하고 싶다면 여기에 추가 가능합니다.
                        }
                    }}
                />
            </Box>

            {
                keyword.trim() &&
                !loading &&
                feeds.length > 0 && (

                    <Typography
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        총 {feeds.length}개의 포스트를 찾았습니다.
                    </Typography>

                )
            }

            {
                loading && (

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mt: 5
                        }}
                    >
                        <CircularProgress />
                    </Box>

                )
            }

            {
                keyword.trim() &&
                !loading &&
                feeds.length === 0 && (

                    <Typography
                        color="text.secondary"
                        textAlign="center"
                        sx={{
                            mt: 5
                        }}
                    >
                        검색 결과가 없습니다.
                    </Typography>

                )
            }

            <Grid2
                container
                spacing={3}
            >

                {
                    feeds.map(feed => (

                        <Grid2
                            key={feed.POST_ID}
                            size={{
                                xs: 12,
                                md: 6
                            }}
                        >

                            <PostCard
                                feed={feed}
                            />

                        </Grid2>

                    ))
                }

            </Grid2>

        </Container>

    );

}

export default Search;
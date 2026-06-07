import { useEffect, useState } from 'react';
import {
    Container,
    TextField,
    Typography,
    Box,
    IconButton,
    Chip,
    Stack,
    Skeleton
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import PostCard from '../components/PostCard';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InputAdornment from '@mui/material/InputAdornment';

function Search() {
    const [keyword, setKeyword] = useState("");
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const [recentSearches, setRecentSearches] = useState(() => {
        const saved = localStorage.getItem('recent_searches');
        return saved ? JSON.parse(saved) : [];
    });

    const saveSearchKeyword = (word) => {
        if (!word.trim()) return;
        setRecentSearches((prev) => {
            const filtered = prev.filter((item) => item !== word);
            const next = [word, ...filtered].slice(0, 5);
            localStorage.setItem('recent_searches', JSON.stringify(next));
            return next;
        });
    };

    // ESC 및 Enter 키 감지 핸들러
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveSearchKeyword(keyword);
        } else if (e.key === 'Escape') {
            // ESC 누르면 입력창과 결과를 모두 초기화
            handleClear();
        }
    };

    const handleSearchButtonClick = () => {
        saveSearchKeyword(keyword);
    };

    const handleRecentClick = (word) => {
        setKeyword(word);
        saveSearchKeyword(word);
    };

    const handleDeleteRecent = (wordToDelete) => {
        setRecentSearches((prev) => {
            const next = prev.filter((item) => item !== wordToDelete);
            localStorage.setItem('recent_searches', JSON.stringify(next));
            return next;
        });
    };

    function handleSearch(searchKeyword) {
        if (!searchKeyword.trim()) {
            setFeeds([]);
            setSearched(false);
            return;
        }

        setLoading(true);
        setSearched(true);

        fetch(`http://localhost:3010/post/search?keyword=${encodeURIComponent(searchKeyword)}`)
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

    const handleClear = () => {
        setKeyword("");
        setFeeds([]);
        setSearched(false);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 5, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="800" sx={{ mb: 3, letterSpacing: '-0.5px' }}>
                    무엇을 찾고 계신가요?
                </Typography>

                <TextField
                    fullWidth
                    placeholder="제목, 내용, 태그로 검색해보세요"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown} // ESC와 Enter 둘 다 여기서 처리
                    slotProps={{
                        input: {
                            startAdornment: <Box sx={{ pl: 1 }} />,
                            endAdornment: (
                                <InputAdornment position="end" sx={{ gap: 0.5, pr: 0.5 }}>
                                    {keyword && (
                                        <IconButton onClick={handleClear} size="small">
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    <IconButton 
                                        onClick={handleSearchButtonClick} 
                                        size="small"
                                        color={keyword.trim() ? "primary" : "default"}
                                    >
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        },
                    }}
                    sx={{
                        maxWidth: '600px',
                        mx: 'auto',
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '9999px',
                            backgroundColor: 'background.paper',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.3s ease',
                            '&:hover': { boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.12)' },
                            '&.Mui-focused': { boxShadow: '0px 4px 20px rgba(25, 118, 210, 0.15)' }
                        }
                    }}
                />

                {!keyword.trim() && recentSearches.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            최근 검색어
                        </Typography>
                        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                            {recentSearches.map((word) => (
                                <Chip 
                                    key={word} 
                                    label={word} 
                                    variant="outlined"
                                    clickable 
                                    onClick={() => handleRecentClick(word)}
                                    onDelete={() => handleDeleteRecent(word)}
                                    // 글자가 길어지면 가로 길이를 제한하고 ... 처리하기
                                    sx={{ 
                                        borderRadius: '8px',
                                        maxWidth: '140px', // 원하는 최대 너비로 조절 가능합니다.
                                        '& .MuiChip-label': {
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                )}
            </Box>

            {searched && !loading && feeds.length > 0 && (
                <Typography color="text.secondary" variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                    '<strong>{keyword}</strong>' 검색 결과 총 <strong>{feeds.length}</strong>개
                </Typography>
            )}

            <Grid2 container spacing={3}>
                {loading && (
                    Array.from(new Array(4)).map((_, index) => (
                        <Grid2 key={index} size={{ xs: 12, md: 6 }}>
                            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 3 }}>
                                <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1 }} />
                                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
                                <Skeleton variant="text" width="40%" />
                            </Box>
                        </Grid2>
                    ))
                )}

                {!loading && feeds.map(feed => (
                    <Grid2 key={feed.POST_ID} size={{ xs: 12, md: 6 }}>
                        <PostCard feed={feed} />
                    </Grid2>
                ))}

                {searched && !loading && feeds.length === 0 && (
                    <Grid2 size={12}>
                        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                일치하는 검색 결과가 없습니다.
                            </Typography>
                            <Typography variant="body2">
                                다른 검색어를 입력하시거나 철자를 확인해 보세요.
                            </Typography>
                        </Box>
                    </Grid2>
                )}
            </Grid2>
        </Container>
    );
}

export default Search;

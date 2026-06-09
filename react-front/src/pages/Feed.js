import React, { useEffect, useState } from 'react';
import { Container, Box, Grid2, Typography, Button, Paper } from '@mui/material';
import PostCard from '../components/PostCard';
import { useNavigate } from 'react-router-dom';
import CreateIcon from '@mui/icons-material/Create';
import CodeIcon from '@mui/icons-material/Code';

function Feed() {
  const navigator = useNavigate();
  const [feeds, setFeeds] = useState([]);

  const handleGetFeed = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인 후 이용해주세요.");
      navigator("/");
      return;
    }

    fetch("http://localhost:3010/post/feed?page=1&size=10", {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          alert("로그인이 만료되었습니다.");
          localStorage.removeItem("token");
          window.location.href = "/";
          throw new Error("UNAUTHORIZED");
        }
        return res.json();
      })
      .then(data => {
        console.log("FEED DATA:", data);
        setFeeds(data.data.list);
      })
      .catch(err => {
        alert("서버 에러 발생!");
      });
  };

  useEffect(() => {
    handleGetFeed();
  }, []);

  return (
    <Container maxWidth="md" sx={{ pb: 6 }}>
      
      {/* 1. 상단 웰컴 및 글쓰기 유도 배너 (로그인 감성을 라이트하게 녹여냄) */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mt: 2,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)', // 연한 인디고-퍼플 그라데이션
          border: '1px solid rgba(99, 102, 241, 0.15)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <CodeIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              오늘의 코드를 공유해보세요
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Code.Snippet에서 동료 개발자들의 유용한 인사이트를 탐색합니다.
          </Typography>
        </Box>

        {/* 테마에 맞춘 글쓰기 버튼 */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<CreateIcon />}
          onClick={() => navigator('/register')}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1,
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
            whiteSpace: 'nowrap',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(99, 102, 241, 0.35)',
            }
          }}
        >
          스니펫 기록하기
        </Button>
      </Paper>

      {/* 2. 게시글 목록 영역 구성을 위한 타이틀 정리 */}
      <Box mt={5} mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
          최근 올라온 스니펫 🚀
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          총 {feeds.length}개의 게시글
        </Typography>
      </Box>

      {/* 3. 그리드 카드 영역 마우스 호버 애니메이션 추가 */}
      <Box>
        <Grid2 container spacing={3}>
          {feeds.map(feed => (
            <Grid2 
              size={{ xs: 12, md: 6 }} 
              key={feed.POST_ID}
              sx={{
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)', // 살짝 떠오르는 모션
                }
              }}
            >
              <PostCard
                feed={feed}
                refreshFeed={handleGetFeed}
              />
            </Grid2>
          ))}
        </Grid2>
      </Box>

    </Container>
  );
}

export default Feed;

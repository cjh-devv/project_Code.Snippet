import React, { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import { Container, Box, Grid2, Typography, Button } from '@mui/material';
import PostCard from '../components/PostCard';
import { useNavigate } from 'react-router-dom';

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

        if (
          res.status === 401 ||
          res.status === 403
        ) {

          alert("로그인이 만료되었습니다.");

          localStorage.removeItem("token");

          window.location.href = "/";

          throw new Error("UNAUTHORIZED");
        }

        return res.json();

      })
      .then(data => {

        console.log("FEED DATA:", data)
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
    <Container maxWidth="md">

      <Box
        sx={{
          py: 4,
          textAlign: "center"
        }}
      >
        {/* <Typography
          variant="h4"
          fontWeight="bold"
        >
          Code.Snippet
        </Typography>

        <Typography color="text.secondary">
          개발자를 위한 코드 기록 플랫폼
        </Typography> */}
      </Box>

      <Box mt={4}>
        <Grid2 container spacing={3}>

          {feeds.map(feed => (
            <Grid2 size={{
              xs: 12,
              md: 6
            }} key={feed.POST_ID}>
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
import React, { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import { Container, Box, Grid2 } from '@mui/material';
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
      .then(res => res.json())
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

      <Box mt={4}>
        <Grid2 container spacing={3}>

          {feeds.map(feed => (
            <Grid2 xs={12} sm={6} md={4} key={feed.POST_ID}>
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
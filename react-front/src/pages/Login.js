import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Login() {

  const navigator = useNavigate();

  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");

  const handleLogin = () => {

    if (!userId.trim() || !pwd.trim()) {
      alert("아이디/비밀번호 입력");
      return;
    }

    const info = {
      userId,
      pwd
    };

    fetch("http://localhost:3010/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(info)
    })
      .then(res => res.json())
      .then(data => {

        console.log(data);

        if (data.result === true) {

          // 1. 토큰 저장 
          localStorage.setItem("token", data.token);

          // 2. userId 저장
          localStorage.setItem("userId", data.userId);

          alert(data.message);

          navigator("/feed");

        } else {
          alert(data.message || "로그인 실패");
        }

      })
      .catch(err => {
        console.error(err);
        alert("서버 에러 발생");
      });

  };

  return (
    <Container maxWidth="xs">

      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        minHeight="100vh"
      >

        <Typography variant="h4">로그인</Typography>

        <TextField
          label="ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          margin="normal"
          fullWidth
        />

        <TextField
          label="Password"
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          margin="normal"
          fullWidth
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          로그인
        </Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          회원 아니면? <Link to="/join">회원가입</Link>
        </Typography>

      </Box>

    </Container>
  );
}

export default Login;
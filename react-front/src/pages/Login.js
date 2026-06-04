import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent
} from '@mui/material';

function Login() {

  const navigator = useNavigate();

  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");

  const handleLogin = () => {

    if (!userId.trim() || !pwd.trim()) {
      alert("아이디와 비밀번호를 입력하세요");
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
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >

        <Card
          sx={{
            width: "100%",
            borderRadius: 4,
            boxShadow: 6
          }}
        >
          <CardContent sx={{ p: 4 }}>

            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
            >
              Code.Snippet
            </Typography>

            <Typography
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              개발자를 위한 코드 기록 플랫폼
            </Typography>

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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              onClick={handleLogin}
            >
              로그인
            </Button>

            <Typography
              variant="body2"
              textAlign="center"
              sx={{ mt: 3 }}
            >
              회원이 아니신가요?{" "}
              <Link to="/join">
                회원가입
              </Link>
            </Typography>

          </CardContent>
        </Card>

      </Box>

    </Container>
  );
}

export default Login;
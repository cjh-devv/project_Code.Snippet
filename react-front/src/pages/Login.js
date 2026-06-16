import React, { useContext, useState } from 'react';
import { UserContext } from '../components/context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import CodeIcon from '@mui/icons-material/Code';
import Logo from '../components/Logo';

function Login() {
  const { refreshUserInfo } = useContext(UserContext);
  const navigator = useNavigate();

  const [userId, setUserId] = useState("");
  const [pwd, setPwd] = useState("");

  const handleLogin = () => {
    if (!userId.trim() || !pwd.trim()) {
      alert("아이디와 비밀번호를 입력하세요");
      return;
    }

    const info = { userId, pwd };

    fetch("/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info)
    })
      .then(res => res.json())
      .then(data => {
        if (data.result === true) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);
          refreshUserInfo();
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2
      }}
    >
      <Container maxWidth="xs">
        <Card
          sx={{
            width: "100%",
            borderRadius: 4,
            // 2. 글래스모피즘 효과 (반투명 카드)
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }}
        >
          <CardContent sx={{ p: 4 }}>

            {/* 3. 로고 영역 개발자 감성(Code 아이콘 + Monospace 폰트) 커스텀 */}
            <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={1}>
              <CodeIcon sx={{ color: '#818cf8', fontSize: 32 }} />
              <Typography
                variant="h4"
                fontWeight="bold"
                textAlign="center"
                sx={{
                  fontFamily: 'Courier New, Courier, monospace',
                  color: '#ffffff',
                  letterSpacing: '1px'
                }}
              >
                Code.Snippet
              </Typography>
            </Box>

            <Typography
              textAlign="center"
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 4 }}
            >
              개발자를 위한 코드 기록 플랫폼
            </Typography>

            {/* 4. 입력창 스타일 다크 모드 동기화 및 아이콘 배치 */}
            <TextField
              label="ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              margin="normal"
              fullWidth
              variant="outlined"
              slotProps={{
                inputLabel: { style: { color: 'rgba(255, 255, 255, 0.6)' } },
                htmlInput: { style: { color: '#ffffff' } } // 글자 타이핑 시 흰색으로 나오도록 보완
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: '#818cf8' },
                }
              }}
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
              slotProps={{
                inputLabel: { style: { color: 'rgba(255, 255, 255, 0.6)' } },
                htmlInput: { style: { color: '#ffffff' } } // 글자 타이핑 시 흰색으로 나오도록 보완
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover fieldset': { borderColor: '#818cf8' },
                }
              }}
            />

            {/* 5. 트렌디한 그라데이션 버튼 및 호버 효과 */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleLogin}
              sx={{
                mt: 4,
                py: 1.5,
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6)',
                }
              }}
            >
              로그인
            </Button>

            {/* 6. 하단 링크 스타일 수정 */}
            <Typography
              variant="body2"
              textAlign="center"
              sx={{ mt: 3, color: 'rgba(255, 255, 255, 0.5)' }}
            >
              회원이 아니신가요?{" "}
              <Link to="/join" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 'bold' }}>
                회원가입
              </Link>
            </Typography>

          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Login;

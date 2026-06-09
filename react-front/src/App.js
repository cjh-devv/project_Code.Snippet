import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Login from './pages/Login';
import Header from './components/Header';
import Feed from './pages/Feed';
import Join from './pages/Join';
import Register from './pages/Register';
import Search from './pages/Search';
import EditPost from './pages/EditPost';
import Mypage from './pages/Mypage';
import ProfileEditPage from './pages/ProfileEditPage';
import FollowersPage from './pages/FollowersPage';
import FollowingsPage from './pages/FollowingsPage';
import FollowListPage from './pages/FollowListPage';

import { UserProvider } from './components/context/UserContext';

// 🎨 1. 로그인 색상 감성을 가져간 통합 라이트 테마 정의
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',     // 로그인 버튼에 쓴 메인 보라색 (Indigo)
      dark: '#4f46e5',     // 마우스 올렸을 때 짙은 보라색
      light: '#e0e7ff',    // 태그 등에 쓸 연한 보라색
    },
    secondary: {
      main: '#a855f7',     // 포인트용 퍼플
    },
    background: {
      // ★ 핵심: 일반 회색 대신 보라빛이 0.5스푼 섞인 은은하고 화사한 다크시안/라벤더 그레이 적용
      default: '#e0e7ff', 
      paper: '#ffffff',     // 카드 배경은 깨끗한 흰색 유지 (글씨 잘 보이게)
    },
    text: {
      primary: '#1e1b4b',   // ★ 핵심: 본문 글씨색을 새까만 색 대신, 로그인 배경색 계열인 '매우 짙은 인디고 네이비'로 세팅 (고급스러움 업)
      secondary: '#64748b', // 부가 설명 글씨색
    },
  },
  typography: {
    fontFamily: `'Pretendard', '-apple-system', sans-serif`,
  },
});

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/join';

  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <CssBaseline /> {/* 정의한 background.default 색상을 온 앱에 자동 적용 */}
        {!isAuthPage && <Header />}
        <Box 
          component="main" 
          sx={{ 
            minHeight: '100vh',
            // 로그인/회원가입만 특별히 딥한 그라데이션을 주고, 나머지는 테마 배경색(#f4f5fa) 사용
            background: isAuthPage 
              ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' 
              : 'transparent',
            p: isAuthPage ? 0 : 3,
            pt: isAuthPage ? 0 : 3,
          }}
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/join" element={<Join />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route path="/edit/:postId" element={<EditPost />} />
            <Route path="/mypage" element={<Mypage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/followers" element={<FollowersPage />} />
            <Route path="/followings" element={<FollowingsPage />} />
            <Route path="/follow/:type" element={<FollowListPage />} />
          </Routes>
        </Box>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;

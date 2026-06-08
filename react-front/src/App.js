import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
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

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/join';

  return (
    <>
      <UserProvider>
        <CssBaseline />
        {!isAuthPage && <Header />} {/* 로그인과 회원가입 페이지가 아닐 때만 Menu 렌더링 */}
        <Box component="main" sx={{ p: 3, minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
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
    </>
  );
}

export default App;

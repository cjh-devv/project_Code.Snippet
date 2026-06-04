import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Sub from './components/Sub';
import Header from './components/Header';
import Feed from './pages/Feed';
import Join from './pages/Join';
import Register from './pages/Register';
import Search from './pages/Search';
import EditPost from './pages/EditPost';
import Mypage from './pages/Mypage';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/join';

  return (
    <>
      <CssBaseline />
      {!isAuthPage && <Header />} {/* 로그인과 회원가입 페이지가 아닐 때만 Menu 렌더링 */}
      <Box component="main" sx={{ p: 3, minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/sub" element={<Sub />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/join" element={<Join />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/edit/:postId" element={<EditPost />}/>
          <Route path="/mypage" element={<Mypage />}/>
        </Routes>
      </Box>
    </>
  );
}

export default App;

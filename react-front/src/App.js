import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Sub from './components/Sub';
import Menu from './components/Menu';
import Feed from './pages/Feed';
import Join from './pages/Join';
import Register from './pages/Register';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/join';

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {!isAuthPage && <Menu />} {/* 로그인과 회원가입 페이지가 아닐 때만 Menu 렌더링 */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/sub" element={<Sub />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/join" element={<Join />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;

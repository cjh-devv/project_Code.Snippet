import React, { useContext, useState } from 'react'; // 👈 useState, useContext 추가
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,       
  MenuItem,   
  Avatar   
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LogoutIcon from '@mui/icons-material/Logout'; 
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Logo from './Logo';

import { Link, useNavigate } from 'react-router-dom'; 
import { UserContext } from './context/UserContext'; 

function Header() {
  const { globalUserInfo, clearUserInfo } = useContext(UserContext); 
  const navigate = useNavigate();
  
  // 프로필 메뉴 팝업 제어를 위한 상태
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    localStorage.removeItem("token"); // 토큰 파괴
    clearUserInfo(); // 전역 정보 초기화 (null)
    alert("로그아웃 되었습니다.");
    navigate("/"); // 메인화면 이동
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "rgba(250,250,250,0.8)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid #e5e5e5",
        color: "#171717"
      }}
    >
      <Toolbar
        sx={{
          maxWidth: "900px",
          width: "100%",
          mx: "auto",
          justifyContent: "space-between"
        }}
      >
        <Logo></Logo>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton component={Link} to="/feed" color="inherit">
            <HomeIcon />
          </IconButton>
          <IconButton component={Link} to="/search" color="inherit">
            <SearchIcon />
          </IconButton>
          <IconButton component={Link} to="/register" color="inherit">
            <EditNoteIcon />
          </IconButton>

          {/* 로그인 여부에 따른 동적 프로필 영역 구성 */}
          {globalUserInfo ? (
            <>
              {/* 로그인 상태: 아바타 아이콘을 클릭하면 드롭다운 메뉴가 열림 */}
              <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                <Avatar 
                  src={globalUserInfo?.PROFILE_IMAGE || "/logo512.png"} 
                  sx={{ width: 30, height: 30 }}
                />
              </IconButton>
              
              {/* 드롭다운 메뉴 구성 */}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { handleMenuClose(); navigate('/mypage'); }} sx={{ gap: 1 }}>
                  <AccountCircleIcon fontSize="small" /> 마이페이지
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main', gap: 1 }}>
                  <LogoutIcon fontSize="small" /> 로그아웃
                </MenuItem>
              </Menu>
            </>
          ) : (
            // 비로그인 상태: 로그인 페이지로 가는 일반 버튼 노출
            <IconButton component={Link} to="/" color="inherit">
              <Avatar sx={{ width: 30, height: 30 }} /> {/* 빈 아바타 모양 */}
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;

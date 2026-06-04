import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { Link } from 'react-router-dom';

function Header() {

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

        <Typography
          component={Link}
          to="/feed"
          sx={{
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '1.4rem',
            mr: 20,
            '&:visited': {
              color: "#171717"
            },
            '&:hover': {
              color: "#171717"
            }
          }}
        >
          <span style={{ color: "#2563eb" }}>
            {"<"}
          </span>

          Code.Snippet

          <span style={{ color: "#2563eb" }}>
            {"/>"}
          </span>
        </Typography>
        <Box sx={{
          display: "flex",
          gap: 1,
        }}>
          <IconButton
            component={Link}
            to="/feed"
            color="inherit"
          >
            <HomeIcon />
          </IconButton>
          <IconButton
            component={Link}
            to="/search"
            color="inherit"
          >
            <SearchIcon />
          </IconButton>

          <IconButton
            component={Link}
            to="/register"
            color="inherit"
          >
            <EditNoteIcon />
          </IconButton>

          <IconButton
            component={Link}
            to="/mypage"
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>

    </AppBar>
  );
}

export default Header;
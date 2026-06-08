import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';

import { Link } from 'react-router-dom';

function Header() {

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#ffffff',
        color: '#111827',
        borderBottom: "1px solid #e5e7eb"
      }}>

      <Toolbar>

        <Typography
          variant="h6"
          component={Link}
          to="/feed"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            mr: 4,
            fontWeight: 'bold'
          }}
        >
          Code.Snippet
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />

        <IconButton
          color="inherit"
          component={Link}
          to="/search"
        >
          <SearchIcon />
        </IconButton>
        <Button
          color="inherit"
          component={Link}
          to="/register"
        >
          글쓰기
        </Button>

      </Toolbar>

    </AppBar>
  );
}

export default Header;
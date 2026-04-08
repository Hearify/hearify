import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6444F4',
    },
  },
  typography: {
    fontFamily: 'Nunito',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          borderRadius: 8,
        },
        outlined: {
          border: '2px solid',
          '&:hover': {
            border: '2px solid',
          },
        },
      },
    },
  },
});

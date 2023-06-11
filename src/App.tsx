import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import "./App.sass";
import { Outlet, useRouteError } from 'react-router-dom';
import { AccountContext, UserButton } from './components/User';
import { currentUser } from './lib/api';

export function AppError() {
  const error:any = useRouteError();
  return (
    <div className="error-page-wrapper">
      <div className="error-page">
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
          <i>{error.statusText || error.message}</i>
        </p>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = React.useState( currentUser() );
  React.useEffect(() => {
    const onSignIn = (e: CustomEvent ) => {
      setUser( e.detail );
    };
    const onSignOut = (e: CustomEvent) => {
      setUser( null );
    };
    document.addEventListener('auth:sign_in', onSignIn);
    document.addEventListener('auth:sign_out', onSignOut );
    return () => {
      document.removeEventListener('auth:sign_in', onSignIn);
      document.removeEventListener('auth:sign_out', onSignOut);
    }
  }, []);
  return (
    <AccountContext.Provider value={user}>
    <Box component="header" sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{flex: 1}}>
            Сервис учета кражи
          </Typography>
          <UserButton/>
        </Toolbar>
      </AppBar>
      <Box sx={{mt: {lg: "20px", md: "20px"}, padding: "10px"}}>
        <Box component="main" sx={{maxWidth: '1200px', margin: 'auto'}}>
          <Outlet/>
        </Box>
      </Box>
    </Box>
    </AccountContext.Provider>
  );
}

export default App;
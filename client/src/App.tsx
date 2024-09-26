import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import {
  Container,
  Button,
  BottomNavigation,
  BottomNavigationAction,
  Typography
} from '@mui/material';
import { Admin, Login, Profile, Register, Settings, Users } from './views';
import 'styles/App.scss';
import {
  setErrorMessage,
  setSuccessMessage,
  setConfirmationMessage
} from 'store/slices/notifications';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { TODO } from 'shared/types';
import { Dialog, Snackbars, Loading, Header } from 'components';
import {
  AdminPanelSettings,
  Home,
  Login as LoginIcon,
  Logout,
  PersonAdd,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useCheckSession, useLogout } from 'hooks';
import { useEffect } from 'react';

// Seahawk theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#002d72'
    },
    secondary: {
      main: '#0072ce'
    }
  }
});

const App = () => {
  const dispatch = useDispatch();
  const { handleSubmit: handleCheckSession } = useCheckSession();
  const { handleClick: handleClickLogout } = useLogout();

  const user = useSelector((state: TODO) => state.user);
  const {
    success: successMessage,
    error: errorMessage,
    confirmation: confirmationMessage,
    isLoading: isLoadingMessage
  } = useSelector((state: TODO) => state.notifications);

  useEffect(() => {
    if (user.id === null) {
      handleCheckSession();
    }
  }, [user]);

  const isAuthenticated = Boolean(user.id);

  let bottomNavigationItems = [
    <BottomNavigationAction key="home" label="Home" icon={<Home />} component={Link} to="/" />
  ];

  if (isAuthenticated) {
    bottomNavigationItems.push(
      <BottomNavigationAction
        key="settings"
        label="Settings"
        icon={<SettingsIcon />}
        component={Link}
        to="/settings"
      />
    );

    if (user.isAdmin) {
      bottomNavigationItems.push(
        <BottomNavigationAction
          key="admin"
          label="Admin"
          icon={<AdminPanelSettings />}
          component={Link}
          to="/admin"
        />
      );
    }

    bottomNavigationItems.push(
      <BottomNavigationAction
        key="logout"
        label="Logout"
        icon={<Logout />}
        component={Typography}
        onClick={handleClickLogout}
      />
    );
  } else {
    bottomNavigationItems.push(
      <BottomNavigationAction
        key="login"
        label="Login"
        icon={<LoginIcon />}
        component={Link}
        to="/login"
      />,
      <BottomNavigationAction
        key="register"
        label="Register"
        icon={<PersonAdd />}
        component={Link}
        to="/register"
      />
    );
  }

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Header />
        <Container maxWidth="md" sx={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/settings/:tab?" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/:username" element={<Profile />} />
            <Route path="/" element={<div>Home</div>} />
          </Routes>
          <Loading isVisible={isLoadingMessage !== null} message={isLoadingMessage ?? ''} />
          <Snackbars
            successMessage={successMessage}
            setSuccessMessage={(message: string) => dispatch(setSuccessMessage(message))}
            errorMessage={errorMessage}
            setErrorMessage={(message: string) => dispatch(setErrorMessage(message))}
          />
          <Dialog
            isOpen={confirmationMessage !== null}
            onClose={() => {
              dispatch(setConfirmationMessage(null));
            }}
            title={confirmationMessage?.title ?? 'Are you sure?'}
            fullWidth={false}
            buttons={
              <>
                <Button
                  variant="contained"
                  onClick={() => {
                    confirmationMessage?.onConfirm();
                    dispatch(setConfirmationMessage(null));
                  }}
                >
                  Submit
                </Button>
                <Button
                  onClick={() => {
                    dispatch(setConfirmationMessage(null));
                  }}
                >
                  Cancel
                </Button>
              </>
            }
          >
            {confirmationMessage?.children}
          </Dialog>
        </Container>
        <BottomNavigation
          showLabels
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000
          }}
        >
          {bottomNavigationItems}
        </BottomNavigation>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

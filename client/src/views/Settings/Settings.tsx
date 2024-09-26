import { Form, PageHeader } from 'components';
import { useForm } from 'react-hook-form';
import {
  Button,
  FormControl,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { CirclePicker } from 'react-color';
import { useAccountSettings } from 'hooks';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TODO } from 'shared/types';
import { User } from 'types/auth';
import { setErrorMessage } from 'store/slices/notifications';
import { getUserPFP } from 'utils';
import { AccountCircle, Delete } from '@mui/icons-material';
import { PFPAvatar, UsernamePreview } from './styles';
import { useNavigate, useParams } from 'react-router-dom';

const Settings = () => {
  const dispatch = useDispatch();
  const { tab = 'username' } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const {
    isLoading,
    isSubmitting,
    handleGetSettings,
    handleSubmitUsername,
    handleUpdatePFP,
    handleDeletePFP,
    handleSubmitPassword
  } = useAccountSettings();
  const user: User = useSelector((state: TODO) => state.user);

  const { username, originalUsername, email, isEmailVerified, nameColor, pfp } = user;

  const {
    register: registerUsername,
    handleSubmit: submitUserName,
    setValue: setUsernameValue,
    reset: resetUsername,
    watch
  } = useForm();
  const { register: registerPFP, reset: resetPFP } = useForm();
  const { register: registerPassword, handleSubmit: submitPassword } = useForm();

  useEffect(() => {
    handleGetSettings();
  }, []);

  useEffect(() => {
    resetUsername({
      username,
      nameColor
    });
  }, [user]);

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    navigate(`/settings/${newValue}`);
  };

  const onSubmitUsername = (data: TODO) => {
    const { username, nameColor } = data;
    handleSubmitUsername(username, nameColor);
  };

  const onSubmitPFP = (file: File) => {
    handleUpdatePFP(file);
    resetPFP();
  };

  const handleClickDeletePFP = () => {
    handleDeletePFP();
  };

  const onSubmitPassword = (data: TODO) => {
    const { oldPassword, newPassword, confirmPassword } = data;

    if (newPassword !== confirmPassword) {
      dispatch(setErrorMessage('Passwords do not match'));
      return;
    }

    handleSubmitPassword(oldPassword, newPassword);
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (!user.id) {
    return <Typography>Error: User not found</Typography>;
  }

  return (
    <>
      <PageHeader text="Settings" />
      {/* Tabs */}
      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label="Username" value="username" />
        <Tab label="Email" value="email" />
        <Tab label="Profile Picture" value="pfp" />
        <Tab label="Security" value="security" />
      </Tabs>
      {tab === 'username' && (
        <section>
          <Form onSubmit={submitUserName(onSubmitUsername)}>
            <Typography>
              Your original username will always stay reserved for you: {originalUsername}
            </Typography>
            <TextField
              label="Username"
              fullWidth
              {...registerUsername('username', { required: true })}
            />
            <FormControl>
              {/* @ts-ignore */}
              <CirclePicker
                onChange={(color) => {
                  setUsernameValue('nameColor', color.hex);
                }}
              />
            </FormControl>
            <TextField
              label="Username Color"
              fullWidth
              {...registerUsername('nameColor', { required: true })}
            />
            <UsernamePreview backgroundColor={watch('nameColor')}>{username}</UsernamePreview>
            <Button variant="contained" type="submit" disabled={isSubmitting === 'username'}>
              Update Username
            </Button>
          </Form>
        </section>
      )}
      {tab === 'email' && (
        <section>
          <Typography>Email: {email}</Typography>
          <Typography>Email Verified: {isEmailVerified ? 'Yes' : 'No'}</Typography>
        </section>
      )}
      {tab === 'pfp' && (
        <section>
          <Form>
            <PFPAvatar src={getUserPFP(user.id)}>
              <AccountCircle />
            </PFPAvatar>
            {pfp.length > 0 && (
              <Typography>
                {pfp}
                <Tooltip title="Delete Profile Picture" placement="top">
                  <IconButton onClick={handleClickDeletePFP} disabled={isSubmitting === 'pfp'}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Typography>
            )}
            <Button variant="contained" component="label" disabled={isSubmitting === 'pfp'}>
              Upload File
              <input
                type="file"
                hidden
                {...registerPFP('file', { required: true })}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target?.files?.[0]; // Access the file directly from the event
                  if (file) {
                    // Trigger the form submission manually
                    onSubmitPFP(file);
                  }
                }}
                disabled={Boolean(isSubmitting)}
              />
            </Button>
          </Form>
        </section>
      )}
      {tab === 'security' && (
        <section>
          <Form onSubmit={submitPassword(onSubmitPassword)}>
            <TextField
              label="Old Password"
              type="password"
              fullWidth
              {...registerPassword('oldPassword', { required: true })}
              autoComplete="current-password"
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              {...registerPassword('newPassword', { required: true })}
            />
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              {...registerPassword('confirmPassword', { required: true })}
            />
            <Button variant="contained" type="submit" disabled={isSubmitting === 'password'}>
              Update Password
            </Button>
          </Form>
        </section>
      )}
    </>
  );
};

export default Settings;

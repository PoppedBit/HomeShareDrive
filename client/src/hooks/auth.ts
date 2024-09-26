import {
  requestAccount,
  requestCheckSession,
  requestDeletePFP,
  requestLogin,
  requestLogout,
  requestRegister,
  requestUpdatePassword,
  requestUpdatePFP,
  requestUpdateUsername
} from 'api';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setConfirmationMessage,
  setErrorMessage,
  setSuccessMessage
} from 'store/slices/notifications';
import { setUser } from 'store/slices/user';
import { TODO } from 'shared/types';

export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (data: TODO) => {
    setIsSubmitting(true);

    const { identifier = '', password = '' } = data;

    try {
      const response = await requestLogin(identifier, password);

      if (response.status === 200) {
        dispatch(setUser(undefined));
        // TODO - Where to go on success?
        window.location.href = `${import.meta.env.VITE_BASE_URL}/`;
      } else {
        const error = await response.text();
        dispatch(setErrorMessage(error));
      }
    } catch (e) {
      console.log(e);
      dispatch(setErrorMessage('An unexpected error occured'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};

const unauthenticatedSession = {
  ID: 0,
  Username: '',
  IsAdmin: false,
  NameColor: ''
};

export const useCheckSession = () => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await requestCheckSession();

      if (response.status === 200) {
        const data = await response.json();
        dispatch(setUser(data));
      } else {
        const error = await response.text();
        dispatch(setErrorMessage(error));
        dispatch(setUser(unauthenticatedSession));
      }
    } catch (e) {
      console.log(e);
      dispatch(setErrorMessage('An unexpected error occured'));
      dispatch(setUser(unauthenticatedSession));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};

export const useLogout = () => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(
      setConfirmationMessage({
        title: 'Are you sure you want to logout?',
        onConfirm: handleSubmit
      })
    );
  };

  const handleSubmit = async () => {
    try {
      const response = await requestLogout();

      if (response.status === 200) {
        dispatch(setUser(null));
        window.location.href = window.location.href;
      } else {
        const error = await response.text();
        dispatch(setErrorMessage(error));
      }
    } catch (e) {
      console.log(e);
      dispatch(setErrorMessage('An unexpected error occured'));
    }
  };

  return {
    handleClick
  };
};

export const useRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (data: TODO) => {
    setIsSubmitting(true);

    const { username, email, password, confirmPassword } = data;

    try {
      // Email formatted correctly
      const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email.length && !emailRegex.test(email)) {
        dispatch(setErrorMessage('Invalid Email'));
        return;
      }

      // Check username meets requirements
      // ensures that the string starts with an alphanumeric character
      const usernameRegex: RegExp = /^[a-zA-Z0-9](?!.*[.-]{2})[a-zA-Z0-9.-]{1,28}[a-zA-Z0-9]$/;
      if (!usernameRegex.test(username)) {
        dispatch(setErrorMessage('Invalid Username'));
        return;
      }

      // Password meets requirements
      // 8 or more characters
      // 1 letter
      // 1 number
      // 1 special character
      const passwordRegex: RegExp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*\W).{8,}$/;
      if (!passwordRegex.test(password)) {
        dispatch(
          setErrorMessage(
            'Password must have at least 8 characters, with at least 1 letter, number, and special character'
          )
        );
        return;
      }

      // Check passwords match
      if (password !== confirmPassword) {
        dispatch(setErrorMessage('Passwords do not match'));
        return;
      }
      const response = await requestRegister({
        username,
        email,
        password
      });

      if (response.status === 201) {
        dispatch(setSuccessMessage(`Account for ${email} created.`));
        navigate(`${import.meta.env.VITE_BASE_URL}/login`);
      } else {
        const error = await response.text();
        dispatch(setErrorMessage(error));
      }
    } catch (e) {
      console.log(e);
      dispatch(setErrorMessage('An unexpected error occured'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};

export const useAccountSettings = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<'username' | 'pfp' | 'password' | false>(false);

  const handleGetSettings = async () => {
    setIsLoading(true);

    try {
      const response = await requestAccount();

      if (response.status === 200) {
        const data = await response.json();
        dispatch(setUser(data));
      } else {
        const error = await response.text();
        dispatch(setErrorMessage(error));
      }
    } catch (e) {
      console.log(e);
      dispatch(setErrorMessage('An unexpected error occured'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitUsername = async (username: string, nameColor: string) => {
    setIsSubmitting('username');

    // Check username meets requirements
    // ensures that the string starts with an alphanumeric character
    const usernameRegex: RegExp = /^[a-zA-Z0-9](?!.*[.-]{2})[a-zA-Z0-9.-]{1,28}[a-zA-Z0-9]$/;
    if (!usernameRegex.test(username)) {
      dispatch(setErrorMessage('Invalid Username'));
      return;
    }

    try {
      const response = await requestUpdateUsername(username, nameColor);

      if (response.status === 200) {
        dispatch(setSuccessMessage('Username updated'));
        dispatch(setUser({ username, nameColor }));
      } else {
        const error = await response.text();
        dispatch(setErrorMessage(error));
      }
    } catch (e) {
      console.log(e);
      dispatch(setErrorMessage('An unexpected error occured'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePFP = async (file: File) => {
    setIsSubmitting('pfp');

    try {
      const response = await requestUpdatePFP(file);

      if (response.status === 200) {
        dispatch(setSuccessMessage('Profile picture updated'));
      } else {
        const error = await response.text();
        dispatch(setErrorMessage(error));
        window.location.href = window.location.href;
      }
    } catch (e) {
      console.log(e);
      dispatch(setErrorMessage('An unexpected error occured'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePFP = async () => {
    setIsSubmitting('pfp');

    try {
      const response = await requestDeletePFP();

      if (response.status === 200) {
        dispatch(setUser({ pfp: '' }));
        dispatch(setSuccessMessage('Profile picture deleted'));
        window.location.href = window.location.href;
      } else {
        const error = await response.text();
        dispatch(setErrorMessage(error));
      }
    } catch (e) {
      console.log(e);
      dispatch(setErrorMessage('An unexpected error occured'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPassword = async (oldPassword: string, newPassword: string) => {
    setIsSubmitting('password');

    try {
      const response = await requestUpdatePassword(oldPassword, newPassword);

      if (response.status === 200) {
        dispatch(setSuccessMessage('Password updated'));
      } else {
        const error = await response.text();
        dispatch(setErrorMessage(error));
      }
    } catch (e) {
      console.log(e);
      dispatch(setErrorMessage('An unexpected error occured'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isLoading,
    handleGetSettings,
    isSubmitting,
    handleSubmitUsername,
    handleUpdatePFP,
    handleDeletePFP,
    handleSubmitPassword
  };
};

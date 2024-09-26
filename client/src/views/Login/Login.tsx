import { useForm } from 'react-hook-form';
import { Button, TextField } from '@mui/material';

import { Form, PageHeader } from 'components';
import { useNavigate } from 'react-router-dom';
import { useLogin } from 'hooks';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { isSubmitting, handleSubmit: handleSubmitLogin } = useLogin();

  const submitLogin = (data: any) => {
    const { identifier, password } = data;
    handleSubmitLogin({
      identifier: identifier.trim(),
      password
    });
  };

  return (
    <>
      <PageHeader text="Login" />
      <Form onSubmit={handleSubmit(submitLogin)}>
        <TextField
          label="Username or Email"
          fullWidth
          {...register('identifier', { required: true })}
          autoComplete="email"
          autoFocus
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          {...register('password', { required: true })}
          autoComplete="current-password"
        />
        <Button variant="contained" type="submit" disabled={isSubmitting}>
          Log In
        </Button>
        <Button onClick={() => navigate(`${import.meta.env.VITE_BASE_URL}/register`)}>
          Don't have an account? Register
        </Button>
        <Button onClick={() => navigate(`${import.meta.env.VITE_BASE_URL}/forgotPassword`)}>
          Forgot Password?
        </Button>
      </Form>
    </>
  );
};

export default Login;

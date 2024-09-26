import { baseUrl, getDeleteConfig, getPostConfig, getRequestConfig } from 'api';

export const requestLogin = async (identifier: string, password: string) => {
  const data = {
    identifier,
    password
  };
  const postConfig = getPostConfig(data);
  return await fetch(`${baseUrl}/login`, postConfig);
};

export const requestCheckSession = async () => {
  const config = getRequestConfig();
  return await fetch(`${baseUrl}/check-session`, config);
};

export const requestLogout = async () => {
  const config = getRequestConfig();
  return await fetch(`${baseUrl}/logout`, config);
};

export interface RequestRegister {
  username: string;
  email: string;
  password: string;
}

export const requestRegister = async (data: RequestRegister) => {
  const postConfig = getPostConfig(data);
  return await fetch(`${baseUrl}/register`, postConfig);
};

export const requestAccount = async () => {
  const config = getRequestConfig();
  return await fetch(`${baseUrl}/account`, config);
};

export const requestUpdateUsername = async (username: string, nameColor: string) => {
  const data = {
    username,
    nameColor
  };
  const postConfig = getPostConfig(data);
  return await fetch(`${baseUrl}/account/username`, postConfig);
};

export const requestUpdatePFP = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const postConfig = {
    method: 'POST',
    body: formData
  };
  return await fetch(`${baseUrl}/account/pfp`, postConfig);
};

export const requestDeletePFP = async () => {
  const config = getDeleteConfig({});
  return await fetch(`${baseUrl}/account/pfp`, config);
};

export const requestUpdatePassword = async (oldPassword: string, newPassword: string) => {
  const data = {
    oldPassword,
    newPassword
  };
  const postConfig = getPostConfig(data);
  return await fetch(`${baseUrl}/account/password`, postConfig);
};

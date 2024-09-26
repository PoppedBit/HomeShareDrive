export * from './admin';
export * from './auth';

export const baseUrl = import.meta.env.VITE_API_URL;

export const getRequestConfig = () => {
  const config = {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };

  return config as RequestInit;
};

export const getPostConfig = (data: any = {}) => {
  const config = {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  return config as RequestInit;
};

export const getDeleteConfig = (data: any) => {
  const config = {
    method: 'DELETE',
    mode: 'cors',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  return config as RequestInit;
};

export const getPatchConfig = (data: any) => {
  const config = {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  return config as RequestInit;
};

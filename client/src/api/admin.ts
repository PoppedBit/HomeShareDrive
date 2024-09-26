import { baseUrl, getPostConfig, getRequestConfig } from 'api';

export const requestUsers = async () => {
  const config = getRequestConfig();
  return await fetch(`${baseUrl}/admin/users`, config);
};

export const requestBanUser = async (userId: number, reason: string, unBanDate?: Date) => {
  const config = getPostConfig({
    reason,
    unBanDate
  });
  return await fetch(`${baseUrl}/admin/user/${userId}/ban`, config);
};

export const requestUnBanUser = async (userId: number) => {
  const config = getPostConfig();
  return await fetch(`${baseUrl}/admin/user/${userId}/unban`, config);
};

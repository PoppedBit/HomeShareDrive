import { baseUrl, getDeleteConfig, getPostConfig, getRequestConfig } from 'api';

export const requestDirectoryContents = async (path: string) => {
  const config = getRequestConfig();
  return await fetch(`${baseUrl}/directory-contents?path=${path}`, config);
};

export const requestCreateDirectory = async (path: string, name: string) => {
  const data = {
    path,
    name
  };
  const config = getPostConfig(data);
  return await fetch(`${baseUrl}/create-directory`, config);
};

export const requestDeleteItem = async (path: string) => {
  const data = {
    path
  };
  const config = getDeleteConfig(data);
  return await fetch(`${baseUrl}/delete-item`, config);
};

export const requestRenameItem = async (path: string, name: string) => {
  const data = {
    path,
    name
  };
  const config = getPostConfig(data);
  return await fetch(`${baseUrl}/rename-item`, config);
};

// A clickable link might do...
export const requestDownloadItem = async (path: string) => {
  const config = getRequestConfig();
  return await fetch(`${baseUrl}/download-item?path=${path}`, config);
};

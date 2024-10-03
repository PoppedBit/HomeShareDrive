import { requestCreateDirectory, requestDeleteItem, requestDirectoryContents, requestRenameItem } from 'api';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { removeItem, setItems } from 'store/slices/homeshare';
import { setErrorMessage, setSuccessMessage } from 'store/slices/notifications';

export const useHomeShare = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getDirectoryContents = async (path: string) => {
    setIsLoading(true);

    try {
      const response = await requestDirectoryContents(path);

      if (response.status === 200) {
        const data = await response.json();
        dispatch(setItems(data.items));
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

  const addDirectory = async (path: string, name: string) => {
    setIsLoading(true);

    try {
      const response = await requestCreateDirectory(path, name);

      if (response.status === 200) {
        dispatch(setSuccessMessage(`"${name}" created`));
        getDirectoryContents(path);
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
  }

  const renameItem = async (path: string, oldName: string,  newName: string) => {
    setIsLoading(true);

    try {
      const response = await requestRenameItem(path+"/"+oldName, newName);

      if (response.status === 200) {
        dispatch(setSuccessMessage(`"${oldName}" renamed to "${newName}"`));
        getDirectoryContents(path);
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
  }

  const deleteItem = async (path: string) => {
    setIsLoading(true);

    try {
      const response = await requestDeleteItem(path);

      if (response.status === 200) {
        dispatch(setSuccessMessage(`"${path}" deleted`));
        dispatch(removeItem(path));
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

  return {
    isLoading,
    getDirectoryContents,
    addDirectory,
    renameItem,
    deleteItem
  };
};

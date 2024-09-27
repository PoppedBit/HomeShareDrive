import { requestDirectoryContents } from "api";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setItems } from "store/slices/homeshare";
import { setErrorMessage } from "store/slices/notifications";

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
  }

  return {
    isLoading,
    getDirectoryContents
  }
}
import { requestBanUser, requestUnBanUser, requestUsers } from 'api';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUsers, updateUser } from 'store/slices/admin';
import { setErrorMessage, setSuccessMessage } from 'store/slices/notifications';

export const useAdminUsers = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const getUsers = async () => {
    setIsLoading(true);

    try {
      const response = await requestUsers();

      if (response.status === 200) {
        const data = await response.json();
        dispatch(setUsers(data.users));
      } else {
        const error = await response.text();
        dispatch(setErrorMessage(error));
        dispatch(setUsers([]));
      }
    } catch (e) {
      console.log(e);
      dispatch(setErrorMessage('An unexpected error occured'));
      dispatch(setUsers([]));
    } finally {
      setIsLoading(false);
    }
  };

  const banUser = async (userId: number, reason: string, unBanDate?: Date) => {
    setIsSubmitting(true);

    try {
      const response = await requestBanUser(userId, reason, unBanDate);

      if (response.status === 200) {
        const data = await response.json();
        dispatch(updateUser(data));
        dispatch(setSuccessMessage('User has been banned'));
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

  const unBanUser = async (userId: number) => {
    setIsSubmitting(true);

    try {
      const response = await requestUnBanUser(userId);

      if (response.status === 200) {
        const data = await response.json();
        dispatch(updateUser(data));
        dispatch(setSuccessMessage('User has been unbanned'));
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
    isSubmitting,
    getUsers,
    banUser,
    unBanUser
  };
};

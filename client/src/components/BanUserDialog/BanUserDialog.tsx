import { User } from 'types/admin';
import { Dialog, Form } from 'components';
import { Button, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { TODO } from 'shared/types';

interface Props {
  isOpen: boolean;
  onSubmit: (data: any) => void;
  onClose: () => void;
  user: User;
}

const BanUserDialog = (props: Props) => {
  const { isOpen, onSubmit, onClose, user } = props;

  const { register, reset, handleSubmit } = useForm();

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleClickSubmit = (data: TODO) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Ban ${user.username}?`}
      fullWidth={false}
      buttons={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(handleClickSubmit)}>
            Submit
          </Button>
        </>
      }
    >
      <Form onSubmit={handleSubmit(handleClickSubmit)}>
        <TextField {...register('reason')} label="Ban Reason" required />
        {/* TODO - Date */}
      </Form>
    </Dialog>
  );
};

export default BanUserDialog;

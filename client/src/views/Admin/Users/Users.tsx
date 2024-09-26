import { Tooltip, Typography } from '@mui/material';
import { useAdminUsers } from 'hooks';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BanUserDialog, GreenCheck, PageHeader, Table } from 'components';
import { TableAction, TableColumn, TODO } from 'shared/types';
import { formatTimestamp } from 'utils';
import { setErrorMessage } from 'store/slices/notifications';
import { User } from 'types/admin';
import { BannedIcon } from './styles';

const Users = () => {
  const dispatch = useDispatch();

  const { isLoading, getUsers, banUser, unBanUser } = useAdminUsers();
  const { users } = useSelector((state: TODO) => state.admin);

  const [isBanOpen, setIsBanOpen] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!users && !isLoading) {
      getUsers();
    }
  }, [users, getUsers, isLoading]);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  const handleSubmitBan = (data: TODO) => {
    banUser(isBanOpen!, data.reason);
  };

  const columns: TableColumn[] = [
    {
      dataIndex: 'username',
      label: 'Username',
      searchable: true
    },
    {
      dataIndex: 'originalUsername',
      label: 'Original Username',
      searchable: true
    },
    {
      dataIndex: 'email',
      label: 'Email',
      searchable: true
    },
    {
      dataIndex: 'isEmailVerified',
      label: 'Email Verified',
      render: (isEmailVerified: boolean) => {
        return isEmailVerified ? <GreenCheck /> : '';
      }
    },
    {
      dataIndex: 'isAdmin',
      label: 'Admin?',
      render: (isAdmin: boolean) => {
        return isAdmin ? <GreenCheck /> : '';
      }
    },
    {
      dataIndex: 'isBanned',
      label: 'Banned?',
      render: (isBanned: boolean, user: User) => {
        return isBanned ? (
          <Tooltip title={`${user.banReason}: Until ${user.unBanDate}`}>
            <BannedIcon />
          </Tooltip>
        ) : (
          ''
        );
      }
    },
    {
      dataIndex: 'createdAt',
      label: 'Created',
      render: (data: TODO) => {
        return formatTimestamp(data) ?? '';
      }
    }
  ];

  const actions: TableAction[] = [
    {
      label: 'Ban',
      onClick: (user: User) => {
        if (user.isBanned || user.isAdmin) {
          dispatch(setErrorMessage('You cannot ban this user.'));
          return;
        }
        setIsBanOpen(user.id);
      }
    },
    {
      label: 'Un-Ban',
      onClick: (user: User) => {
        if (!user.isBanned) {
          dispatch(setErrorMessage('This user is not banned.'));
          return;
        }
        unBanUser(user.id);
      }
    }
  ];

  return (
    <>
      <PageHeader text="Users" />
      <Table columns={columns} data={users ?? []} actions={actions} />
      <BanUserDialog
        isOpen={Boolean(isBanOpen)}
        onSubmit={handleSubmitBan}
        onClose={() => setIsBanOpen(undefined)}
        user={isBanOpen ? users.find((user: User) => user.id === isBanOpen) : {}}
      />
    </>
  );
};

export default Users;

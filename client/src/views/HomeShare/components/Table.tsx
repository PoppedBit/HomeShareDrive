import { Download, Folder } from '@mui/icons-material';
import { Checkbox, IconButton, Typography } from '@mui/material';
import { Table as SharedTable } from 'components';
import dayjs from 'dayjs';
import { useHomeShare } from 'hooks';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setConfirmationMessage } from 'store/slices/notifications';
import { FileInfo } from 'types/homehare';
import { TableAction, TableColumn } from 'types/types';
import { extToIcon, formatBytes } from '../util';

interface Props {
  items: FileInfo[];
}

const Table = (props: Props) => {
  const { items } = props;

  const dispatch = useDispatch();
  const { deleteItem } = useHomeShare();

  const handleClickDelete = (row: FileInfo) => {
    dispatch(
      setConfirmationMessage({
        title: `Are you sure you want to delete ${row.name}?`,
        onConfirm: () => {
          deleteItem(row.path);
        }
      })
    );
  };

  const columns: TableColumn[] = [
    {
      dataIndex: '',
      label: '',
      render: (_value: string, _row: FileInfo) => {
        return <Checkbox />;
      }
    },
    {
      dataIndex: '',
      label: '',
      render: (_value: string, row: FileInfo) => {
        const { isDir, name } = row;
        if (isDir) {
          return <Folder />;
        }

        const fileExt = name.split('.').pop();
        if (!fileExt) {
          return <Typography>File</Typography>;
        }

        return extToIcon(fileExt);
      }
    },
    {
      dataIndex: 'name',
      label: 'Name',
      render: (_value: string, row: FileInfo) => {
        const { name, isDir, path } = row;

        if (isDir) {
          return <Link to={`/?path=${path}`}>{name}</Link>;
        }

        return name;
      }
    },
    {
      dataIndex: 'size',
      label: 'Size',
      render: (value: number, row: FileInfo) => {
        if (row.isDir) {
          return '';
        }
        return formatBytes(value);
      }
    },
    {
      dataIndex: 'modTime',
      label: 'Modified Time',
      render: (value: string) => {
        const parsedDate = dayjs(value, 'YYYY-MM-DD HH:mm:ss.SSSSSSSSS Z');
        return parsedDate.format('YYYY-MM-DD HH:mm:ss');
      }
    },{
      dataIndex: 'path',
      label: 'Download',
      render: (value: string, row: FileInfo) => {
        if(row.isDir){
          return <></>;
        }

        return <IconButton
          href={`/api/download-file?path=${value}`}
          download={row.name}
        >
          <Download />
        </IconButton>
      }
    }
  ];

  const actions: TableAction[] = [
    {
      label: 'Rename',
      onClick: (row: FileInfo) => {
        // setIsNameDialogOpen(row);
        alert('TODO');
      }
    },
    {
      label: 'Delete',
      onClick: handleClickDelete
    }
  ];

  return (
    <SharedTable
      data={items ?? []}
      columns={columns}
      actions={actions}
      pagination={false}
      idField="path"
    />
  );
};

export default Table;
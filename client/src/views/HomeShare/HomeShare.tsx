import {
  Code,
  CreateNewFolder,
  Folder,
  FolderZip,
  Headphones,
  Image,
  PictureAsPdf,
  TableRows,
  ThreeDRotation,
  Upload,
  Window
} from '@mui/icons-material';
import { Checkbox, IconButton, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { PageHeader, Table } from 'components';
import dayjs from 'dayjs';
import { useHomeShare } from 'hooks';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { setPath } from 'store/slices/homeshare';
import { setConfirmationMessage } from 'store/slices/notifications';
import { FileInfo } from 'types/homehare';
import { TableAction, TableColumn, TODO } from 'types/types';

const extToIcon = (ext: string) => {
  switch (ext) {
    case 'pdf':
      return <PictureAsPdf />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'ico':
      return <Image />;
    case 'zip':
    case 'tar':
    case 'gz':
      return <FolderZip />;
    case 'mp3':
    case 'wav':
      return <Headphones />;
    case 'stl':
      return <ThreeDRotation />;
    case 'ts':
    case 'js':
    case 'tsx':
    case 'jsx':
    case 'html':
    case 'css':
      return <Code />;
    default:
      return <Typography>{ext}</Typography>;
  }
};

const formatBytes = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  if (bytes === 0) return '0B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const readableSize = (bytes / Math.pow(1024, i)).toFixed(2);
  return `${readableSize}${units[i]}`;
};

const HomeShare = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const pathParam = searchParams.get('path') ?? '/';
  const [view, setView] = useState<'table' | 'grid'>('table');

  const homeshare = useSelector((state: TODO) => state.homeshare);
  const { path, items } = homeshare;

  const { isLoading, getDirectoryContents, deleteItem } = useHomeShare();

  useEffect(() => {
    dispatch(setPath(pathParam));
  }, [pathParam]);

  useEffect(() => {
    if (!isLoading && !items && path === pathParam) {
      getDirectoryContents(path);
    }
  }, [path, pathParam, items, isLoading, getDirectoryContents]);

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
    }
  ];

  const actions: TableAction[] = [
    {
      label: 'Rename',
      onClick: (row: FileInfo) => {
        alert('Rename');
      }
    },
    {
      label: 'Delete',
      onClick: handleClickDelete
    }
  ];

  const breadCrumbLinks = path
    .split('/')
    .filter(Boolean)
    .map((_, index: number, arr: string[]) => {
      const linkPath = [''].concat(arr.slice(0, index + 1)).join('/');
      return {
        text: arr[index],
        href: `/?path=${linkPath}`
      };
    });

  const currentDirectory = path.split('/').pop();

  return (
    <>
      <PageHeader
        text={currentDirectory.length ? currentDirectory : 'Home'}
        links={[
          {
            text: '/',
            href: '/'
          },
          ...breadCrumbLinks
        ]}
      />
      <div>
        <IconButton onClick={() => alert('Create new folder')}>
          <CreateNewFolder />
        </IconButton>
        <IconButton onClick={() => alert('Upload file')}>
          <Upload />
        </IconButton>
        <ToggleButtonGroup value={view} exclusive onChange={(_event, value) => setView(value)}>
          <ToggleButton value="table">
            <TableRows />
          </ToggleButton>
          <ToggleButton value="grid">
            <Window />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <Table
        data={items ?? []}
        columns={columns}
        actions={actions}
        pagination={false}
        idField="path"
      />
    </>
  );
};

export default HomeShare;

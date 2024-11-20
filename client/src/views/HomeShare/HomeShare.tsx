import { CreateNewFolder, Delete, TableRows, Upload, Window } from '@mui/icons-material';
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import { Dialog, Form, PageHeader } from 'components';
import { useHomeShare } from 'hooks';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { setPath } from 'store/slices/homeshare';
import { FileInfo } from 'types/homehare';
import { TODO } from 'types/types';
import { Controls } from './styles';
import { Grid, Table } from './components';

const HomeShare = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const pathParam = searchParams.get('path') ?? '/';
  const [view, setView] = useState<'table' | 'grid'>('grid');

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState<boolean | FileInfo>(false);
  const {
    register: registerName,
    handleSubmit: handleSubmitName,
    reset: resetNameDialog
  } = useForm();
  const {
    register: registerUpload,
    watch: watchUpload,
    handleSubmit: handleSubmitUpload,
    reset: resetUploadDialog,
    setValue: setUploadValue,
  } = useForm();

  const attachedFiles: FileList | undefined = watchUpload('files');

  const homeshare = useSelector((state: TODO) => state.homeshare);
  const { path, items } = homeshare;

  const { isLoading, getDirectoryContents, addDirectory, uploadFiles, renameItem } = useHomeShare();

  const isRoot = path === '/';

  useEffect(() => {
    dispatch(setPath(pathParam));
  }, [pathParam]);

  useEffect(() => {
    if (!isLoading && !items && path === pathParam) {
      getDirectoryContents(path);
    }
  }, [path, pathParam, items, isLoading, getDirectoryContents]);

  useEffect(() => {
    if (!isNameDialogOpen) {
      resetNameDialog();
    }
  }, [isNameDialogOpen, resetNameDialog]);

  useEffect(() => {
    if (!isUploadDialogOpen) {
      resetUploadDialog();
    }
  }, [isUploadDialogOpen, resetUploadDialog]);

  const submitNameDialog = (data: TODO) => {
    if (!isNameDialogOpen) {
      return;
    }

    let { name } = data;
    name = name.trim();

    if (isNameDialogOpen === true) {
      addDirectory(path, name);
    } else {
      renameItem(path, isNameDialogOpen.name, name);
    }
    setIsNameDialogOpen(false);
  };

  const handleRemoveFile = (index: number) => {
    const fileArray = Array.from(attachedFiles || []); // Convert FileList to an array
    const updatedFiles = fileArray.filter((_, i) => i !== index); // Remove the file at the specified index
    setUploadValue("files", updatedFiles.length ? updatedFiles : undefined); // Update the field, reset if empty
  };

  const submitUploadDialog = (data: TODO) => {
    const { files } = data;
    
    if (files.length === 0) {
      return;
    }

    uploadFiles(path, files, () => {
      setIsUploadDialogOpen(false);
    });
  };

  const currentDirectory = path.split('/').pop();

  const breadCrumbLinks = path
    .split('/')
    .slice(0, -1)
    .filter(Boolean)
    .map((_: string, index: number, arr: string[]) => {
      const linkPath = [''].concat(arr.slice(0, index + 1)).join('/');
      return {
        text: arr[index],
        href: `/?path=${linkPath}`
      };
    });

  return (
    <>
      <PageHeader
        text={currentDirectory.length ? currentDirectory : 'Home'}
        links={[...(isRoot ? [] : [{ text: 'Home', href: '/' }]), ...breadCrumbLinks]}
      />
      <Controls>
        <div>
          <Tooltip title="Create Folder">
            <IconButton onClick={() => setIsNameDialogOpen(true)}>
              <CreateNewFolder />
            </IconButton>
          </Tooltip>
          <Tooltip title="Upload File(s)">
            <IconButton onClick={() => setIsUploadDialogOpen(true)}>
              <Upload />
            </IconButton>
          </Tooltip>
        </div>
        <div>
          <ToggleButtonGroup value={view} exclusive onChange={(_event, value) => setView(value)}>
            <Tooltip title="Table Layout">
              <ToggleButton value="table">
                <TableRows />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Grid Layout">
              <ToggleButton value="grid">
                <Window />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </div>
      </Controls>
      {view === 'table' && <Table items={items ?? []} />}
      {view === 'grid' && <Grid items={items ?? []} />}
      <Dialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        title={`Upload File(s) to ${path}`}
        maxWidth="sm"
        buttons={
          <>
            <Button
              variant="contained"
              disabled={!attachedFiles?.length}
              onClick={() => {
                handleSubmitUpload(submitUploadDialog)();
              }}
            >
              Upload
            </Button>
            <Button
              onClick={() => {
                setIsUploadDialogOpen(false);
              }}
            >
              Close
            </Button>
          </>
        }
      >
        <Form onSubmit={handleSubmitUpload(submitUploadDialog)}>
          <Button variant="contained" component="label">
            Attach File(s)
            <input type="file" hidden multiple {...registerUpload('files')} />
          </Button>
          {attachedFiles && attachedFiles.length !== 0 && (
            <List dense={true}>
              {Array.from(attachedFiles).map((file, index) => (
                <ListItem
                  key={file.name}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText primary={file.name} />
                </ListItem>
              ))}
            </List>
          )}
        </Form>
      </Dialog>
      <Dialog
        isOpen={Boolean(isNameDialogOpen)}
        onClose={() => setIsNameDialogOpen(false)}
        title={
          isNameDialogOpen === true
            ? `Add Directory to ${path}`
            : `Rename "${isNameDialogOpen !== false ? isNameDialogOpen.name : ''}"`
        }
        buttons={
          <>
            <Button
              variant="contained"
              onClick={() => {
                handleSubmitName(submitNameDialog)();
              }}
            >
              Submit
            </Button>
            <Button
              onClick={() => {
                setIsNameDialogOpen(false);
              }}
            >
              Cancel
            </Button>
          </>
        }
      >
        <Form onSubmit={handleSubmitName(submitNameDialog)}>
          <TextField
            label="Name"
            fullWidth
            {...registerName('name', { required: true })}
            autoFocus
          />
        </Form>
      </Dialog>
    </>
  );
};

export default HomeShare;

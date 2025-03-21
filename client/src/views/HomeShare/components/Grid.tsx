import {
  ArrowForward,
  Delete,
  Download,
  DriveFileRenameOutline,
  Folder,
  FolderOutlined
} from '@mui/icons-material';
import {
  Button,
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import { Link } from 'react-router-dom';
import { FileInfo } from 'types/homehare';
import {
  GridCardMedia,
  GridCardMediaContents,
  GridContainer,
  PreviewImageButtonContainer,
  PreviewMask
} from '../styles';
import { extToIcon, formatBytes, IMAGE_EXTENSIONS } from '../util';
import { formatTimestamp } from 'utils';
import { useState } from 'react';
import { Dialog } from 'components';
import { setConfirmationMessage } from 'store/slices/notifications';
import { useHomeShare } from 'hooks';
import { useDispatch } from 'react-redux';

interface Props {
  items: FileInfo[];
}

const Grid = (props: Props) => {
  const { items } = props;

  const dispatch = useDispatch();
  const [isPreviewOpen, setIsPreviewOpen] = useState<FileInfo | undefined>(undefined);

  const imageFiles = items.filter((file) =>
    IMAGE_EXTENSIONS.includes(file.name.split('.').pop() ?? '')
  );

  let previewImageIndex = -1;
  if (Boolean(isPreviewOpen)) {
    previewImageIndex = imageFiles.indexOf(isPreviewOpen!);
  }

  const handlePreviewNavigationClick = (change: number) => {
    const newPreviewFile = imageFiles[(previewImageIndex + change) % imageFiles.length];
    setIsPreviewOpen(newPreviewFile);
  };

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

  return (
    <GridContainer>
      {items.map((item) => {
        const { name, path, thumbnailPath = '', size, modTime, isDir } = item;

        const fileExt = name.split('.').pop()?.toLocaleLowerCase();
        const isImage = IMAGE_EXTENSIONS.includes(fileExt ?? '');

        return (
          <Card key={path}>
            <CardHeader
              avatar={isDir ? <Folder /> : extToIcon(fileExt ?? '')}
              title={`${name} ${isDir ? '' : `(${formatBytes(size)})`}`}
              subheader={formatTimestamp(modTime)}
              action={
                isDir ? (
                  <IconButton component={Link} to={`/?path=${path}`}>
                    <ArrowForward />
                  </IconButton>
                ) : (
                  <Tooltip title="Download" placement="top">
                    <IconButton
                      href={`${import.meta.env.VITE_API_URL}/download-file?path=${path}`}
                      download={name}
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                )
              }
            />
            <GridCardMedia
              image={
                isImage
                  ? `${import.meta.env.VITE_API_URL}/download-file?path=${thumbnailPath.length ? thumbnailPath : path}`
                  : undefined
              }
              onClick={() => {
                if (!isImage) {
                  return;
                }
                setIsPreviewOpen(item);
              }}
            >
              <GridCardMediaContents>
                {isDir && <FolderOutlined />}
                {isImage && <PreviewMask>Preview</PreviewMask>}
              </GridCardMediaContents>
            </GridCardMedia>
            <CardActions>
              <Tooltip title="Rename" placement="top">
                <IconButton
                  onClick={() => {
                    alert('TODO');
                  }}
                >
                  <DriveFileRenameOutline />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete" placement="top">
                <IconButton
                  onClick={() => handleClickDelete(item)}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        );
      })}
      {Boolean(isPreviewOpen) && (
        <Dialog
          isOpen={Boolean(isPreviewOpen)}
          onClose={() => setIsPreviewOpen(undefined)}
          title={
            <>
              {isPreviewOpen?.name}
              <Tooltip title="Download" placement="top">
                <IconButton
                  href={`${import.meta.env.VITE_API_URL}/download-file?path=${isPreviewOpen?.path}`}
                  download={isPreviewOpen?.name}
                >
                  <Download />
                </IconButton>
              </Tooltip>
            </>
          }
          maxWidth="sm"
          buttons={
            <PreviewImageButtonContainer>
              <Button variant="contained" onClick={() => handlePreviewNavigationClick(-1)}>
                Previous
              </Button>
              <Typography>
                {previewImageIndex + 1} / {imageFiles.length}
              </Typography>
              <Button variant="contained" onClick={() => handlePreviewNavigationClick(1)}>
                Next
              </Button>
            </PreviewImageButtonContainer>
          }
        >
          <CardMedia
            component="img"
            src={`${import.meta.env.VITE_API_URL}/download-file?path=${isPreviewOpen?.path}`}
            alt={isPreviewOpen?.name}
          />
        </Dialog>
      )}
    </GridContainer>
  );
};

export default Grid;

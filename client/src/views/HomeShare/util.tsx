import { Code, FolderZip, Headphones, Image, PictureAsPdf, ThreeDRotation } from '@mui/icons-material';
import { Typography } from '@mui/material';

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'ico'];

export const formatBytes = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  if (bytes === 0) return '0B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const readableSize = (bytes / Math.pow(1024, i)).toFixed(2);
  return `${readableSize}${units[i]}`;
};

export const extToIcon = (ext: string) => {
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
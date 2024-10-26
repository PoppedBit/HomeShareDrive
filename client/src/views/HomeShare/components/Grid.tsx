import { ArrowForward, Delete, Download, DriveFileRenameOutline, Folder, FolderOutlined, Preview } from "@mui/icons-material";
import { Card, CardActions, CardHeader, CardMedia, IconButton, Tooltip, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { FileInfo } from "types/homehare";
import { GridCardMedia, GridCardMediaContents, GridContainer, PreviewMask } from "../styles";
import { extToIcon, formatBytes } from '../util';
import { formatTimestamp } from "utils";

interface Props {
  items: FileInfo[];
}

const Grid = (props: Props) => {
  const { items } = props;

  return (
    <GridContainer>
      {items.map((item) => {
        const { name, path, size, modTime, isDir } = item;

        const fileExt = name.split('.').pop();

        return (
          <Card key={path}>
            <CardHeader
              avatar={isDir ? <Folder /> : extToIcon(fileExt ?? '')}
              title={`${name} ${isDir ? '' : `(${formatBytes(size)})`}`} 
              subheader={formatTimestamp(modTime)}
              action={isDir 
                ? <IconButton
                  component={Link}
                  to={`/?path=${path}`}
                >
                  <ArrowForward />
                </IconButton> 
                : <Tooltip title="Download" placement="top">
                  <IconButton
                    href={`/api/download-file?path=${path}`}
                    download={name}
                  >
                    <Download />
                  </IconButton>
                </Tooltip>}
            />
            <GridCardMedia
              image={isDir ? '/folder.png' : `/api/download-file?path=${path}`}
              onClick={() => {
                alert("TODO");
              }}
            >
              <GridCardMediaContents>
                {isDir && (
                  <FolderOutlined />
                )}
                {!isDir && (
                  <PreviewMask>
                    Preview
                  </PreviewMask>
                )}
              </GridCardMediaContents>
            </GridCardMedia>
            <CardActions>
              <Tooltip title='Rename' placement='top'>
                <IconButton
                  onClick={() => {
                    alert("TODO");
                  }}
                >
                  <DriveFileRenameOutline />
                </IconButton>
              </Tooltip>
              <Tooltip title='Delete' placement='top'>
                <IconButton
                  onClick={() => {
                    alert("TODO");
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        );
      })}
    </GridContainer>
  );
};

export default Grid;
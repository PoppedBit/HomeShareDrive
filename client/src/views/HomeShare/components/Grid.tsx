import { ArrowForward, Delete, Download, DriveFileRenameOutline, Folder } from "@mui/icons-material";
import { Card, CardActionArea, CardActions, CardContent, CardHeader, CardMedia, IconButton, Tooltip, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { FileInfo } from "types/homehare";
import { GridContainer } from "../styles";

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
              avatar={isDir ? <Folder /> : 'TODO'}
              title={name} 
              subheader={modTime}
              action={isDir 
                ? <IconButton
                  component={Link}
                  to={`/?path=${path}`}
                >
                  <ArrowForward />
                </IconButton> 
                : <Tooltip title="Download" placement="top">
                  <IconButton>
                    <Download />
                  </IconButton>
                </Tooltip>}
            />
            <CardMedia />
            <CardActions>
              <Tooltip title='Rename' placement='top'>
                <IconButton>
                  <DriveFileRenameOutline />
                </IconButton>
              </Tooltip>
              <Tooltip title='Delete' placement='top'>
                <IconButton>
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
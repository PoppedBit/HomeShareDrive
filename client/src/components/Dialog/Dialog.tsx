import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breakpoint
} from '@mui/material';
import { ReactNode } from 'react';

interface Props {
  isOpen: boolean;
  onClose: Function;
  title?: string;
  children?: ReactNode;
  buttons?: ReactNode;
  maxWidth?: Breakpoint;
  fullWidth?: boolean;
}

const Dialog = (props: Props) => {
  const { isOpen, onClose, title, children, buttons, maxWidth = 'md', fullWidth = true } = props;

  return (
    <MuiDialog open={isOpen} fullWidth={fullWidth} maxWidth={maxWidth} onClose={() => onClose()}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      {buttons && <DialogActions>{buttons}</DialogActions>}
    </MuiDialog>
  );
};

export default Dialog;

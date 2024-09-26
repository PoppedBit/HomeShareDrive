import { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { TableAction } from 'shared/types';

interface Props {
  actions: TableAction[];
  row: any;
}

export const ActionButton = (props: Props) => {
  const { actions, row } = props;

  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);

  const menuItems = actions.map((action: TableAction, i: number) => {
    const { label, onClick, disabled = false } = action;
    return (
      <MenuItem key={i} onClick={() => onClick(row)} disabled={disabled}>
        {typeof label === 'function' ? label(row) : label}
      </MenuItem>
    );
  });

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setActionMenuAnchor(e.currentTarget)}>
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={actionMenuAnchor}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        keepMounted
        open={actionMenuAnchor !== null}
        onClick={() => setActionMenuAnchor(null)}
        onClose={() => setActionMenuAnchor(null)}
      >
        {menuItems}
      </Menu>
    </>
  );
};

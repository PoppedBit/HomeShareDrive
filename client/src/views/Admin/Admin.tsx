import { Person } from '@mui/icons-material';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from 'components';

type NavigationItem = {
  text: string;
  to: string;
  icon: ReactElement;
};

const items: NavigationItem[] = [
  {
    text: 'Users',
    to: '/admin/users',
    icon: <Person />
  }
];

const Admin = () => {
  return (
    <>
      <PageHeader text="Admin" />
      <List>
        {items.map((item: NavigationItem) => {
          const { text, to, icon } = item;
          return (
            <ListItem key={to}>
              <ListItemButton component={Link} to={to}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );
};

export default Admin;

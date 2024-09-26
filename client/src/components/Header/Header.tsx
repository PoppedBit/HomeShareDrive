import { Avatar, Grid, Toolbar } from '@mui/material';
import {
  AccountLink,
  AccountLinkText,
  MainGrid,
  MainTypopgraphy,
  RightGrid,
  SiteTitleLink,
  StyledAppBar
} from './styles';
import { useSelector } from 'react-redux';
import { TODO } from 'shared/types';
import { AccountCircle } from '@mui/icons-material';
import { getUserPFP } from 'utils';

const Header = () => {
  const user = useSelector((state: TODO) => state.user);
  const { id, username, nameColor } = user;

  const isAuthenticated = Boolean(id);

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Grid container spacing={2}>
          <MainGrid item xs={10}>
            <MainTypopgraphy>
              <SiteTitleLink to="/">{import.meta.env.VITE_TITLE}</SiteTitleLink>
            </MainTypopgraphy>
          </MainGrid>
          <RightGrid item xs={2}>
            {isAuthenticated && (
              <AccountLink to={`/${username}`}>
                <Avatar src={getUserPFP(user.id)}>
                  <AccountCircle />
                </Avatar>
                <AccountLinkText variant="body1" backgroundColor={nameColor}>
                  {username}
                </AccountLinkText>
              </AccountLink>
            )}
          </RightGrid>
        </Grid>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;

import { AppBar, Grid, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

export const StyledAppBar = styled(AppBar)({
  boxShadow: 'none',
  height: '64px',
  lineHeight: '64px'
});

export const SiteTitleLink = styled(Link)({
  color: 'inherit',
  textDecoration: 'none'
});

export const MainGrid = styled(Grid)({
  // textAlign: 'center'
});

export const MainTypopgraphy = styled(Typography)({
  lineHeight: '64px',
  fontSize: '32px'
});

export const RightGrid = styled(Grid)({
  textAlign: 'right',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end'
});

export const AccountLink = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'inherit',
  textDecorationColor: 'none'
});

interface AccountLinkTextProps {
  backgroundColor?: string;
}

export const AccountLinkText = styled(Typography)<AccountLinkTextProps>(({ backgroundColor }) => ({
  marginLeft: '.5rem',
  color: 'inherit',
  textDecoration: 'none',
  backgroundColor: backgroundColor || '#FF69B4',
  padding: '.25rem .5rem',
  borderRadius: '.25rem'
}));

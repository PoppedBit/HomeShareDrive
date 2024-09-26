import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

export const Header = styled('div')({
  marginBottom: '15px'
});

export const HeaderText = styled('div')({
  fontSize: '2.5rem',
  fontWeight: 600
});

export const BreadcrumbLink = styled(Link)({
  color: '#000000',
  textDecoration: 'none'
});

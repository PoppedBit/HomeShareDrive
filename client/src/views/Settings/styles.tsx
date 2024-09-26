import { Avatar, Typography } from '@mui/material';
import styled from '@emotion/styled';

interface UsernamePreviewProps {
  backgroundColor?: string;
}

export const UsernamePreview = styled(Typography)<UsernamePreviewProps>(({ backgroundColor }) => ({
  marginLeft: '.5rem',
  marginBottom: '1rem',
  color: '#FFFFFF',
  textDecoration: 'none',
  backgroundColor: backgroundColor || '#FF69B4',
  padding: '.25rem .5rem',
  borderRadius: '.25rem'
}));

export const PFPAvatar = styled(Avatar)({
  width: '16rem',
  height: '16rem',
  margin: '0 auto 1rem auto'
});

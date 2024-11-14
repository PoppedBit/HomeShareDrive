import { Box, CardMedia } from '@mui/material';
import styled from '@emotion/styled';

export const Controls = styled('div')({
  display: 'flex',
  justifyContent: 'space-between'
});

export const GridContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1rem'
});

export const GridCardMedia = styled(CardMedia)({
  height: '15rem',
  cursor: 'pointer'
});

export const GridCardMediaContents = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%'
});

export const PreviewMask = styled('div')({
  width: '100%',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  color: 'rgba(0,0,0,0)',

  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#FFFFFF'
  }
});

export const PreviewImageButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%'
});

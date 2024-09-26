import styled from '@emotion/styled';
import { CircularProgress } from '@mui/material';

export const LoadingContainer = styled('div')({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translateX(-50%) translateY(-50%)',
  userSelect: 'none',
  textAlign: 'center'
});

export const LoadingProgress = styled(CircularProgress)({
  color: '#6d514e'
});

export const LoadingMessage = styled('h2')({});

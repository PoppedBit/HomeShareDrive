import styled from '@emotion/styled';
import { DragIndicator } from '@mui/icons-material';
import { TableContainer } from '@mui/material';

export const Container = styled(TableContainer)({
  marginBottom: '1rem'
});

export const DragIcon = styled(DragIndicator)({
  cursor: 'grab'
});

import styled from '@emotion/styled';
import { Check } from '@mui/icons-material';
import { Divider as MuiDivider } from '@mui/material';

export const Divider = styled(MuiDivider)({
  margin: '1rem 0'
});

export const Form = styled('form')({
  textAlign: 'center',
  margin: '0 auto 1rem auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  '& > .MuiFormControl-root': {
    marginTop: '1rem',

    '&:last-of-type': {
      marginBottom: '1rem'
    }
  },

  '.ninja-field': {
    display: 'none'
  },

  '& > button': {
    marginTop: '1rem 0 .25rem 0',
    width: '100%'
  }
});

export const GreenCheck = styled(Check)({
  color: '#34b233'
});

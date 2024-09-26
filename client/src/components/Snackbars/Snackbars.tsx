import { Snackbar, SnackbarOrigin } from '@mui/material';

import './index.scss';

const defaultAnchorOrigin = {
  vertical: 'bottom',
  horizontal: 'center'
};

interface Props {
  successMessage?: string | null;
  setSuccessMessage?: Function;
  errorMessage?: string | null;
  setErrorMessage?: Function;
  anchorOrigin?: null | HTMLElement;
}

const Snackbars = (props: Props) => {
  const {
    successMessage = null,
    setSuccessMessage = null,
    errorMessage = null,
    setErrorMessage = null,
    anchorOrigin = defaultAnchorOrigin
  } = props;

  let successSnackbar = null;
  if (successMessage) {
    successSnackbar = (
      <Snackbar
        className="success-snackbar"
        open={successMessage.length > 0}
        autoHideDuration={4000}
        message={successMessage}
        onClose={() => {
          setSuccessMessage!('');
        }}
        anchorOrigin={anchorOrigin as SnackbarOrigin}
      />
    );
  }

  let errorSnackbar = null;
  if (errorMessage) {
    errorSnackbar = (
      <Snackbar
        className="error-snackbar"
        open={errorMessage.length > 0}
        autoHideDuration={4000}
        message={errorMessage}
        onClose={() => {
          setErrorMessage!('');
        }}
        anchorOrigin={anchorOrigin as SnackbarOrigin}
      />
    );
  }

  return (
    <>
      {successSnackbar}
      {errorSnackbar}
    </>
  );
};

export default Snackbars;

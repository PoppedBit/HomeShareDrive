import { LoadingContainer, LoadingMessage, LoadingProgress } from './styles';

interface Props {
  isVisible: boolean;
  message: string;
}

const Loading = (props: Props) => {
  const { isVisible = false, message = '' } = props;

  if (!isVisible) {
    return;
  }

  return (
    <LoadingContainer>
      <LoadingProgress size={100} />
      <LoadingMessage>{message}</LoadingMessage>
    </LoadingContainer>
  );
};

export default Loading;

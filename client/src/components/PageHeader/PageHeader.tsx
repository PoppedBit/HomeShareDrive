import { useEffect } from 'react';
import { Breadcrumbs } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { BreadcrumbLink, Header, HeaderText } from './styles';
import { TODO } from 'shared/types';

interface Props {
  text: string;
  links?: TODO[];
}

const PageHeader = (props: Props) => {
  const { text, links = [] } = props;

  const breadcrumbs = links.map((link) => {
    const { text, href } = link;
    return (
      <BreadcrumbLink key={text} to={href}>
        {text}
      </BreadcrumbLink>
    );
  });

  const title = [text, import.meta.env.VITE_TITLE].join(' / ');

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <Header>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>{breadcrumbs}</Breadcrumbs>
      <HeaderText>{text}</HeaderText>
    </Header>
  );
};

export default PageHeader;

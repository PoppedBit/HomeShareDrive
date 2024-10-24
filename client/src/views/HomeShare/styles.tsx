import styled from "styled-components";

export const Controls = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

export const GridContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '1rem',
});
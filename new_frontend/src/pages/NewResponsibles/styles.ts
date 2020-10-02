import styled from 'styled-components';

import { BaseGridTemplate, BaseGridMain } from '../../styles/grid';

export const Container = styled(BaseGridTemplate)``;

export const Main = styled(BaseGridMain)`
  form {
    > button {
      margin-top: 24px;

      & + button {
        margin-left: 12px;
      }
    }
  }
`;

export const InputGroup = styled.div`
  display: flex;

  & + div {
    margin-top: 12px;
  }

  div {
    margin-top: 0;

    & + div {
      margin-left: 12px;
    }
  }
`;

export const NavigationButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;
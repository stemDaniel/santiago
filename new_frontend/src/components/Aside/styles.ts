import styled from 'styled-components';

export const Container = styled.aside`
  grid-area: aside;
  background-color: var(--gray);

  ul {
    margin-top: 24px;
    list-style: none;
    overflow: hidden;
    background-color: var(--blue);

    li {
      background-color: var(--gray);
      width: 100%;
      padding: 12px;
      transition: transform 0.2s;
      border-left: 5px solid var(--blue);
      cursor: pointer;

      &:hover {
        transform: translateX(24px);
      }

      &:hover > a,
      &:hover > button {
        color: var(--blue);
      }

      button {
        background: transparent;
        border: 0;
        color: var(--black);
      }
    }
  }
`;
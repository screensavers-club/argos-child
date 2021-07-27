import styled from "styled-components";

export default function Button({ style, children, onClick }) {
  return (
    <StyledButton {...style} onClick={onClick}>
      {children}
    </StyledButton>
  );
}

const StyledButton = styled.button`
  appearance: none;
  border: 1px solid #000;
  background: #fff;
  color: #000;
  cursor: pointer;
  font-size: 1.5rem;
  min-width: 5em;
  border-radius: 8px;
  box-shadow: 0 3px black;
  font-family: "Work Sans";

  &:hover {
    background: #ddd;
  }
`;

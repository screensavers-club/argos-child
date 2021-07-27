import styled from "styled-components";
import Button from "../components/button";

const StyledPage = styled.div`
  display: block;
  margin: auto;
  padding: auto;

  div.errorMessage {
    margin-top: 10%;
    text-align: center;
  }

  Button {
    position: absolute;
    top: 300px;
    left: 50%;
    transform: translate(-50%, 0);
    width: 200px;
    height: 100px;
  }
`;

export default function Error({ resetClick, error }) {
  return (
    <StyledPage>
      <div className="errorMessage">
        <h3>Error:</h3>
        <h3>{error}</h3>
      </div>

      <Button onClick={resetClick}>Back</Button>
    </StyledPage>
  );
}

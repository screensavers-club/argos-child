import styled from "styled-components";
export default function AppFrame({ children }) {
	return <Frame>{children}</Frame>;
}

const Frame = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
	overflow: hidden;
`;

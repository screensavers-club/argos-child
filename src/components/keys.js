import styled from "styled-components";

export default function Key({ variant, k, onClick }) {
	return (
		<KeyButton onClick={onClick} variant={variant}>
			{k}
		</KeyButton>
	);
}

const KeyButton = styled.div`
	border-radius: 50px;
	display: flex;
	justify-content: center;
	align-items: center;
	width: ${(p) => (p.variant === "numpad" ? "65px" : "10px")};
	height: ${(p) => (p.variant === "numpad" ? "65px" : "10px")};
	font-size: ${(p) => (p.variant === "numpad" ? "32px" : "10px")};
	font-weight: ${(p) => (p.variant === "numpad" ? "100" : "200")};
	text-align: center;
	color: white;
	background: #434349;
`;

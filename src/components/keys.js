import styled from "styled-components";

export default function Key({ variant, k, onClick, type }) {
	return (
		<KeyButton onClick={onClick} variant={variant} type={type}>
			{k}
		</KeyButton>
	);
}

const KeyButton = styled.div`
	border-radius: 50px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-family: "Noto Sans";
	width: ${(p) => (p.variant === "numpad" ? "65px" : "10px")};
	height: ${(p) => (p.variant === "numpad" ? "65px" : "10px")};
	font-size: ${(p) => (p.variant === "numpad" ? "32px" : "10px")};
	font-weight: ${(p) => (p.variant === "numpad" ? "200" : "200")};
	text-align: center;
	color: white;
	background: ${(p) => {
		switch (p.type) {
			case "cancel":
				return "#AC4545";
			default:
				return "#434349";
		}
	}};
	svg {
		stroke-width: 1.5px;
	}
`;

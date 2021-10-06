import styled from "styled-components";

export default function Key({ variant, k, onClick, type, className }) {
	return (
		<KeyButton
			onClick={onClick}
			variant={variant}
			type={type}
			className={className}
		>
			{k}
		</KeyButton>
	);
}

const KeyButton = styled.div.attrs((props) => ({
	className: props.className,
}))`
	border-radius: 50px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-family: "Noto Sans";
	width: ${(p) =>
		p.variant === "numpad"
			? "65px"
			: p.type === "long"
			? "100%"
			: p.variant === "keyboard"
			? "50px"
			: "100px"};
	height: ${(p) =>
		p.variant === "numpad"
			? "65px"
			: p.variant === "keyboard"
			? "50px"
			: "100px"};
	font-size: ${(p) =>
		p.variant === "numpad"
			? "32px"
			: p.variant === "keyboard"
			? "24px"
			: "10px"};
	font-weight: 200;
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
		stroke-width: ${(p) => (p.variant === "keyboard" ? "1px" : "1.5px")};
	}

	:hover {
		cursor: pointer;
	}
`;

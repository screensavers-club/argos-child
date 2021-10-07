import styled from "styled-components";

export default function Key({
	variant,
	k,
	onClick,
	type,
	className,
	tabActive,
}) {
	return (
		<KeyButton
			onClick={onClick}
			variant={variant}
			type={type}
			className={className}
			tabActive={tabActive}
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
			: "74px"};
	height: ${(p) =>
		p.variant === "numpad"
			? "65px"
			: p.variant === "keyboard"
			? "50px"
			: "74px"};
	font-size: ${(p) =>
		p.variant === "numpad"
			? "32px"
			: p.variant === "keyboard"
			? "24px"
			: "28px"};
	font-weight: 200;
	text-align: center;
	color: ${(p) => (p.tabActive === true ? "5736fd" : "white")};

	background: ${(p) =>
		p.tabActive === true
			? "white"
			: p.type === "cancel"
			? "#AC4545"
			: "#434349"};

	svg {
		stroke-width: ${(p) => (p.variant === "keyboard" ? "1px" : "1.5px")};
		stroke-linecap: round;
		stroke: ${(p) => (p.tabActive === true ? "5736fd" : "white")};
	}

	:hover {
		cursor: pointer;
		color: #434349;
		stroke: #434349;
		background: #fff;
	}
	:active {
		color: #5736fd;
		stroke: #5736fd;
		background: #fff;
	}
	:focus {
		color: #5736fd;
		stroke: #5736fd;
		background: #fff;
	}
`;

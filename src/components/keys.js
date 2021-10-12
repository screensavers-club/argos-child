import styled from "styled-components";

export default function Key({
	variant,
	k,
	onClick,
	type,
	className,
	tabActive,
	indicator,
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
			<div className="indicator" />
		</KeyButton>
	);
}

const KeyButton = styled.div.attrs((props) => ({
	className: props.className,
}))`
	border-radius: 50px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

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
	font-weight: 100;
	text-align: center;
	color: ${(p) => (p.tabActive === true ? "5736fd" : "white")};

	background: ${(p) =>
		p.tabActive === true
			? "white"
			: p.type === "cancel"
			? "#AC4545"
			: "#434349"};

	box-shadow: ${(p) =>
		p.variant === "streamTabs" ? "0 4px 4px 0 rgba(0,0,0,0.2)" : "none"};

	> svg {
		stroke-width: ${(p) => (p.variant === "keyboard" ? "1.2px" : "1.5px")};
		stroke-linecap: round;
		font-size: ${(p) =>
			p.type === "long" ? "36px" : p.variant === "keyboard" ? "30px " : ""};
		color: ${(p) =>
			p.tabActive === true ? "#5736fd" : p.type === "cancel" ? "#fff" : "#fff"};
	}

	:hover {
		cursor: pointer;
		color: #434349;
		background: #fff;
		> svg {
			color: #434349;
		}
	}
	:active {
		color: #5736fd;
		background: #fff;
		> svg {
			color: #5736fd;
		}
	}
	:focus {
		color: #5736fd;
		background: #fff;
		> svg {
			color: #5736fd;
		}
	}

	div.indicator {
		width: 10px;
		height: 10px;
		background: #5736fd;
		border-radius: 50px;
		margin-top: 5px;
		display: ${(p) => (p.tabActive ? "block" : "none")};
	}
`;

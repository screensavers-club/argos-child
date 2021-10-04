import styled from "styled-components";
import theme from "./theme";

export default function Button({
	style,
	children,
	onClick,
	variant,
	icon,
	className,
}) {
	return (
		<StyledButton
			{...style}
			onClick={onClick}
			variant={variant}
			icon={icon}
			className={className}
		>
			<div>
				{icon}
				{children}
			</div>
		</StyledButton>
	);
}

const StyledButton = styled.button.attrs((props) => ({
	className: props.className,
}))`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	appearance: none;
	background: ${(p) => (p.variant === "icon" ? "none" : "#434349")};
	border: none;
	color: #fff;
	cursor: pointer;
	font-size: 14px;
	width: ${(p) => {
		switch (p.variant) {
			case "full-width":
				return "100%";

			case "icon":
				return "auto";
			default:
				return "151px";
		}
	}};
	height: 50px;
	border-radius: 50px;
	font-family: Noto Sans;
	font-style: normal;
	font-weight: 500;
	font-size: 14px;
	line-height: 19px;

	&:hover {
		background: ${(p) => (p.variant === "icon" ? "none" : "#fff")};
		color: ${(p) => (p.variant === "icon" ? "white" : "#5736fd;")};

		transform: ${(p) => (p.variant === "icon" ? "rotate(45deg)" : "none")};
	}

	&:focus {
		animation-duration: ${(p) => (p.variant === "icon" ? "1s" : "0")};
		animation-name: rotation;

		@keyframes rotation {
			from {
				transform: rotate(0deg);
			}
			to {
				transform: rotate(360deg);
			}
		}
	}

	svg {
		padding-left: ${(p) => (p.variant === "icon" ? "0" : "20px")};
		padding-right: ${(p) => (p.variant === "icon" ? "0" : "15px")};
		stroke-width: 1.5px;
		font-size: ${(p) => (p.variant === "icon" ? "36px" : "20px")};
	}

	> div {
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}
`;

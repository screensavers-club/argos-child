import styled from "styled-components";
import theme from "./theme";

export default function Button({
	style,
	children,
	onClick,
	variant,
	icon,
	className,
	gradient,
}) {
	return (
		<StyledButton
			{...style}
			onClick={onClick}
			variant={variant}
			icon={icon}
			className={className}
			gradient={gradient}
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
	align-items: ${(p) => (p.variant === "icon" ? "center" : "flex-end")};
	justify-content: flex-start;
	appearance: none;
	background: ${(p) => {
		if (p.variant === "icon") {
			return "none";
		} else if (p.variant === "block") {
			return p.gradient;
		} else {
			return "#434349";
		}
	}};
	border: none;
	color: #fff;
	cursor: pointer;
	width: ${(p) => {
		switch (p.variant) {
			case "full-width":
				return "100%";

			case "block":
				return "200px";

			case "icon":
				return "auto";
			default:
				return "151px";
		}
	}};
	height: ${(p) => {
		switch (p.variant) {
			case "block":
				return "140px";

			default:
				return "50px";
		}
	}};
	border-radius: ${(p) => {
		switch (p.variant) {
			case "block":
				return "15px";

			default:
				return "50px";
		}
	}};
	font-family: Noto Sans;
	text-align: left;
	font-style: normal;
	font-weight: ${(p) => {
		switch (p.variant) {
			case "block":
				return "600";

			default:
				return "500";
		}
	}};
	font-size: ${(p) => {
		switch (p.variant) {
			case "block":
				return "24px";

			default:
				return "14px";
		}
	}};

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
		width: ${(p) => {
			switch (p.variant) {
				case "block":
					return "50%";

				default:
					return "100%";
			}
		}};
		margin: ${(p) => {
			switch (p.variant) {
				case "block":
					return "0 0 10px 10px";
				default:
					return 0;
			}
		}};
	}
`;

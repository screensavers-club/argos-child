import styled from "styled-components";
// import theme from "./theme";

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
	display: block;
	appearance: none;
	font-family: Noto Sans;
	text-align: left;
	font-style: normal;
	border: none;
	color: #fff;
	cursor: pointer;
	justify-content: flex-start;
	align-items: ${(p) => (p.variant === "icon" ? "center" : "flex-end")};

	background: ${(p) => {
		if (p.variant === "icon") {
			return "none";
		} else {
			return "#434349";
		}
	}};

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

	height: ${(p) => {
		switch (p.variant) {
			default:
				return "50px";
		}
	}};

	border-radius: ${(p) => {
		switch (p.variant) {
			default:
				return "50px";
		}
	}};

	font-weight: ${(p) => {
		switch (p.variant) {
			default:
				return "500";
		}
	}};

	font-size: ${(p) => {
		switch (p.variant) {
			default:
				return "14px";
		}
	}};

	> div {
		display: flex;
		justify-content: flex-start;
		align-items: center;

		width: ${(p) => {
			switch (p.variant) {
				default:
					return "100%";
			}
		}};

		margin: ${(p) => {
			switch (p.variant) {
				default:
					return 0;
			}
		}};

		svg {
			stroke-width: 1.5px;
			padding-left: ${(p) => (p.variant === "icon" ? "0" : "20px")};
			padding-right: ${(p) => (p.variant === "icon" ? "0" : "15px")};
			font-size: ${(p) => (p.variant === "icon" ? "36px" : "20px")};
		}
	}
`;

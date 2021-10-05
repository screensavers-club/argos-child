import styled from "styled-components";
import theme from "./theme";

export default function Card({
	style,
	children,
	onClick,
	icon,
	gradient,
	participants,
}) {
	return (
		<StyledButton {...style} onClick={onClick} icon={icon} gradient={gradient}>
			<div>
				<span>
					{icon}
					{participants}
				</span>
				{children}
			</div>
		</StyledButton>
	);
}

const StyledButton = styled.button`
	position: relative;
	display: inline-flex;
	cursor: pointer;
	align-items: flex-end;
	justify-content: flex-start;
	appearance: none;
	background: ${(p) => p.gradient};
	border: none;
	color: #fff;
	width: 200px;
	height: 140px;
	border-radius: 15px;
	font-family: Noto Sans;
	text-align: left;
	font-style: normal;
	font-weight: 600;
	font-size: 24px;

	> div {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		width: 50%;
		margin: 0 0 10px 10px;

		span {
			position: absolute;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			font-size: 10px;
			top: 10px;
			right: 10px;

			svg {
				stroke-width: 1.5;
				font-size: 14px;
				margin-right: 5px;
			}
		}
	}
`;

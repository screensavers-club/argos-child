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
	min-width: 190px;
	width: 25%;
	height: 140px;
	border-radius: 15px;
	text-align: left;
	font-style: normal;
	font-weight: 600;
	font-size: 24px;
	text-shadow: rgba(0, 0, 0, 0.2) 0 2px 5px;
	box-shadow: 0 4px 4px #252529;

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

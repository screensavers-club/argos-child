import styled from "styled-components";

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
  border: 1px solid #000;
  background: #fff;
  color: #000;
  cursor: pointer;
  font-size: 1.5rem;
  min-width: 5em;
  width: ${(p) => {
    switch (p.variant) {
      case "full-width":
        return "100%";
      default:
        return "auto";
    }
  }};
  border-radius: 8px;
  box-shadow: 0 3px black;
  font-family: "Work Sans";
  padding: 0.8em 2em;

  &:hover {
    background: #ddd;
  }

  svg {
    position: relative;
    padding: 0 0.5em 0em 0;
  }

  > div {
    width: 100%;
    margin: auto;
    padding: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

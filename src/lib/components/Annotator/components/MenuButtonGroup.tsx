import { ReactElement } from "react";
import styled from "styled-components";
import { Icon } from "semantic-ui-react";

const StyledButtonGroup = styled.div`
  --buttongroup-height: 0px;
  &:hover,
  &:active {
    --buttongroup-height: 1000px;
  }
  font-size: 18px;
  z-index: 1000;
  cursor: pointer;
  position: relative;

  & .Burger {
    display: none;
    padding: 5px;
    font-size: 18px;
    height: 35px;
    width: 30px;
  }

  & .Buttons {
    transition: max-height 0.2s, border 1s;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  @media (max-width: 500px) {
    & .Burger {
      display: block;
    }
    & .Buttons {
      background: var(--background-inversed-fixed);
      border: 0px double var(--background-fixed);
      position: absolute;
      width: 38px;
      top: 34px;
      left: -3px;
      z-index: 1000;
      flex-direction: column;
      max-height: var(--buttongroup-height);
    }
    & .Buttons * {
      padding-top: 1rem;
    }
    &:hover .Buttons,
    &:active .Buttons {
      transition: max-height 1s, border 0s;
      border: 3px double var(--background-fixed);
      border-top: 0px;
    }
  }
`;

interface MenuButtonGroupProps {
  children: ReactElement | ReactElement[];
}

const MenuButtonGroup = ({ children }: MenuButtonGroupProps) => {
  return (
    <StyledButtonGroup>
      <div className="Burger">
        <Icon name="content" />
      </div>
      <div className="Buttons">{children}</div>
    </StyledButtonGroup>
  );
};

export default MenuButtonGroup;

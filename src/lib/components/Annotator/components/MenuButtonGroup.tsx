import { ReactElement } from "react";
import styled from "styled-components";
import { GiHamburgerMenu } from "react-icons/gi";

const StyledButtonGroup = styled.div`
  border-radius: 10px;
  --buttongroup-height: 0px;

  &:focus,
  &:hover,
  &:active {
    --buttongroup-height: 1000px;
  }
  font-size: 2.5rem;
  z-index: 1000;
  cursor: pointer;
  position: relative;

  & .Burger {
    display: none;
    padding: 3px 5px 0px 5px;
    font-size: 2.5rem;
    height: 35px;
    width: 30px;
  }

  & .Buttons {
    transition: max-height 0.2s;
    padding-top: 2px;
    overflow: hidden;
    display: flex;
    align-items: center;
    padding: 0.4rem;

    svg {
      margin-left: 1rem;
    }
  }

  @media (max-width: 500px) {
    & .Burger {
      display: block;
    }
    & .Buttons {
      background: var(--background);
      position: absolute;
      padding-top: 0px;
      top: 0px;
      left: -3.7rem;
      z-index: 1000;
      flex-direction: column;
      max-height: var(--buttongroup-height);
      width: 7rem;
      transition: max-height 0s;
      overflow: hidden;
      svg {
        margin-left: 0rem;
      }
    }
    & .Buttons * {
      margin: 1rem 0rem;
    }
    &:focus .Buttons,
    &:hover .Buttons,
    &:active .Buttons {
      background: var(--primary-text);
      border-radius: 5px;
      color: var(--text-inversed);
      transition: max-height 1s;
      //border: 3px double var(--background-fixed);
      //border-top: 0px;
    }
  }
`;

interface MenuButtonGroupProps {
  children: ReactElement | ReactElement[];
}

const MenuButtonGroup = ({ children }: MenuButtonGroupProps) => {
  return (
    <StyledButtonGroup
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="Burger">
        <GiHamburgerMenu />
      </div>
      <div className="Buttons">{children}</div>
    </StyledButtonGroup>
  );
};

export default MenuButtonGroup;

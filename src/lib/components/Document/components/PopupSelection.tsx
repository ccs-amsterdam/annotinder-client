import styled from "styled-components";
import { CodeSelectorOption, CodeSelectorValue } from "../../../types";
import ButtonSelection from "./ButtonSelection";

interface Props {
  header: string;
  options: CodeSelectorOption[];
  onSelect: (value: CodeSelectorValue, ctrlKey: boolean) => void;
}

const StyledDiv = styled.div`
  h4 {
    text-align: center;
    font-style: italic;
  }
  .searchbar {
  }
`;

const PopupSelection = ({ header, options, onSelect }: Props) => {
  return (
    <StyledDiv>
      <h4>{header}</h4>
      <div className="searchbar"></div>
      <ButtonSelection id="buttons" active={true} options={options} onSelect={onSelect} />
    </StyledDiv>
  );
};

export default PopupSelection;

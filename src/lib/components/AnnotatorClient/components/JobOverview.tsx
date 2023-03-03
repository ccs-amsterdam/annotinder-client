import styled from "styled-components";

const StyledDiv = styled.div``;

interface JobOverviewProps {}

const JobOverview = ({}: JobOverviewProps) => {
  return (
    <StyledDiv>
      <div className="Menu"></div>
      <div className="JobList"></div>
    </StyledDiv>
  );
};

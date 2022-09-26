import styled from "styled-components";

const JobsContainer = styled.div`
  text-align: center;
  margin-bottom: 10%;
`;

/**
 * Not sure whether we want this, but we could list all guest jobs
 */

const GuestJobs = () => {
  return (
    <JobsContainer>
      <h3>Guest jobs</h3>
    </JobsContainer>
  );
};

export default GuestJobs;

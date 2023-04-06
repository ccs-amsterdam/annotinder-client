import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import JobServerDemo from "./classes/JobServerDemo";
import { Loader } from "../../styled/Styled";
import Annotator from "../Annotator/Annotator";
import DemoJobOverview from "./DemoJobOverview";
import styled from "styled-components";
import { useEffect } from "react";

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 250px;
  margin: auto;
  margin-top: 5rem;

  .Body {
    margin: auto;
    margin-left: 0;
  }
`;

export default function AnnotatorDemoClient() {
  const { status, data } = useJob();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      const msg = "If you leave now, any changes made in the current unit will not be saved."; // most browsers actually show default message
      e.returnValue = msg;
      return msg;
    };

    if (data != null) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [data]);

  if (status === "loading") return <Loader active />;
  if (status === "success" && data === null)
    return (
      <StyledDiv>
        <DemoJobOverview />
      </StyledDiv>
    );

  return <Annotator jobServer={data} />;
}

const useJob = () => {
  const [searchparams] = useSearchParams();
  const codebook = searchparams.get("codebook");
  const units = searchparams.get("units");

  const jobQuery = useQuery(
    ["job", codebook, units],
    () => {
      if (!codebook || !units) {
        return null;
      }
      return getJobServer(units, codebook);
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    }
  );

  return jobQuery;
};

const getJobServer = async (units_file: string, codebook_file: string) => {
  try {
    const units_res = await fetch(getFileName(units_file, "units"), { headers });
    let units = await units_res.json();
    if (typeof units !== "object") units = JSON.parse(units);

    const codebook_res = await fetch(getFileName(codebook_file, "codebook"), { headers });
    let codebook = await codebook_res.json();
    if (typeof codebook !== "object") codebook = JSON.parse(codebook);

    return new JobServerDemo(codebook, units);
  } catch (e) {
    console.error(e);
    return null;
  }
};

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const getFileName = (filename: string, what: string) => {
  if (filename.toLowerCase().includes(".json")) {
    // if .json in name, assume its a full path
    return filename;
  }
  return `${what}/${filename}.json`;
};

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import JobServerDemo from "./classes/JobServerDemo";
import Annotator from "../Annotator/Annotator";

const DemoJob = () => {
  const [job, setJob] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let codebook = searchParams.get("codebook") || "sentimentAnnotation";
    let units = searchParams.get("units") || "sotu";
    getJobServer(units, codebook, setJob);
  }, [searchParams]);

  if (job === null) return <div></div>;
  return <Annotator jobServer={job} />;
};

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const getJobServer = async (units_file, codebook_file, setJob) => {
  try {
    const units_res = await fetch(getFileName(units_file, "units"), { headers });
    let units = await units_res.json();
    if (typeof units !== "object") units = JSON.parse(units);

    const codebook_res = await fetch(getFileName(codebook_file, "codebook"), { headers });
    let codebook = await codebook_res.json();
    if (typeof codebook !== "object") codebook = JSON.parse(codebook);

    setJob(new JobServerDemo(codebook, units));
  } catch (e) {
    setJob(null);
    console.error(e);
  }
};

const getFileName = (filename, what) => {
  if (filename.toLowerCase().includes(".json")) {
    // if .json in name, assume its a full path
    return filename;
  }
  return `${what}/${filename}.json`;
};

export default React.memo(DemoJob);

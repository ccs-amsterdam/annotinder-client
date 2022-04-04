import React, { useEffect, useState } from "react";
//import { useSearchParams } from "react-router-dom";
import JobServerDemo from "./classes/JobServerDemo";
import Annotator from "../Annotator/Annotator";

const DemoJobOverview = () => {
  const [job, setJob] = useState(null);
  //const [searchParams] = useSearchParams();

  useEffect(() => {
    getJobServer("sotu", "sentimentAnnotation", setJob);
  }, []);

  if (job === null) return <div></div>;
  return <Annotator jobServer={job} />;
};

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const getJobServer = async (units_file, codebook_file, setJob) => {
  try {
    const units_res = await fetch(`units/${units_file}.json`, { headers });
    let units = await units_res.json();
    if (typeof units !== "object") units = JSON.parse(units);

    const codebook_res = await fetch(`codebook/${codebook_file}.json`, { headers });
    let codebook = await codebook_res.json();
    if (typeof codebook !== "object") codebook = JSON.parse(codebook);

    setJob(new JobServerDemo(codebook, units));
  } catch (e) {
    setJob(null);
    console.log(e);
  }
};

export default DemoJobOverview;

import React from "react";

import { useSearchParams } from "react-router-dom";

// store redeemed tokens in localstorage
// If a token has already been redeemed, don't redeem it again
// maybe make separate home page for unregistered users / guests (rename RedeemToken to AnnotatorAPIGuestCLient

// renaming things:
// annotatorAPIClient becomes annotatorAMCATClient

// Have users provide a username / email when redeeming guest token

const RedeemToken = () => {
  const [searchParams] = useSearchParams();
  const host = searchParams.get("host");
  const jobtoken = searchParams.get("jobtoken");
  console.log(host, jobtoken);
  return <div></div>;
};

export default React.memo(RedeemToken);

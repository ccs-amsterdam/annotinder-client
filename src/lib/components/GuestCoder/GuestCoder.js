import React, { useEffect } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";

import { useNavigate, useSearchParams } from "react-router-dom";
import Backend, { redeemJobToken } from "../AnnotatorClient/classes/Backend";

// store redeemed tokens in localstorage
// If a token has already been redeemed, don't redeem it again
// maybe make separate home page for unregistered users / guests (rename RedeemToken to AnnotatorAPIGuestCLient

// renaming things:
// annotatorAPIClient becomes annotatorAMCATClient

// Have users provide a username / email when redeeming guest token

const GuestCoder = () => {
  const [guestAuth, setGuestAuth] = useLocalStorage("guest_auth", {});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const host = searchParams.get("host")?.replace("%colon%", ":");
  const userId = searchParams.get("user_id");
  const jobtoken = searchParams.get("jobtoken");

  useEffect(() => {
    redeemShuffle(host, userId, jobtoken, guestAuth, setGuestAuth, navigate)
      .then()
      .catch((e) => {
        console.log("show error message or something");
      });
  }, [guestAuth, host, userId, jobtoken, navigate, setGuestAuth]);

  return <div></div>;
};

const redeemShuffle = async (host, userId, jobtoken, guestAuth, setGuestAuth, navigate) => {
  const key = `host:${host};user_id:${userId};jobtoken:${jobtoken}`;

  if (guestAuth[key]) {
    const data = guestAuth[key];
    const backend = new Backend(host, data.token);
    try {
      await backend.init();
      // token still works
      navigate(`/?host=${host}&token=${data.token}&job_id=${data.job_id}`);
    } catch (e) {
      // there is a token but it no longer works. (typically happens when resetting db in dev)
      delete guestAuth[key];
      setGuestAuth(guestAuth);
    }
  }

  if (!guestAuth[key]) {
    try {
      const data = await redeemJobToken(host, jobtoken, userId);
      setGuestAuth({ ...guestAuth, [key]: data });
      navigate(`/?host=${host}&token=${data.token}&job_id=${data.job_id}`);
    } catch (e) {
      console.error(e);
    }
  }
};

export default React.memo(GuestCoder);

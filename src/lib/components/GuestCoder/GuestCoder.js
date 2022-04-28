import React, { useEffect } from "react";
import useLocalStorage from "lib/hooks/useLocalStorage";

import { useNavigate, useSearchParams } from "react-router-dom";
import { redeemJobToken } from "../AnnotatorClient/classes/Backend";

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
  const host = searchParams.get("host");
  const userId = searchParams.get("user_id");
  const jobtoken = searchParams.get("jobtoken");

  console.log(guestAuth);
  useEffect(() => {
    const key = `host:${host};user_id:${userId};jobtoken:${jobtoken}`;
    if (!guestAuth[key]) {
      console.log("redeem");
      redeemJobToken(host, jobtoken, userId)
        .then((data) => {
          setGuestAuth({ ...guestAuth, [key]: data });
          navigate(`/?host=${host}&token=${data.token}&job_id=${data.job_id}`);
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      const data = guestAuth[key];
      navigate(`/?host=${host}&token=${data.token}&job_id=${data.job_id}`);

      // if tokens can expire, need some way to get token anew. But solution below won't work well,
      // because it would also remove the token if connection is broken for whatever reason

      // const b = new Backend(host, data.token);
      // b.init()
      // .then(() => {
      //     navigate(`/?host=${host}&token=${data.token}&job_id=${data.job_id}`);
      //   })
      //   .catch((e) => {
      //     delete guestAuth[key];
      //     setGuestAuth({ ...guestAuth });
      //   });
    }
  }, [guestAuth, host, userId, jobtoken, navigate, setGuestAuth]);

  return <div></div>;
};

export default React.memo(GuestCoder);

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header, Grid, Button } from "semantic-ui-react";
import useLocalStorage from "../../hooks/useLocalStorage";
import Backend, { redeemJobToken } from "./Backend";

interface JobTokenLoginProps {
  login: (host: string, token: string) => void;
  host: string;
  userId: string;
  jobtoken: string;
  asGuest: boolean;
}

const JobTokenLogin = ({ login, host, userId, jobtoken, asGuest }: JobTokenLoginProps) => {
  const [guestAuth, setGuestAuth] = useLocalStorage("guest_auth", {});
  const [searchParams, setSearchParams] = useSearchParams();

  const key = `host:${host};user_id:${userId};jobtoken:${jobtoken}`;
  const alreadyGuest = !!guestAuth[key];

  useEffect(() => {
    if (!asGuest && userId == null) return;
    if (!jobtoken) return;
    redeemShuffle(host, userId, jobtoken, login, guestAuth, setGuestAuth).then(() => {
      searchParams.delete("jobtoken");
      setSearchParams(searchParams);
    });
  }, [
    login,
    guestAuth,
    host,
    userId,
    jobtoken,
    setGuestAuth,
    asGuest,
    searchParams,
    setSearchParams,
  ]);

  return (
    <Grid.Column width="8">
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Header style={{ color: "var(--primary)", marginBottom: "20px" }}>One-time login</Header>
        <p style={{ marginLeft: "10%", marginRight: "10%" }}>
          {alreadyGuest
            ? "This device is already logged in. Click here to continue"
            : "Log in once with your current device. You can then still close the app and return later, but only using this device (and using the same browser)"}
        </p>

        <Button
          primary
          fluid
          style={{ marginTop: "20px" }}
          onClick={() => {
            redeemShuffle(host, userId, jobtoken, login, guestAuth, setGuestAuth).then(() => {
              searchParams.delete("jobtoken");
              setSearchParams(searchParams);
            });
          }}
        >
          {alreadyGuest ? "Continue" : "Log in"}
        </Button>
      </div>
    </Grid.Column>
  );
};

const redeemShuffle = async (
  host: string,
  userId: string,
  jobtoken: string,
  login: (host: string, token: string) => void,
  guestAuth: any,
  setGuestAuth: any
) => {
  const key = `host:${host};user_id:${userId};jobtoken:${jobtoken}`;

  if (guestAuth[key]) {
    const data = guestAuth[key];
    const backend = new Backend(host, data.token);
    try {
      await backend.init();
      // token still works
      login(host, backend.token);
    } catch (e) {
      // TODO check if e is forbidden. If so, delete token. But don't delete if just server down or
      console.error(e);
      // there is a token but it no longer works. (typically happens when resetting db in dev)
      // Need better solution, because we don't want people to lose their session by accident
      //   delete guestAuth[key];
      //   setGuestAuth(guestAuth);
    }
  } else {
    try {
      const data = await redeemJobToken(host, jobtoken, userId);
      const newGuestAuth = { ...guestAuth, [key]: data };
      setGuestAuth(newGuestAuth);
      login(host, data.token);
    } catch (e) {
      console.error(e);
    }
  }
};

export default JobTokenLogin;

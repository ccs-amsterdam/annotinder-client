import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import { useCookies } from "react-cookie";
import Backend from "./lib/Backend";

const useBackend = (urlHost) => {
  const [cookies, setCookies] = useCookies(["backend"]);
  const [backend, setBackend] = useState(null);

  console.log(cookies);

  useEffect(() => {
    // First check for host in URL, if missing, check for host in cookies.
    const host = urlHost || cookies?.backend?.host || null;

    if (host && host !== backend?.host) setBackend(null); // reset backend if host changes
    if (backend || !host || !cookies?.backend?.token) return;
    logIn(cookies, setCookies, setBackend);
  }, [cookies, backend, urlHost, setCookies, setBackend]);

  return [backend, <LoginForm host={urlHost || cookies?.backend?.host || null} />];
};

const logIn = async (cookies, setCookies, setBackend) => {
  const backend = new Backend(
    cookies?.backend?.host,
    cookies?.backend?.email,
    cookies?.backend?.token
  );
  try {
    // maybe add check for specific user later. For now just check if can get token
    await backend.init();
    setBackend(backend);
  } catch (e) {
    console.log(e);
    setBackend(null);
    setCookies("backend", JSON.stringify({ ...backend, token: null }), { path: "/" });
  }
};

export default useBackend;

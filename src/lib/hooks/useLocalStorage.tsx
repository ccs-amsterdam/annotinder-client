import { useState, useEffect } from "react";
// https://blog.logrocket.com/using-localstorage-react-hooks/
import { SetState } from "../types";

function getStorageValue(key: string, defaultValue: any): any {
  // getting stored value
  const saved = localStorage.getItem(key);
  const initial = JSON.parse(saved);
  return initial || defaultValue;
}

const useLocalStorage = (key: string, defaultValue: any): [any, SetState<any>] => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;

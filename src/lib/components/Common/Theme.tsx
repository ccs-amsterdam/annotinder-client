import { useEffect } from "react";
import { Checkbox } from "semantic-ui-react";
import useLocalStorage from "../../hooks/useLocalStorage";

const dark = {
  background: "#1b1c1d",
  "background-inversed": "white",
  text: "white",
  "text-light": "darkgrey",
  "text-inversed": "black",
};
const light = {
  background: "white",
  "background-inversed": "#1b1c1d",
  text: "black",
  "text-light": "grey",
  "text-inversed": "white",
};

const ThemeSelector = () => {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  useEffect(() => {
    if (theme === "dark") setCSS(dark);
    if (theme === "light") setCSS(light);
  }, [theme]);

  return (
    <Checkbox
      toggle
      checked={theme === "dark"}
      onChange={(e, d) => setTheme(d.checked ? "dark" : "light")}
    />
  );
};

export const useTheme = () => {
  const [theme] = useLocalStorage("theme", "light");

  useEffect(() => {
    if (theme === "dark") setCSS(dark);
    if (theme === "light") setCSS(light);
  }, [theme]);
};

function setCSS(theme) {
  for (let property of Object.keys(theme)) {
    document.documentElement.style.setProperty(`--${property}`, theme[property]);
  }
}

export default ThemeSelector;

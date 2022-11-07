import { useEffect, memo } from "react";
import styled from "styled-components";
import useLocalStorage from "../../hooks/useLocalStorage";
import { StyledButton } from "../../styled/StyledSemantic";

const ThemeButton = styled(StyledButton)<{ iconcolor: string }>`
  color: ${(props) => props.iconcolor} !important;
  background: transparent !important;
  padding: 5px !important;
  font-size: 18px !important;
`;

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

const themes = [
  { name: "light", theme: light, icon: "sun" },
  { name: "dark", theme: dark, icon: "moon" },
];

interface ThemeSelectorProps {
  color: string;
}

const ThemeSelector = ({ color }: ThemeSelectorProps) => {
  // currently just supports 2 themes for dark/light mode.
  // might add more at some point.
  const [theme, setTheme] = useLocalStorage("theme", "light");
  const selected = themes.findIndex((t) => t.name === theme);

  setCSS(themes[selected].theme);
  // useEffect(() => {
  //   setCss
  //   if (theme === "dark") setCSS(dark);
  //   if (theme === "light") setCSS(light);
  // }, [theme]);

  //const t = themes.find(t => t.name === theme)

  return (
    <ThemeButton
      iconcolor={color}
      icon={themes[selected].icon}
      onClick={(e, d) => {
        const next = selected < themes.length - 1 ? selected + 1 : 0;
        setTheme(themes[next].name);
      }}
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

export default memo(ThemeSelector);

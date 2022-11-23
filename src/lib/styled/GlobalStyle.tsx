import { createGlobalStyle } from "styled-components";
import DocumentStyle from "./DocumentStyle";
import AnnotatorStyle from "./AnnotatorStyle";

const GlobalStyle = createGlobalStyle`
    ${DocumentStyle}
    ${AnnotatorStyle}

    :root {
    --font-size: 14px;

    --primary: #1678c2;
    --primary-light: #7bb6ea;
    --primary-verylight: #c5d7e7;

    --secondary: #1b1c1d;
    --secondary-light: #7b7c7d;

    --background: #1b1c1d;
    --background-fixed: white;
    --background-inversed: #ffffff;
    --background-inversed-fixed: #1b1c1d;
  
    --text: white;
    --text-fixed: black;
    --text-light: darkgrey;
    --text-light-fixed: darkgrey;
    --text-inversed: black;
    --text-inversed-fixed: white;
    
    --lightgrey: lightgrey;
    --grey: grey;
    --darkgrey: darkgrey;
    --border: white;
    --green: green;
    --red: crimson;
    --lightred: rgb(218, 151, 164);
    --orange: orange;

    --inactive: #00000011;
    --active: #00000022;
  }

  html {
    font-size: 14px;
  }
  
  body {
    font-size: var(--font-size) !important ;
    overscroll-behavior: contain;
    background: var(--background);
    color: var(--text);
    font-family: Helvetica, Arial, sans-serif;
  }

  h1 {
    text-align: center;
  }
  
    
`;

export default GlobalStyle;

import { createGlobalStyle } from "styled-components";
import DocumentStyle from "./DocumentStyle";
import AnnotatorStyle from "./AnnotatorStyle";

const GlobalStyle = createGlobalStyle`
    ${DocumentStyle}
    ${AnnotatorStyle}

    :root {
    --font-size: 1.6rem;

    --primary: #673AB7;
    --primary-dark: #3B2667;
    --primary-light: #D1C4E9;
    --primary-text: #c0b1dd;
    
    --secondary: #03DAC6;
    --secondary-dark: #018786;
    --secondary-light: #a7ffeb;

    --background: #121212
    --background-transparent: #1b1c1dbb; 
    --background-fixed: white;
    --background-inversed: #ffffff;
    --background-inversed-fixed: #121212;
  
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
    font-size: 62.5%;
  }
  
  body {
    overscroll-behavior: contain;
    background: var(--background);
    color: var(--text);
    font-family: Helvetica, Arial, sans-serif;
  }

  div::-webkit-scrollbar, p::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  div::-webkit-scrollbar-track, p::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 0;
  }

  /* Handle */
  div::-webkit-scrollbar-thumb, p::-webkit-scrollbar-thumb {
    background-color: var(--primary-light);
    border-radius: 0;
  }

  /* Handle on hover */
  div::-webkit-scrollbar-thumb:hover, p::-webkit-scrollbar-thumb:hover {
    background: var(--primary);
  }

  h1 {
    text-align: center;
  }

  h1 {
  min-height: 1em;
  font-size: 2em;
}

h2 {
  font-size: 1.71428571em;
}

h3 {
  font-size: 1.28571429em;
}

h4 {
  font-size: 1.07142857em;
}

h5 {
  font-size: 1em;
}
  
@keyframes fadeIn {
    0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes slideIn {
  0% { transform: translateX(0); opacity: 0 }
  10% { transform: translateX(0); opacity: 1 }
  50% { transform: translateX(0); }
  100% { transform: translateX(100%); }
}

.flex {
  flex: 1 1 auto;
}
    

`;

export default GlobalStyle;

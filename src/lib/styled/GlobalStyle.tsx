import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    html {
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
    
    --grey: grey;
    --darkgrey: darkgrey;
    --border: white;
    --green: green;
    --red: crimson;
    --lightred: rgb(218, 151, 164);
    --orange: orange;
  }
  
  body {
    overscroll-behavior: contain;
    background: var(--background);
    color: var(--text);
  }

  h1 {
    text-align: center;
  }
  
  .ui.header {
    color: var(--text) !important;
  }
  .ui.table {
    color: var(--text) !important;
  }
  .ui.pagination.menu .item {
    color: var(--text) !important;
  }

  
`;

export default GlobalStyle;

const copyToClipboard = (text) => {
  try {
    navigator.clipboard.writeText(text);
  } catch (e) {
    const clipBoardElem = document.createElement("input");
    document.body.appendChild(clipBoardElem);
    clipBoardElem.value = text;
    clipBoardElem.select();
    document.execCommand("copy");
    document.body.removeChild(clipBoardElem);
  }
};

export default copyToClipboard;

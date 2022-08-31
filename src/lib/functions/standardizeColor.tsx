const standardizeColor = (str: string, alpha: string = null) => {
  if (!str) return null;
  // https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = str.trim();
  let color = ctx.fillStyle;
  if (color.slice(0, 1) === "#" && color.length === 7 && alpha !== null) color += alpha;
  return color;
};

export default standardizeColor;

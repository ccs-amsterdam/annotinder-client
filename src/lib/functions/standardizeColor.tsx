const standardizeColor = (str?: string, alpha: string = null) => {
  if (!str) return null;
  if (str.slice(0, 6) === "var(--") return str; // ignore if css color variable
  // https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = str.trim();
  let color = ctx.fillStyle;
  if (color.slice(0, 5) === "rgba(") color = RGBAToHexA(color);
  if (color.slice(0, 1) === "#" && alpha !== null) {
    if (color.length === 9) color = color.slice(0, 7);
    if (color.length === 4)
      color = "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];

    if (color.length === 7) color += alpha;
  }
  return color;
};

export default standardizeColor;

function RGBAToHexA(rgba, forceRemoveAlpha = false) {
  //https://stackoverflow.com/a/73401564
  return (
    "#" +
    rgba
      .replace(/^rgba?\(|\s+|\)$/g, "") // Get's rgba / rgb string values
      .split(",") // splits them at ","
      .filter((string, index) => !forceRemoveAlpha || index !== 3)
      .map((string) => parseFloat(string)) // Converts them to numbers
      .map((number, index) => (index === 3 ? Math.round(number * 255) : number)) // Converts alpha to 255 number
      .map((number) => number.toString(16)) // Converts numbers to hex
      .map((string) => (string.length === 1 ? "0" + string : string)) // Adds 0 when length of one number is 1
      .join("")
  ); // Puts the array to togehter to a string
}

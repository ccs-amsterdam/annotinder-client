/**
 * To create a non-symmetric collection of buttons, we can create a grid
 * with a certain amount of columns, and then fill this grid with
 * buttons that span across columns. This function creates the style attributes
 * that need to go into the grid boxes
 *
 * @param {*} n      The number of buttons
 * @param {*} perRow approximate nubmer of items per row
 * @returns An object with positions, cols and rows settings, used to set the style of the grid container and boxes
 */
const buttonGridPositions = (n, perRow) => {
  let cols, width, rows, rowsizes, maxrowsize, colsize;
  for (let i = 20; i < 36; i++) {
    cols = i;
    width = Math.floor(cols / perRow);
    rows = Math.ceil(n / (cols / width));
    rowsizes = Array(rows).fill(0);
    for (let i = 0; i < n; i++) {
      rowsizes[i % rows]++;
    }
    maxrowsize = Math.max(...rowsizes);
    colsize = Math.floor(cols / maxrowsize);
    if (colsize % width === 0) break;
  }

  const positions = [];
  for (let row = 0; row < rowsizes.length; row++) {
    const items = rowsizes[row];
    //const colsize = Math.floor(cols / items);
    const offset = Math.floor((cols - items * colsize) / 2) + 1;
    for (let col = 0; col < items; col++) {
      const colstart = offset + col * colsize;
      const position = {
        gridRowStart: row + 1,
        gridColumn: `${colstart} / span ${colsize}`,
      };
      positions.push(position);
    }
  }

  const containerStyle = {
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
  };

  return { boxStyleArray: positions, containerStyle };
};

export default buttonGridPositions;

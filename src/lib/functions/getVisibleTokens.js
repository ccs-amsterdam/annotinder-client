/**
 * Get an array of all tokens that are currenly visible (not outside of scroll) in TokenContainer
 *
 * @param {*} tokenContainer   ref for the TokenContainer element
 * @param {*} tokens           tokens array where each token has a .ref
 * @returns
 */
const getVisibleTokens = (tokenContainer, tokens) => {
  const container = tokenContainer.getBoundingClientRect();
  const visibleTokens = [];
  for (let token of tokens) {
    const el = token?.ref?.current?.getBoundingClientRect();
    if (!el) continue;
    const visible =
      el.top <= container.top
        ? container.top - el.top <= el.height
        : el.bottom - container.bottom <= el.height;
    if (visible) visibleTokens.push(token);
  }
  return visibleTokens;
};

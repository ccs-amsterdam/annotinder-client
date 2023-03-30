import styled from "styled-components";

export const CenteredDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  position: relative;
`;

export const Loader = styled.div<{ active?: boolean; radius?: number }>`
  --r: ${(p) => (p.radius != null ? p.radius + "px" : "40px")};
  display: ${(p) => (p.active ? "block" : "none")};
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 100;
  background-color: var(--background-transparent);
  backdrop-filter: blur(3px);

  ::after {
    content: "";
    position: absolute;
    z-index: 1000;
    top: calc(50% - var(--r));
    left: calc(50% - var(--r));
    background: transparent;
    border: calc(var(--r) / 4) solid #f3f3f3;
    border-top: calc(var(--r) / 4) solid var(--primary);
    border-radius: 50%;
    width: calc(var(--r) * 2);
    height: calc(var(--r) * 2);
    animation: spin 1s linear infinite;
  }
`;

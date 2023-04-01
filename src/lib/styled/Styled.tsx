import styled from "styled-components";

export const CenteredDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  position: relative;
`;

export const Loader = styled.div<{ active?: boolean; radius?: number; content?: string }>`
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
    border: calc(var(--r) / 4) solid var(--grey);
    border-top: calc(var(--r) / 4) solid var(--secondary);
    border-radius: 50%;
    width: calc(var(--r) * 2);
    height: calc(var(--r) * 2);
    animation: spin 1s linear infinite;
    opacity: 0.5;
  }

  ::before {
    content: "${(p) => p.content}";
    position: fixed;
    z-index: 1001;
    top: calc(50% - var(--r) / 2);
    font-weight: bold;
    font-size: 1.5rem;
    color: var(--primary-text);
    left: 50%;
    transform: translateX(-50%);
    overflow: show;
    white-space: nowrap;
    width: auto;
    border: calc(var(--r) / 4) solid transparent;
  }
`;

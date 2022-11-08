import React, { useState, useEffect, ReactElement } from "react";
import { FullScreen, FullScreenHandle, useFullScreenHandle } from "react-full-screen";
import { FullScreenNode } from "../../../types";
import { StyledButton, StyledModal } from "../../../styled/StyledSemantic";

interface FullSceenWindowProps {
  children: (fullSceenNode: FullScreenNode, fullSceenButton: ReactElement) => ReactElement;
  askFullScreen: boolean;
}

export const FullScreenWindow = ({ children, askFullScreen }: FullSceenWindowProps) => {
  const fsHandle = useFullScreenHandle();
  const fullScreenButton = <FullScreenButton handle={fsHandle} />;

  return (
    <FullScreen handle={fsHandle}>
      {/* TODO: check if removing style={{ height: "100%" }} didn't break anything */}
      <DOMNodeProvider>
        {(fullScreenNode) => {
          // FullScreenFix children should be called as a function to pass on the fullScreenNode argument
          return (
            <>
              <AskFullScreenModal handle={fsHandle} askFullScreenSetting={askFullScreen} />
              {children(fullScreenNode, fullScreenButton)}
            </>
          );
        }}
      </DOMNodeProvider>
    </FullScreen>
  );
};

interface DOMNodeProviderProps {
  children: (fullScreenNode: FullScreenNode) => ReactElement;
}

const DOMNodeProvider = ({ children }: DOMNodeProviderProps) => {
  // due to a bug in react-full-screen, pass on a 'fullScreenNode', which tells the popup
  // where to mount.
  // https://github.com/Semantic-Org/Semantic-UI-React/issues/4191
  const [fullScreenNode, setFullScreenNode] = useState(null);

  return (
    <div className="dom-node-provider" ref={setFullScreenNode}>
      {children(fullScreenNode)}
    </div>
  );
};

interface AskFullScreenModalProps {
  handle: FullScreenHandle;
  askFullScreenSetting: boolean;
}

const AskFullScreenModal = ({ handle, askFullScreenSetting }: AskFullScreenModalProps) => {
  let [askFullscreen, setAskFullscreen] = useState(false);

  useEffect(() => {
    // this used to have location as dep
    if (askFullScreenSetting) setAskFullscreen(true);
  }, [setAskFullscreen, askFullScreenSetting, handle]);

  // Disable for now. Seems to not work in Apple devices
  //askFullscreen = false;

  return (
    <StyledModal open={askFullscreen}>
      <StyledModal.Header>Fullscreen mode</StyledModal.Header>
      <StyledModal.Content>
        <p>
          We recommend working in fullscreen, especially on mobile devices. You can always change
          this with the button in the top-right corner. For some devices fullscreen might not work.
        </p>
        <div style={{ display: "flex", height: "30%" }}>
          <StyledButton
            primary
            size="massive"
            onClick={() => {
              if (!handle.active) handle.enter();
              setAskFullscreen(false);
            }}
            style={{ flex: "1 1 auto" }}
          >
            Fullscreen
          </StyledButton>
          <StyledButton
            secondary
            size="massive"
            onClick={() => {
              if (handle.active) handle.exit();
              setAskFullscreen(false);
            }}
            style={{ flex: "1 1 auto" }}
          >
            Windowed
          </StyledButton>
        </div>
      </StyledModal.Content>
    </StyledModal>
  );
};

interface FullScreenButtonProps {
  handle: FullScreenHandle;
}

const FullScreenButton = ({ handle }: FullScreenButtonProps) => {
  return (
    <StyledButton
      size="massive"
      icon={handle.active ? "compress" : "expand"}
      style={{
        background: "transparent",
        color: "var(--text-inversed-fixed)",
        margin: "0",
        zIndex: 100,
        fontSize: "1.1em",
        padding: "5px",
      }}
      onClick={() => {
        handle.active ? handle.exit() : handle.enter();
      }}
    />
  );
};

export default FullScreenWindow;

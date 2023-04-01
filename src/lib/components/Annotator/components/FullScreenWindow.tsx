import { useState, ReactElement } from "react";
import { FullScreen, FullScreenHandle, useFullScreenHandle } from "react-full-screen";
import { FullScreenNode } from "../../../types";
import { FaCompress, FaExpand } from "react-icons/fa";

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
              {/* <AskFullScreenModal handle={fsHandle} askFullScreenSetting={askFullScreen} /> */}
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

// interface AskFullScreenModalProps {
//   handle: FullScreenHandle;
//   askFullScreenSetting: boolean;
// }

// const AskFullScreenModal = ({ handle, askFullScreenSetting }: AskFullScreenModalProps) => {
//   // Ask once per session
//   let [askFullScreen, setAskFullScreen] = useSessionStorage("askFullScreen", true);

//   // only ask for small (mobile) screen and if askFullScreenSetting allows it.
//   if (!askFullScreenSetting || window.innerWidth > 500) askFullScreen = false;

//   return (
//     <StyledModal open={askFullScreen}>
//       <StyledModal.Header>Fullscreen mode</StyledModal.Header>
//       <StyledModal.Content>
//         <p>
//           We recommend working in fullscreen on mobile devices. You can always change this with the
//           button in the top-right corner. For some devices fullscreen might not work.
//         </p>
//         <div style={{ display: "flex", height: "30%" }}>
//           <StyledButton
//             primary
//             onClick={() => {
//               if (!handle.active) handle.enter();
//               setAskFullScreen(false);
//             }}
//             style={{ width: "50%" }}
//           >
//             <FaExpand />
//             Fullscreen
//           </StyledButton>
//           <StyledButton
//             primary
//             onClick={() => {
//               if (handle.active) handle.exit();
//               setAskFullScreen(false);
//             }}
//             style={{ width: "50%" }}
//           >
//             <FaCompress />
//             Normal
//           </StyledButton>
//         </div>
//       </StyledModal.Content>
//     </StyledModal>
//   );
// };

interface FullScreenButtonProps {
  handle: FullScreenHandle;
}

const FullScreenButton = ({ handle }: FullScreenButtonProps) => {
  if (handle.active) return <FaCompress onClick={() => handle.exit()} />;
  return <FaExpand onClick={() => handle.enter()} />;
};

export default FullScreenWindow;

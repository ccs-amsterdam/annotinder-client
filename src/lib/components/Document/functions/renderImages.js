import React, { useState, useEffect, useRef } from "react";

export default function renderImages(image_fields, containerRef) {
  const images = {};
  for (let image_field of image_fields) {
    images[image_field.name] = <AnnotatableImage ref={containerRef} image_field={image_field} />;
  }
  return images;
}

const AnnotatableImage = React.forwardRef(({ image_field }, ref) => {
  const containerRef = ref;
  const img = useRef();
  const [size, setSize] = useState({});

  useEffect(() => {
    // use window.innerHeight for height, because vh on mobile is weird (can include the address bar)
    // use document.documentElement.clientwidth for width, to exclude the scrollbar
    const onResize = () => {
      const [ih, iw] = [img.current.naturalHeight, img.current.naturalWidth];
      const [ch, cw] = [containerRef.current.clientHeight, containerRef.current.clientWidth];
      const byHeight = ih / iw > ch / cw;
      if (byHeight) {
        setSize({ height: Math.min(ch, ih) + "px", width: "auto" });
      } else {
        setSize({ width: Math.min(cw, iw) + "px", height: "auto" });
      }
    };

    onResize();
    // Listen for changes to screen size and orientation
    window.addEventListener("resize", onResize);
    if (window?.screen?.orientation) {
      window.screen.orientation?.addEventListener("change", onResize);
    } else if (window?.orientation) window.orientation.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (window?.screen?.orientation) {
        window.screen.orientation.removeEventListener("change", onResize);
      } else if (window?.orientation) window.orientation.removeEventListener("change", onResize);
    };
  }, [containerRef, img]);

  //image_field.style = { maxWidth: "500px" };
  return (
    <figure
      style={{
        display: "block",
        textAlign: "center",
        margin: "0",
      }}
    >
      <img
        ref={img}
        className="AnnotatableImage"
        imageFieldName={image_field.name}
        key={image_field.name}
        alt={image_field.filename}
        src={`data:image/jpeg;base64,${image_field.base64}`}
        style={{
          border: "3px double grey", // DON"T CHANGE BORDER WIDTH WITHOUT ADJUSTING OFFSET IN getImagePosition.js

          width: size.width,
          height: size.height,
          background: "white",
          ...image_field?.style,
        }}
      />
      <figcaption style={{ marginLeft: "10px", marginRight: "10px" }}>
        {image_field.caption}
      </figcaption>
    </figure>
  );
});

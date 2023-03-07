import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { ImageField, RenderedImages } from "../../../types";

const StyledFigure = styled.figure<{ hasCaption: boolean }>`
  display: flex;
  flex-direction: column;
  text-align: center;
  place-self: center;

  & figcaption {
    margin: auto;
    padding: 0.5rem;
    height: ${(p) => (p.hasCaption ? 50 : 0)}px;
  }
`;

const StyledImg = styled.img<{ size: Size; fixedSize?: Size }>`
  border: 2px solid transparent; // DON"T CHANGE BORDER WIDTH WITHOUT ADJUSTING OFFSET IN getImagePosition.js
  margin: auto;
  background: white;
  max-width: 100%;
  width: ${(p) => p.fixedSize?.width || `${p.size.width} + px`};
  height: ${(p) => p.fixedSize?.height || `${p.size.height} + px`};
`;

/** Simple interface for image size */
interface Size {
  height: string;
  width: string;
}

/** Returns a record where keys are image field names and values are react elements that render the image */
export default function renderImages(
  image_fields: ImageField[],
  setImagesLoaded: (loaded: boolean) => any,
  containerRef: any
): RenderedImages {
  const images: RenderedImages = {};

  setImagesLoaded(image_fields.length === 0);

  const imagesLoaded: boolean[] = Array(image_fields.length).fill(false);
  function onImageLoad(index: number) {
    imagesLoaded[index] = true;
    if (!imagesLoaded.some((i) => !i)) setImagesLoaded(true);
  }

  for (let i = 0; i < image_fields.length; i++) {
    const image_field = image_fields[i];
    images[image_field.name] = (
      <AnnotatableImage
        key={"image-" + image_field.name}
        ref={containerRef}
        image_field={image_field}
        onImageLoad={() => onImageLoad(i)}
      />
    );
  }
  return images;
}

interface AnnotatableImageProps {
  image_field: ImageField;
  onImageLoad: () => any;
}

const AnnotatableImage = React.forwardRef(
  ({ image_field, onImageLoad }: AnnotatableImageProps, ref) => {
    const container = ref;
    const img = useRef<HTMLImageElement>(null);
    const [size, setSize] = useState({ height: undefined, width: undefined });
    const extraspace = image_field.caption ? 56 : 6; // reserve 50 px for caption + 6 for border

    useEffect(() => {
      const onResize = () => updateImageSize(img, container, setSize, extraspace);

      onResize();
      // Listen for changes to screen size and orientation
      window.addEventListener("resize", onResize);
      if (window?.screen?.orientation) {
        window.screen.orientation?.addEventListener("change", onResize);
      }
      return () => {
        window.removeEventListener("resize", onResize);
        if (window?.screen?.orientation) {
          window.screen.orientation.removeEventListener("change", onResize);
        }
      };
    }, [extraspace, container, img]);

    useEffect(() => {
      if (img?.current?.complete) onImageLoad();
    }, [img, onImageLoad]);

    // value should not be an array, because this is resolved in unfoldFields,
    // but typescript doesn't catch that.
    const value = Array.isArray(image_field.value) ? image_field.value[0] : image_field.value;
    let src = image_field.base64 ? `data:image/jpeg;base64,${value}` : value;

    return (
      <StyledFigure
        className="field"
        hasCaption={!!image_field.caption}
        style={{
          gridArea: image_field.grid_area,
          ...image_field?.style,
        }}
      >
        <StyledImg
          ref={img}
          size={size}
          draggable={false}
          className="AnnotatableImage"
          onLoad={() => {
            onImageLoad();
            updateImageSize(img, container, setSize, extraspace);
          }}
          onError={() => onImageLoad()}
          data-imagefieldname={image_field.name}
          key={image_field.name}
          alt={image_field.alt}
          src={src}
        />
        <figcaption>{image_field.caption}</figcaption>
      </StyledFigure>
    );
  }
);

const updateImageSize = (
  img: any,
  container: any,
  setSize: (value: Size) => void,
  bottomSpace = 0
) => {
  if (!img.current || !container.current) return;
  const [ih, iw] = [img.current.naturalHeight - bottomSpace, img.current.naturalWidth];
  const [ch, cw] = [container.current.clientHeight - bottomSpace, container.current.clientWidth];
  const byHeight = ih / iw > ch / cw;
  if (byHeight) {
    setSize({ height: Math.min(ch, ih) + "px", width: "auto" });
  } else {
    setSize({ width: Math.min(cw, iw) + "px", height: "auto" });
  }
};

export default function renderImages(image_fields) {
  const images = {};
  for (let image_field of image_fields) {
    images[image_field.name] = <AnnotatableImage image_field={image_field} />;
  }
  return images;
}

const AnnotatableImage = ({ image_field }) => {
  return (
    <figure
      style={{
        textAlign: "center",
        marginLeft: "0",
        marginRight: "0",
      }}
    >
      <img
        className="AnnotatableImage"
        imageFieldName={image_field.name}
        key={image_field.name}
        alt={image_field.filename}
        src={`data:image/jpeg;base64,${image_field.base64}`}
        style={{
          border: "3px double rgb(127, 185, 235)", // DON"T CHANGE BORDER WIDTH WITHOUT ADJUSTING OFFSET IN getImagePosition.js
          minWidth: "50%",
          maxWidth: "100%",
          background: "white",
        }}
      />
      <figcaption style={{ marginLeft: "10px", marginRight: "10px" }}>
        {image_field.caption}
      </figcaption>
    </figure>
  );
};

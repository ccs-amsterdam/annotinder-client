export default function renderImages(image_fields) {
  const images = {};
  for (let image_field of image_fields) {
    images[image_field.name] = (
      <img
        key={image_field.name}
        alt={image_field.filename}
        src={`data:image/jpeg;base64,${image_field.base64}`}
        style={{
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          border: "1px solid grey",
          minWidth: "50%",
          maxWidth: "100%",
          boxShadow: "5px 5px lightgrey",
        }}
      />
    );
  }
  return images;
}

export default () => {
  const asset = {
    width: 500,
    height: 500,
  };
  const data = {
    width: "2500",
    height: "2500",
    title: "hexagon twibon",
    image_url:
      "/imageHost/png-clipart/20220511/original/pngtree-hexagon-twibon-png-image_7715544.png",
    resId: "pngtree1_7715544",
    render_type: "auto",
  };

  const img = {
    id: "upload_3171",
    width: "640",
    height: "640",
    preview:
      "https://png.pngtree.com/edit_user/p_upload/20250110/sm/45035856b3_56828466.png",
    sample:
      "https://png.pngtree.com/edit_user/p_upload/20250110/45035856b3_56828466.png",
    size: "465095",
  };

  return (
    <div
      style={{
        position: "relative",
        width: 500,
        height: 500,
        margin: "400px auto",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${data.width} ${data.height}`}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 2,
        }}
      >
        <clipPath id="clippath">
          <rect width={500} height={500} x="0" y="0" />
        </clipPath>
        <image
          xlinkHref={data.image_url}
          width={data.width}
          height={data.height}
        />
      </svg>

      <div
        style={{
          clipPath: `rect(0px ${asset.width}px ${asset.height}px 0px)`,
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 1,
          width: "100%",
          height: "100%",
        }}
      >
        <img
          src={img.sample}
          width={data.width}
          height={data.height}
          style={{
            width: 800,
            height: 800,
            position: "absolute",
            left: -100,
            top: 0,
          }}
        />
      </div>
    </div>
  );
};

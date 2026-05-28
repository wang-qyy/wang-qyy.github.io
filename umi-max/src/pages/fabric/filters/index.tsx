import { createSVGFilter, defaultFilters, FiltersMapData } from "./utils";
import filterList from "./data";

import { Canvas, FabricImage, filters } from "fabric";
import { useEffect } from "react";

export default () => {
  const f = {
    blur: 0.4,
  };

  // const url = "https://png.pngtree.com/edit_user/p_upload/20250922/sm/a01c9bcd62_56828466.jpg"
  const url =
    "https://png.pngtree.com/edit_user/p_upload/20251105/sm/0432c2df51_56828466.png";

  useEffect(() => {
    const canvas = new Canvas("canvas");

    FabricImage.fromURL(url, { crossOrigin: "anonymous" }).then((image) => {
      const blur = new filters.Blur({ ...f });
      image.filters.push(blur);
      image.applyFilters();

      canvas.add(image);
      canvas.renderAll();
    });
  }, []);

  return (
    <>
      <div>
        <canvas id="canvas" width="500" height="500"></canvas>

        <Filter
          href={url}
          width={500}
          height={500}
          id="filter1"
          filters={{ ...defaultFilters, ...f }}
        />
      </div>
      <div>
        {filterList.map((f, index) => (
          <div key={index} style={{ display: "flex", flexWrap: "wrap" }}>
            {f.items.map((item) => (
              <div key={item.id}>
                <Filter
                  filters={{ ...defaultFilters, ...item.filters }}
                  width={100}
                  height={100}
                  id={item.id}
                  // href="https://png.pngtree.com/edit_user/p_upload/20250922/sm/a01c9bcd62_56828466.jpg"
                  href={url}
                />
                <img src={item.preview_url} width={100} height={100} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

function Filter({
  filters,
  id,
  width,
  height,
  href,
}: {
  filters: FiltersMapData;
  id: string;
  width: number;
  height: number;
  href: string;
}) {
  const svgFilter = createSVGFilter(filters, id);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              ${svgFilter}
            </defs>
            <image 
            href="${href}"
              width="${width}" 
              height="${height}" 
              filter="url(#${id})" />
          </svg>
        `,
      }}
    />
  );
}

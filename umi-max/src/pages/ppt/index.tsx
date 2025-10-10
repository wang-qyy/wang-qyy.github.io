import { Button } from "antd";
import { useEffect } from "react";

export default function () {
  useEffect(() => {}, []);

  function onFetch() {
    fetch("/maker-ppt/order/payment", {
      method: "POST",
      body: JSON.stringify({
        plan_id: 6,
      }),
    });
  }
  return (
    <div>
      <Button onClick={onFetch}>fetch</Button>
    </div>
  );
}

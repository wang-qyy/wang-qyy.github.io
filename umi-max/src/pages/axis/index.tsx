import { observable } from "mobx";
import { useEffect } from "react";

class Child {
  @observable name: string;
  constructor(opts: { name: string }) {
    this.name = opts.name;
    Object.assign(this, opts);
  }
}
class Parent {
  @observable children: Child[];

  constructor() {
    this.children = [{ name: "child1" }, { name: "child12" }].map(
      (item) => new Child(item)
    );
  }
}

export default () => {
  return <div></div>;
};

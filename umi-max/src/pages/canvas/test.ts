import UndoRedoManager from "undo-redo-manager";

interface Data {
  id: number;
  value?: string;
  oldValue?: string;
}

let data: Data[] = [{ id: 1, value: "1" }];
const typeReverse = {
  add: "del",
  del: "add",
  update: "update",
};

interface ManagerData extends Data {
  type: keyof typeof typeReverse;
}

let manager = new UndoRedoManager<ManagerData>((detail, isLastRollback) => {
  let index = data.findIndex((i) => i.id === detail.id);
  let oldValue;

  switch (detail.type) {
    case "add":
      oldValue = data.splice(index, 1).value;
      break;

    case "update":
      oldValue = data[index].value;
      data[index].value = detail.oldValue;
      break;

    case "del":
      data.push({ id: detail.id, value: detail.oldValue });
  }

  return { id: detail.id, type: typeReverse[detail.type], oldValue };
});

let obj = { id: 2, value: "2" };
data.push(obj);
manager.push({ type: "add", id: 2 });

obj.value = "WTF";
manager.push({ type: "update", id: 2, oldValue: "2" });
console.log(manager.undoStack); //[{type:'add',id:2}, {type:'update', id:2, oldValue:2}]
manager.undo();
console.log(data); //[{id:1, value:1}, {id:2, value:2}]
console.log(manager.redoStack); //[{type:'update', id:2, oldValue:'WTF'}]
manager.redo();
console.log(data); //[{id:1, value:1}, {id:2, value:'WTF'}]

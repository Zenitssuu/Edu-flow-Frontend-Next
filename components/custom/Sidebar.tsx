import React from "react";

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-48 p-4 border-r bg-gray-50">
      <h2 className="text-lg font-bold mb-4">Add Nodes</h2>
      <div
        className="p-2 mb-2 bg-white border rounded shadow cursor-move hover:bg-gray-100"
        onDragStart={(e) => onDragStart(e, "custom")}
        draggable
      >
        + Custom Node
      </div>
    </aside>
  );
}

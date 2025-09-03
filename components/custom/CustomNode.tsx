"use client";
import {
  Trash2,
  BookOpen,
  PlayCircle,
  Pencil,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState, type JSX } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

export function CustomNode({ id, data }: NodeProps) {
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (data.highlighted) {
      setHighlight(true);
      const timeout = setTimeout(() => setHighlight(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, [data.highlighted]);

  const variantStyles: Record<
    string,
    { bg: string; border: string; icon: JSX.Element }
  > = {
    new: {
      bg: "bg-blue-50",
      border: "border-blue-400",
      icon: <PlayCircle className="text-blue-600" size={18} />,
    },
    concept: {
      bg: "bg-green-50",
      border: "border-green-400",
      icon: <BookOpen className="text-green-600" size={18} />,
    },
    practice: {
      bg: "bg-yellow-50",
      border: "border-yellow-400",
      icon: <Pencil className="text-yellow-600" size={18} />,
    },
    conclusion: {
      bg: "bg-purple-50",
      border: "border-purple-400",
      icon: <CheckCircle className="text-purple-600" size={18} />,
    },
  };


  // Defensive: fallback to 'new' if variant is missing or unknown
  const style = variantStyles[data.variant] || variantStyles["new"];

  return (
    <div
      className={`relative rounded-lg border-2 p-4 shadow-sm transition
      ${style.bg} ${style.border}
      ${highlight ? "ring-4 ring-offset-2 ring-blue-300 scale-105" : "ring-0"}
      w-[220px] min-w-[200px] max-w-[360px]`}>
      {/* Trash Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          const deleteEvent = new CustomEvent("requestDeleteNode", {
            detail: { id },
          });
          window.dispatchEvent(deleteEvent);
        }}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer"
      >
        <Trash2 size={16} />
      </button>

      <div className="flex items-center gap-2 mb-2">
        {style.icon}
        <h3 className="font-semibold text-neutral-800 text-base break-words">
          {data.label}
        </h3>
      </div>

      {/* ✅ Connection Handles - render only when id is present to avoid React Flow errors */}
      {id && (
        <>
          <Handle type="target" position={Position.Top} id="top" />
          <Handle type="source" position={Position.Bottom} id="bottom" />
          <Handle type="target" position={Position.Left} id="left-in" />
          <Handle type="source" position={Position.Left} id="left-out" />
          <Handle type="target" position={Position.Right} id="right-in" />
          <Handle type="source" position={Position.Right} id="right-out" />
        </>
      )}
    </div>
  );
}

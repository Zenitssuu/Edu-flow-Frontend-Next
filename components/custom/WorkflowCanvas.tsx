"use client";
import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import {
  useSaveNewWorkflowToDB,
  useUpdateWorkflowToDB,
} from "@/hooks/workflow.hook";
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type ReactFlowInstance,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CustomNode } from "./CustomNode";
import { useDispatch, useSelector } from "react-redux";
import { clearWorkflow, setWorkflow } from "@/store/workflowSlice";
import type { Workflow, Step } from "@/store/workflowSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RootState } from "@/store/store";

/* ---------------- CONFIG ---------------- */
const MAIN_GAP_Y = 200;
const nodeTypes = { custom: CustomNode };

/* ---------------- NODE PALETTE ---------------- */
function NodePalette() {
  const nodeTypes = [
    { type: "new", label: "Main Step", icon: "➕", color: "bg-blue-500" },
    { type: "concept", label: "Concept", icon: "📘", color: "bg-green-500" },
    { type: "practice", label: "Practice", icon: "📝", color: "bg-yellow-500" },
    {
      type: "conclusion",
      label: "Conclusion",
      icon: "🏁",
      color: "bg-purple-500",
    },
  ];
  return (
    <aside className="absolute left-4 top-4 z-10 p-4 bg-white shadow-lg rounded-2xl border w-48">
      <h3 className="font-semibold text-gray-700 mb-3">Drag to Add</h3>
      {nodeTypes.map((nt) => (
        <div
          key={nt.type}
          className={`w-full mb-2 px-3 py-2 rounded cursor-move text-white flex items-center gap-2 ${nt.color}`}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/reactflow-nodetype", nt.type);
            e.dataTransfer.effectAllowed = "move";
          }}
        >
          <span>{nt.icon}</span> {nt.label}
        </div>
      ))}
    </aside>
  );
}

/* ---------------- MAIN CANVAS ---------------- */
export default function WorkflowCanvas() {
  const workflow = useSelector((state: RootState) => state.workflow.workflow);
  const dispatch = useDispatch();

  /* ---------- Map steps to nodes ---------- */
  const mapStepsToNodes = (steps: Step[]): Node[] => {
    return steps.map((step, idx) => {
      // console.log("step", step);
      return {
        id: step.id,
        position: step.position || { x: 0, y: idx * MAIN_GAP_Y },
        data: {
          label: step.title || `Step ${idx + 1}`,
          description: step.description || "",
          variant: step.variant,
          order: step.order ?? idx + 1,
          parentId: step.parentId,
        },
        type: "custom",
      };
    });
  };

  const nodesFromWorkflow = workflow?.steps
    ? mapStepsToNodes(workflow.steps)
    : [];
  const edgesFromWorkflow = workflow?.edges ?? [];

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesFromWorkflow);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesFromWorkflow);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [deleteTargetNode, setDeleteTargetNode] = useState<Node | null>(null);

  // Minimal UUID v4 generator
  function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  /* ---------- Drag/Drop New Node ---------- */
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow-nodetype");
      if (!type) return;

      const graphPos = rfInstance?.screenToFlowPosition
        ? rfInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          })
        : { x: event.clientX, y: event.clientY };

      setNodes((nds) => [
        ...nds,
        {
          id: uuidv4(),
          type: "custom",
          position: graphPos,
          data: {
            label: `New ${type}`,
            description: "Describe this step...",
            variant: type,
            order: nds.length + 1,
          },
        },
      ]);
    },
    [rfInstance, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  /* ---------- Edge Handling ---------- */
  const onConnectEdge = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "default",
            animated: false,
            style: { stroke: "#333", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#333" },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  /* ---------- Save Workflow ---------- */
  const saveWorkflowToStore = useCallback(() => {
    const steps = nodes.map((n) => ({
      id: n.id,
      title: n.data?.label ?? "",
      description: n.data?.description ?? "",
      variant: n.data?.variant ?? "",
      parentId: n.data?.parentId,
      order: n.data?.order,
      position: n.position,
    }));

    const payload: Workflow = {
      id: workflow?.id ?? "not_saved",
      title: workflow?.title ?? "Saved Workflow",
      description: workflow?.description ?? "",
      steps,
      edges,
    };

    dispatch(setWorkflow(payload));
  }, [nodes, edges, workflow, dispatch]);

  // Save to DB handler using custom hook
  const { saveNewWorkflow, isPending: isSavingToDB } = useSaveNewWorkflowToDB();
  const { updateWorkflow, isPending: isUpdatingToDB } = useUpdateWorkflowToDB();
  const saveWorkflowToDB = async () => {
    saveWorkflowToStore();

    const steps = nodes.map((n) => ({
      id: n.id,
      title: n.data?.label ?? "",
      description: n.data?.description ?? "",
      variant: n.data?.variant ?? "",
      parentId: n.data?.parentId,
      order: n.data?.order,
      position: n.position,
    }));

    const payload: Workflow = {
      title: workflow?.title ?? "Saved Workflow",
      description: workflow?.description ?? "",
      difficulty: workflow?.difficulty ?? "Intermediate",
      steps,
      edges,
    };

    try {
      let savedWorkflow;
      if (workflow?.id === "not_saved") {
        savedWorkflow = await saveNewWorkflow(payload);
      } else {
        // payload.id = workflow?.id;
        savedWorkflow = await updateWorkflow({
          id: workflow?.id || "",
          payload,
        });
      }

      // Build parent-child edges
      // const parentChildEdges = steps
      //   .filter((step: Step) => step.parentId)
      //   .map((step: Step) => ({
      //     id: `${step.parentId}-${step.id}`,
      //     source: step.parentId,
      //     target: step.id,
      //     type: "default",
      //     animated: false,
      //     style: { stroke: "#333", strokeWidth: 2 },
      //     markerEnd: { type: "arrowclosed", color: "#333" },
      //   }));
      // Merge with existing edges, avoiding duplicates (by id)
      // const existingEdgeIds = new Set(parentChildEdges.map((e) => e.id));
      // const preservedEdges = (savedWorkflow?.edges || []).filter(
      //   (e: any) => !existingEdgeIds.has(e.id)
      // );
      // const mergedEdges = [...preservedEdges, ...parentChildEdges];

      const newPayload: Workflow = {
        ...savedWorkflow,
        edges: workflow?.edges || [],
      };
      dispatch(clearWorkflow());
      dispatch(setWorkflow(newPayload));
      alert("Workflow saved to database!");
    } catch (err) {
      alert("Failed to save workflow to database.");
    }
  };

  /* ---------- Sidebar Node Edit ----------- */
  const onNodeClick = useCallback((_e: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setTitle(node.data.label || "");
    setDescription(node.data.description || "");
    setIsOpen(true);
  }, []);

  const handleSave = () => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? { ...n, data: { ...n.data, label: title, description } }
            : n
        )
      );
    }
    setIsOpen(false);
  };

  /* ---------- Move Node Up/Down ---------- */
  const handleReorder = (id: string, direction: "up" | "down") => {
    setNodes((prev) => {
      const arr = [...prev];
      const idx = arr.findIndex((n) => n.id === id);
      if (idx === -1) return prev;

      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= arr.length) return prev;

      const tmp = arr[idx];
      arr[idx] = arr[swapIdx];
      arr[swapIdx] = tmp;

      // update orders
      arr.forEach((n, i) => (n.data.order = i + 1));
      return arr;
    });
  };

  /* ---------- Delete Node ---------- */
  useEffect(() => {
    const listener = (e: any) => {
      const node = nodes.find((n) => n.id === e.detail.id);
      if (node) setDeleteTargetNode(node);
    };
    window.addEventListener("requestDeleteNode", listener);
    return () => window.removeEventListener("requestDeleteNode", listener);
  }, [nodes]);

  const confirmDeleteNode = () => {
    if (!deleteTargetNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== deleteTargetNode.id));
    setEdges((eds) =>
      eds.filter(
        (e) =>
          e.source !== deleteTargetNode.id && e.target !== deleteTargetNode.id
      )
    );
    setDeleteTargetNode(null);
  };

  /* ---------- Sidebar Resize ---------- */
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 250 && newWidth < 600) setSidebarWidth(newWidth);
      }
    };
    const up = () => setIsResizing(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [isResizing]);

  // Utility: Update parentId for all nodes based on edges
  function updateParentIds(nodes: Node[], edges: Edge[]): Node[] {
    // Build a map: target node id -> parent (source) node id
    const parentMap: Record<string, string> = {};
    edges.forEach((edge) => {
      if (edge.source && edge.target) {
        parentMap[edge.target] = edge.source;
      }
    });
    // Update each node's parentId
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        parentId: parentMap[node.id] || "-1",
      },
    }));
  }

  // Whenever edges change, update parentId for all nodes
  useEffect(() => {
    setNodes((prevNodes) => updateParentIds(prevNodes, edges));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges]);

  // console.log("nodes", nodes);
  // console.log("edges", edges);

  return (
    <div className="h-screen w-screen">
      <div className="absolute right-4 top-4 z-20 flex gap-2">
        <Button onClick={saveWorkflowToStore}>💾 Save</Button>
        <Button
          onClick={saveWorkflowToDB}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          ⬆️ Save to DB
        </Button>
      </div>
      <NodePalette />

      <div className="fixed inset-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeDoubleClick={onEdgeDoubleClick}
          onConnect={onConnectEdge}
          onInit={setRfInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          className="w-full h-full"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* Sidebar for editing */}
      {isOpen && selectedNode && (
        <div
          className="fixed right-0 top-0 h-full bg-white shadow-2xl z-50 p-6 flex flex-col border border-l-4 border-black/50"
          style={{ width: sidebarWidth }}
        >
          <div
            onMouseDown={() => setIsResizing(true)}
            className="absolute left-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-blue-400/30"
          />
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">
            Edit Node
          </h2>
          <div className="flex gap-2 mb-4">
            <Button onClick={() => handleReorder(selectedNode.id, "up")}>
              Move Up
            </Button>
            <Button onClick={() => handleReorder(selectedNode.id, "down")}>
              Move Down
            </Button>
          </div>
          <div className="flex flex-col gap-4 flex-1 overflow-auto">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Node Title"
              className="text-black"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Node Description"
              className="text-black"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button className="bg-blue-500" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTargetNode}
        onOpenChange={() => setDeleteTargetNode(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Node?</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{" "}
            <b>{deleteTargetNode?.data?.label}</b>?
          </p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTargetNode(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteNode}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

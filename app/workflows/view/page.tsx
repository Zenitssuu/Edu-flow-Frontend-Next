"use client";
import WorkflowCanvas from "@/components/custom/WorkflowCanvas";
import { ReactFlowProvider } from "reactflow";


/* -------------------- EXPORT -------------------- */
export default function Page() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas/>
    </ReactFlowProvider>
  );
}

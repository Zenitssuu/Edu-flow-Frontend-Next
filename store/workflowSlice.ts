import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Node, Edge } from "reactflow";

/* -------------------- TYPES -------------------- */
export interface Step {
  id: string;
  title: string;
  description?: string;
  variant?: string;
  parentId?: string;
  order?: number;
  position: { x: number; y: number };
}

export interface Workflow {
  id?: string;
  title: string;
  description?: string;
  difficulty?: string;
  steps: Step[];
  edges?: Edge[]; // ✅ add edges here
}

/* -------------------- STATE -------------------- */
interface WorkflowState {
  workflow: Workflow | null;
}

const initialState: WorkflowState = {
  workflow: null,
};

/* -------------------- SLICE -------------------- */
const workflowSlice = createSlice({
  name: "workflow",
  initialState,
  reducers: {
    setWorkflow: (state, action: PayloadAction<Workflow>) => {
      state.workflow = action.payload;
    },
    clearWorkflow: (state) => {
      state.workflow = null;
    },
    updateStep: (state, action: PayloadAction<Step>) => {
      if (!state.workflow) return;
      const idx = state.workflow.steps.findIndex(
        (s) => s.id === action.payload.id
      );
      if (idx !== -1) {
        state.workflow.steps[idx] = action.payload;
      }
    },
    addStep: (state, action: PayloadAction<Step>) => {
      if (!state.workflow) {
        state.workflow = { title: "Untitled", steps: [], edges: [] };
      }
      state.workflow.steps.push(action.payload);
    },
    removeStep: (state, action: PayloadAction<string>) => {
      if (!state.workflow) return;
      state.workflow.steps = state.workflow.steps.filter(
        (s) => s.id !== action.payload
      );
      // ✅ also remove any edges connected to that step
      state.workflow.edges =
        state.workflow.edges?.filter(
          (e) => e.source !== action.payload && e.target !== action.payload
        ) ?? [];
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      if (!state.workflow) return;
      state.workflow.edges = action.payload;
    },
  },
});

/* -------------------- EXPORT -------------------- */
export const {
  setWorkflow,
  clearWorkflow,
  updateStep,
  addStep,
  removeStep,
  setEdges,
} = workflowSlice.actions;
export const workflowReducer = workflowSlice.reducer;

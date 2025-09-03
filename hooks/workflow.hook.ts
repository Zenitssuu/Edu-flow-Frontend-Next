"use client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type Data = {
  title: string;
  difficulty: string;
  description: string;
};

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

const accesToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyM2JlZGJjNS01YzFlLTQ3ZWQtYTNjZS0zZWE0NTMwNjQ0NzMiLCJ1c2VyRW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzU2OTEzMTU5LCJleHAiOjE3NTY5MTY3NTl9.mwac4tEABE59HfVWddhFuq-NeCpyMxPCIsA3KrRyjX8";

export const useGenerateWorkflow = () => {
  const createWorkflowReq = async (data: Data) => {
    const resp = await axios.post("/api/workflows/generate", data, {
      headers: {
        Authorization: `Bearer ${accesToken}`,
        "Content-Type": "application/json",
      },
    });

    if (resp.status !== 201) {
      throw new Error("Failed to create worflow");
    }

    return resp.data;
  };
  const {
    mutateAsync: createWorkflow,
    isPending,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: createWorkflowReq,
  });

  return {
    createWorkflow,
    isPending,
    isError,
    isSuccess,
  };
};

export const useSaveNewWorkflowToDB = () => {
  const saveWorkflowReq = async (payload: any) => {
    const resp = await axios.post("/api/workflows/create", payload, {
      headers: {
        Authorization: `Bearer ${accesToken}`,
        "Content-Type": "application/json",
      },
    });
    if (resp.status !== 201 && resp.status !== 200) {
      throw new Error("Failed to save workflow to DB");
    }
    return resp.data;
  };

  const {
    mutateAsync: saveNewWorkflow,
    isPending,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: saveWorkflowReq,
  });

  return { saveNewWorkflow, isPending, isSuccess, isError };
};

export const useUpdateWorkflowToDB = () => {
  const updateWorkflowReq = async ({
    id,
    payload,
  }: {
    id: string;
    payload: any;
  }) => {
    const resp = await axios.put(`/api/workflows/update/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${accesToken}`,
        "Content-Type": "application/json",
      },
    });
    if (resp.status !== 201 && resp.status !== 200) {
      throw new Error("Failed to save workflow to DB");
    }
    return resp.data;
  };

  const {
    mutateAsync: updateWorkflow,
    isPending,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: updateWorkflowReq,
  });

  return { updateWorkflow, isPending, isSuccess, isError };
};

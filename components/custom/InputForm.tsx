"use client";
import { useState } from "react";
// Use built-in crypto for UUID generation
const generateUUID = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15);
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useGenerateWorkflow } from "@/hooks/workflow.hook";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setWorkflow } from "@/store/workflowSlice";
import { Step } from "@/store/workflowSlice";

export default function InputForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [description, setDescription] = useState("");
  const { createWorkflow, isPending, isError, isSuccess } =
    useGenerateWorkflow();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call backend to generate workflow (preview mode)
    // console.log({ title, difficulty });

    try {
      const workflow = await createWorkflow({ title, difficulty, description });

      //dispatch the data to redux
      // console.log(workflow);

      // Generate UUIDs for all steps and map parentId using UUIDs
      const stepUUIDs = workflow.steps.map(() => generateUUID());
      const steps = workflow.steps.map((step: any, index: number) => {
        return {
          id: stepUUIDs[index],
          title: step.title,
          description: step.description,
          variant: "main",
          parentId: index === 0 ? null : stepUUIDs[index - 1],
          order: index,
        };
      });

      // Build edges between parent and child with style and arrow
      const edges = steps
        .filter((step: Step) => step.parentId)
        .map((step: Step) => ({
          id: `${step.parentId}-${step.id}`,
          source: step.parentId,
          target: step.id,
          type: "default",
          animated: false,
          style: { stroke: "#333", strokeWidth: 2 },
          markerEnd: { type: "arrowclosed", color: "#333" },
        }));

      const payload = {
        id:"not_saved",
        title: workflow.title,
        description: workflow.description,
        difficulty,
        steps,
        edges,
      };

      dispatch(setWorkflow(payload));
      router.push("/workflows/view");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      // className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6"
      className="min-h-screen flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-xl border-none rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Create a New Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title">Workflow Title</Label>
                <Input
                  id="title"
                  placeholder="Enter workflow topic..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter workflow description you want to create..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  type="submit"
                  className="w-full text-lg py-6 rounded-xl"
                >
                  Generate Workflow
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  // const { data: workflows, isPending } = useQuery({
  //   queryKey: ["workflows"],
  //   queryFn: async () => {
  //     const res = await fetch("/api/workflows"); // your backend
  //     return res.json();
  //   },
  // });

  const workflows = [
    {
      id: "1",
      title: "Introduction to Algebra",
      description:
        "A beginner-friendly workflow covering variables, equations, and basic algebraic operations.",
      difficulty: "Beginner",
    },
    {
      id: "2",
      title: "Photosynthesis Process",
      description:
        "Detailed explanation of photosynthesis, chlorophyll function, and energy cycles.",
      difficulty: "Intermediate",
    },
    {
      id: "3",
      title: "World War II Overview",
      description:
        "Covers major battles, political alliances, and the aftermath of WWII.",
      difficulty: "Advanced",
    },
    {
      id: "4",
      title: "Human Digestive System",
      description:
        "Step-by-step guide through the digestive organs and their functions.",
      difficulty: "Beginner",
    },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Workflows</h1>
        <Button onClick={() => router.push("/workflows/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Workflow
        </Button>
      </div>

      {/* Workflows Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* {isLoading && <p>Loading...</p>} */}

        {workflows?.map((workflow: any) => (
          <motion.div
            key={workflow.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card
              className="cursor-pointer hover:shadow-lg transition"
              // onClick={() => router.push(`/workflows/${workflow.id}`)}
              onClick={() => router.push(`/workflows/view`)}
            >
              <CardHeader>
                <CardTitle>{workflow.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {workflow.description}
                </p>
                <p className="mt-2 text-xs text-primary">
                  Difficulty: {workflow.difficulty}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

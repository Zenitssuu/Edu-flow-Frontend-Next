import { cn } from "@/lib/utils";

export default function GridBackground() {
  return (
    <div className="absolute inset-0 -z-10 flex h-full w-full items-center justify-center bg-white dark:bg-black overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 animate-grid",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />
      {/* Fade overlay for depth */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
    </div>
  );
}

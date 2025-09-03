import React from "react";
import GridBackground from "./GridBackground";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`relative min-h-screen flex flex-col text-white`}>
      {/* Grid background */}
      {/* <GridBackground /> */}

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* <header className="bg-black/60 backdrop-blur-md py-4 px-6 shadow">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-green-400 font-bold text-xl">
              AI Course Builder
            </h1>
            <nav className="flex gap-6 text-gray-300">
              <a href="/" className="hover:text-green-400 transition">
                Home
              </a>
              <a href="/workflows" className="hover:text-green-400 transition">
                Workflows
              </a>
              <a href="/profile" className="hover:text-green-400 transition">
                Profile
              </a>
            </nav>
          </div>
        </header> */}

        <main className="flex-grow flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-4xl">{children}</div>
        </main>

        {/* <footer className="bg-black/60 backdrop-blur-md py-4 px-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} AI Course Builder. All rights reserved.
        </footer> */}
      </div>
    </div>
  );
}

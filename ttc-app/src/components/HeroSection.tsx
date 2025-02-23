// src/components/HeroSection.tsx
"use client";

import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Optional: Background image overlay */}
      <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: 'url("/images/hero-bg.jpg")' }}></div>
      
      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Hi all,
        </h1>
        <p className="text-lg sm:text-xl mb-6">
          Welcome to MyPLATT! Here is a brief overview of how everything works. A full tutorial will be coming once we move out of BETA. As a reminder, this pricing is for the BETA version. You keep access to this pricing as long as you do not leave MyPLATT. Also bear in mind that if you leave MyPLATT, you start all over from month 1. You cannot "pick up where you left off."
        </p>
        <div className="text-left max-w-3xl mx-auto">
          <ol className="list-decimal space-y-3 pl-5">
            <li className="text-base sm:text-lg">
              You can view your tasks by month under the "projects" section. You can view it as a list, board, timeline, or table. I prefer the board.
            </li>
            <li className="text-base sm:text-lg">
              Drag and drop tasks from the "to do" section to the "in progress," "under review," or "completed" section. This will then update accordingly on your home page under "your tasks."
            </li>
            <li className="text-base sm:text-lg">
              You should be able to click all of the links within a task to see the resource.
            </li>
            <li className="text-base sm:text-lg">
              Each month, a new set of tasks will release for you to take action.
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

"use client";

import { AlertTriangle, EyeOff, Info, XCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

interface BannerProps {
  children: React.ReactNode;
  className?: string;
  type?: "warning" | "error" | "info";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  link?: string;
}

const Banner: React.FC<BannerProps> = ({
  children,
  className = "",
  type = "info",
  startIcon,
  endIcon,
  link,
}) => {
  const bannerColors = {
    warning: "bg-yellow-400 text-gray-800",
    error: "bg-red-700 text-white",
    info: "bg-blue-500 text-white",
  };

  const defaultIcons = {
    warning: <AlertTriangle className="w-5 h-5 text-gray-800" />,
    error: <XCircle className="w-5 h-5 text-white" />,
    info: <Info className="w-5 h-5 text-white" />,
  };

  const baseClasses = `
    p-4 flex items-center rounded-lg mb-8 w-full
    ${bannerColors[type]} ${className}
  `;

  const interactiveClasses = link
    ? "transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
    : "";

  const content = (
    <div className={`${baseClasses} ${interactiveClasses}`}>
      <div className="flex-shrink-0 mr-3">
        {startIcon ?? defaultIcons[type] ?? <EyeOff className="w-5 h-5" />}
      </div>
      <div className="flex flex-col md:flex-row flex-grow items-center md:space-x-4">
        <div className="flex-grow text-center">{children}</div>
      </div>
      {endIcon && <div className="flex-shrink-0 ml-3">{endIcon}</div>}
    </div>
  );

  return link ? <Link href={link}>{content}</Link> : content;
};

export default Banner;

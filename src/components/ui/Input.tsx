import React from "react";

const Input = ({ className = "", ...props }: any) => {
  return (
    <input
      className={`w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};

export { Input };

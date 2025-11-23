import React from "react";
export function Progress({ value }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="bg-blue-600 h-2 transition-all"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}

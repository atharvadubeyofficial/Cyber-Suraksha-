import React from "react";
export function Avatar({ src, name }) {
  return (
    <div className="flex items-center space-x-3">
      <img
        src={src}
        alt={name}
        className="h-10 w-10 rounded-full object-cover border"
      />
      <span className="font-medium">{name}</span>
    </div>
  );
}

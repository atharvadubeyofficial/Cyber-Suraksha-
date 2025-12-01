import React from "react";

const Input = ({ value, onChange, type = "text", ...props }) => (
  <input type={type} value={value} onChange={onChange} {...props} />
);

export default Input;

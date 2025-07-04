import React from "react";
import { useTheme } from "./ThemeProvider";

const ThemeToggle = () => {
  const themeContext = useTheme();

  if (!themeContext) {
    throw new Error("ThemeToggle must be used within a ThemeProvider");
  }

  const { theme, toggleTheme } = themeContext;

  return (
    <div
      style={{
        position: "absolute",
        width: "40px",
        height: "20px",
        border: "1px solid black",
        borderRadius: "1em",
        backgroundColor: theme === "light" ? "lightblue" : "black",
        cursor: "pointer"
      }}
      onClick={toggleTheme}
    >
      <div
        style={{
          position: "relative",
          width: "19px",
          height: "19px",
          border: "1px solid black",
          borderRadius: "1em",
          transform: theme === "light" ? "translateX(0)" : "translateX(20px)",
          transition: "transform 0.3s ease-in-out",
          backgroundColor: theme === "light" ? "yellow" : "darkblue",
        }}
      />
    </div>
  );
};

export default ThemeToggle;

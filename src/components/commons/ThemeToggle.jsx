// src/components/ThemeToggle.jsx
import { useEffect, useState } from "react";
import { ToggleSwitch } from "flowbite-react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi";

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <div className="flex items-center justify-end">
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
          isDarkMode ? "bg-gray-700" : "bg-yellow-400"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full shadow-md transform duration-300 ${
            isDarkMode ? "translate-x-6 bg-white" : "translate-x-0 bg-gray-800"
          } flex items-center justify-center`}
        >
          {isDarkMode ? (
            <HiOutlineMoon className="text-xs text-gray-700" />
          ) : (
            <HiOutlineSun className="text-xs text-yellow-300" />
          )}
        </div>
      </button>
    </div>
  );
}

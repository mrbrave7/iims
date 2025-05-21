"use client";
import { FaMoon, FaSun } from "react-icons/fa6";
import { useAdminContext } from "../AdminProvider";

export default function ThemeSwitcher() {
  const { theme, themeToggle } = useAdminContext();

  return (
    <button
      className={`
        relative p-2.5 rounded
        bg-white dark:bg-stone-900
        backdrop-blur-md
        border border-stone-200 dark:border-stone-700
        text-stone-700 dark:text-stone-200
        hover:border-stone-400 dark:hover:border-stone-500
        active:scale-[0.97]
        transition-all duration-200 ease-in-out
        group
      `}
      onClick={themeToggle}
    >
      {/* Animated border effect */}
      <span
        className={`
          absolute inset-0 rounded-xl
          border-2 border-transparent
          transition-all duration-500 ease-out
        `}
      ></span>

      {/* Icon with fade and slight bounce */}
      <span className="relative z-10 flex items-center justify-center">
        {theme === "dark" ? (
          <FaSun
            className={`
              w-5 h-5 text-orange-600
              group-hover:translate-y-[-2px]
              transition-all duration-300 ease-out
            `}
          />
        ) : (
          <FaMoon
            className={`
              w-5 h-5 text-orange-700
              group-hover:translate-y-[-2px]
              transition-all duration-300 ease-out
            `}
          />
        )}
      </span>
    </button>
  );
}
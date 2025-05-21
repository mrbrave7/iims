"use client";
import { useEffect, useRef, useState } from "react";
import { useAdminContext } from "../Context/AdminProvider";
import Link from "next/link";
import ThemeSwitcher from "../Context/Components/ThemeSwitcher";
import Logout from "./Logout";

export default function Usermodale(): React.ReactElement {
  const { adminId, admin } = useAdminContext();
  const [showUserModale, setShowUserModale] = useState<boolean>(false);
  const modaleRef = useRef<HTMLDivElement>(null);
  const subModaleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modaleRef.current &&
        subModaleRef.current &&
        !modaleRef.current.contains(e.target as Node) &&
        !subModaleRef.current.contains(e.target as Node)
      ) {
        setShowUserModale(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleModale = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserModale((prev) => !prev);
  };

  if (!adminId) {
    return <div></div>;
  }

  return (
    <div className="fixed top-10 right-10 z-50">
      <div
        ref={modaleRef}
        onClick={toggleModale}
        className="rounded-full h-12 w-12 text-stone-100 dark:text-stone-900 bg-orange-600 flex items-center justify-center text-white cursor-pointer"
        aria-haspopup="true"
        aria-expanded={showUserModale}
      >
        <span className="text-2xl font-bold">
          {admin?.username?.charAt(0).toUpperCase() || "U"}
        </span>
      </div>

      {showUserModale && (
        <div
          ref={subModaleRef}
          className="absolute flex items-center justify-between flex-col top-12 right-0  gap-2 bg-orange-600 rounded shadow-lg p-2"
          role="menu"
        >
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Logout />
          </div>
          {
            admin?.profile_details ? (
              <Link className="p-2 text-orange-600 bg-stone-100 dark:bg-stone-900 w-full font-bold text-center rounded" href={"/"}> Profile</Link>
            ) : (
              <Link className="p-2 text-orange-600 bg-stone-100 dark:bg-stone-900 w-full font-bold text-center rounded" href={"/create-profile"}> Setup</Link>
            )
          }
        </div>
      )}
    </div>
  );
}
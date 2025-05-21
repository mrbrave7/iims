"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode, useState, useCallback } from "react";
import {
  PiArticle,
  PiBank,
  PiChalkboardTeacher,
  PiGear,
  PiGraduationCap,
  PiImage,
  PiStudent,
  PiUpload,
  PiUsers,
  PiVideo
} from "react-icons/pi";
import { Tooltip } from "@nextui-org/tooltip";
import { BiCaretDown, BiCaretLeft, BiCaretRight } from "react-icons/bi";
import { useAdminContext } from "../Context/AdminProvider";
import { MdCurrencyRupee } from "react-icons/md";

interface NavItem {
  name: string;
  icon: ReactNode;
  href?: string;
  group?: string;
  children?: NavItem[];
}

export default function Sidebar(): React.ReactElement {
  const pathname = usePathname(); // Hook 1
  const [isCollapsed, setIsCollapsed] = useState(true); // Hook 2
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({}); // Hook 3
  const [isManuallyToggled, setIsManuallyToggled] = useState(false); // Hook 4
  const { adminId } = useAdminContext(); // Hook 5
  const toggleExpand = useCallback((name: string) => { // Hook 6
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  }, []);

  // Define navItems outside of conditional logic
  const navItems: NavItem[] = [
    { name: "Courses", icon: <PiGraduationCap size={20} />, href: "/courses", group: "Learning" },
    { name: "Students", icon: <PiStudent size={20} />, href: "/students", group: "Learning" },
    { name: "Instructor", icon: <PiChalkboardTeacher size={20} />, href: "/instructor", group: "Learning" },
    { name: "ClassRoom", icon: <PiUsers size={20} />, href: "/classrooms", group: "Learning" },
    { name: "Articles", icon: <PiArticle size={20} />, href: "/articles", group: "Content" },
    {
      name: "Media",
      icon: <PiUpload size={20} />,
      group: "Content",
      children: [
        { name: "Images", icon: <PiImage size={20} />, href: "/uploads/images" },
        { name: "Videos", icon: <PiVideo size={20} />, href: "/uploads/videos" }
      ]
    },

    { name: "Payments", icon: <PiBank size={20} />, href: "/payments", group: "Setting" },
    { name: "Accounts", icon: <MdCurrencyRupee size={20} />, href: "/accounts", group: "Setting" },
    { name: "Settings", icon: <PiGear size={20} />, href: "/settings", group: "Settings" },
  ];

  const isActive = (href?: string) => href && pathname === href;

  const handleSignOut = () => {
    console.log("Signing out...");
    // Add actual sign-out logic here
  };

  const handleManualToggle = () => {
    setIsCollapsed(prev => !prev);
    setIsManuallyToggled(true);
  };

  const handleMouseEnterOrFocus = () => {
    if (!isManuallyToggled) setIsCollapsed(false);
  };

  const handleMouseLeaveOrBlur = () => {
    if (!isManuallyToggled) setIsCollapsed(true);
  };

  const renderNavItems = (items: NavItem[], isRoot = false) => {
    return items.map((item, index) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedItems[item.name] ?? false;
      const isItemActive = isActive(item.href) ||
        (hasChildren && item.children?.some(child => isActive(child.href)));

      return (
        <li key={index} className={isRoot ? "px-3" : ""}>
          {item.href ? (
            <Link
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive(item.href)
                  ? "bg-orange-500 text-white font-bold shadow-md"
                  : "text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-orange-500"
                } ${isCollapsed ? "justify-center" : "justify-start"}`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && (
                <>
                  <span className="whitespace-nowrap">{item.name}</span>
                  {hasChildren && (
                    <span className="ml-auto">
                      {isExpanded ? <BiCaretDown size={16} /> : <BiCaretLeft size={16} />}
                    </span>
                  )}
                </>
              )}
            </Link>
          ) : hasChildren ? (
            <>
              <button
                onClick={() => toggleExpand(item.name)}
                className={`flex items-center gap-3 p-3 w-full rounded-lg transition-all ${isItemActive
                    ? "text-orange-500"
                    : "text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-orange-500"
                  } ${isCollapsed ? "justify-center" : "justify-start"}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="whitespace-nowrap">{item.name}</span>
                    <span className="ml-auto">
                      {isExpanded ? <BiCaretDown size={16} /> : <BiCaretRight size={16} />}
                    </span>
                  </>
                )}
              </button>
              {!isCollapsed && isExpanded && hasChildren && (
                <ul className="ml-4 mt-1 space-y-1">
                  {renderNavItems(item.children!)}
                </ul>
              )}
            </>
          ) : (
            <button
              onClick={handleSignOut}
              className={`flex items-center gap-3 p-3 w-full rounded-lg transition-all ${isCollapsed ? "justify-center" : "justify-start"
                } text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-orange-500`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span>{item.name}</span>}
            </button>
          )}
        </li>
      );
    });
  };

  // Conditional rendering after all Hooks
  if (!adminId) {
    return <div></div>;
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-screen ${isCollapsed ? "w-20" : "w-64"
        } bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200 shadow-xl transition-all duration-300 ease-in-out z-50`}
      aria-label="Sidebar navigation"
      onMouseEnter={handleMouseEnterOrFocus}
      onMouseLeave={handleMouseLeaveOrBlur}
      onFocus={handleMouseEnterOrFocus}
      onBlur={handleMouseLeaveOrBlur}
      tabIndex={0}
    >
      <header
        className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
        onClick={handleManualToggle}
        aria-expanded={!isCollapsed}
      >
        <h2 className={`text-xl font-semibold transition-all ${isCollapsed ? "text-center w-full" : ""}`}>
            <span className="text-orange-500">AP</span>
        </h2>
      </header>

      <nav className="py-4 h-[calc(100%-4rem)] overflow-y-auto">
        {isCollapsed ? (
          <ul className="flex flex-col gap-1 px-2">
            {navItems.map((item, index) => (
              <li key={index}>
                <Tooltip content={item.name} className="bg-stone-300 dark:bg-stone-700 p-2 rounded" placement="right">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`flex items-center justify-center p-3 rounded-lg transition-all ${isActive(item.href)
                          ? "bg-orange-500 text-white shadow-md"
                          : "text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-orange-500"
                        }`}
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      {item.icon}
                    </Link>
                  ) : (
                    <button
                      onClick={item.children ? () => toggleExpand(item.name) : handleSignOut}
                      className="flex items-center justify-center p-3 w-full rounded-lg text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-orange-500 transition-all"
                      aria-label={item.children ? item.name : "Sign out"}
                    >
                      {item.icon}
                    </button>
                  )}
                </Tooltip>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-2 px-3">
            {renderNavItems(navItems, true)}
          </ul>
        )}
      </nav>

      <div
        className="absolute bottom-4 right-4 w-6 h-6 flex items-center justify-center bg-stone-300 dark:bg-stone cooking-stone-700 rounded-full cursor-pointer hover:bg-stone-400 dark:hover:bg-stone-600 transition-colors"
        onClick={handleManualToggle}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <span className="text-xs text-stone-800 dark:text-stone-200">→</span>
        ) : (
          <span className="text-xs text-stone-800 dark:text-stone-200">←</span>
        )}
      </div>
    </aside>
  );
}
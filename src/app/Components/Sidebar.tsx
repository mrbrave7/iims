"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode, useState, useCallback, useEffect } from "react";
import { LuMessagesSquare } from "react-icons/lu";
import { IoIosNotificationsOutline } from "react-icons/io";
import {
  PiArticle,
  PiBank,
  PiBell,
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
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import { useAdminContext } from "../Context/AdminProvider";
import { MdCurrencyRupee } from "react-icons/md";
import { CiMail } from "react-icons/ci";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { RiDashboardLine } from "react-icons/ri";

interface NavItem {
  name: string;
  icon: ReactNode;
  href?: string;
  group?: string;
  children?: NavItem[];
}

export default function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isManuallyToggled, setIsManuallyToggled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { adminId } = useAdminContext();

  // Auto-collapse when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth <= 768 && !isCollapsed) {
        const sidebar = document.querySelector('aside');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsCollapsed(true);
          setIsManuallyToggled(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCollapsed]);

  // Responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
        setIsManuallyToggled(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleExpand = useCallback((name: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  }, []);

  const handleManualToggle = useCallback(() => {
    setIsCollapsed(prev => {
      const newState = !prev;
      if (!newState) {
        const activeParents = findActiveParents(pathname, navItems);
        setExpandedItems(prev => ({
          ...prev,
          ...activeParents
        }));
      }
      return newState;
    });
    setIsManuallyToggled(true);
  }, [pathname]);

  const handleMouseEnter = useCallback(() => {
    if (!isManuallyToggled) {
      setIsHovered(true);
      setIsCollapsed(false);
    }
  }, [isManuallyToggled]);

  const handleMouseLeave = useCallback(() => {
    if (!isManuallyToggled && isHovered) {
      setIsCollapsed(true);
      setIsHovered(false);
    }
  }, [isManuallyToggled, isHovered]);

  const findActiveParents = (currentPath: string, items: NavItem[]): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    
    const checkItems = (navItems: NavItem[]): boolean => {
      return navItems.some(item => {
        if (item.href && (currentPath === item.href || currentPath.startsWith(`${item.href}/`))) {
          return true;
        }
        
        if (item.children) {
          const hasActiveChild = checkItems(item.children);
          if (hasActiveChild) {
            result[item.name] = true;
            return true;
          }
        }
        
        return false;
      });
    };
    
    checkItems(items);
    return result;
  };

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      icon: <RiDashboardLine size={20} />,
      href: "/dashboard",
      group: "Main"
    },
    {
      name: "Courses",
      icon: <PiGraduationCap size={20} />,
      group: "Content",
      children: [
        { name: "All Courses", icon: <PiGraduationCap size={18} />, href: "/courses" },
        { name: "Online", icon: <PiVideo size={18} />, href: "/courses/online" },
        { name: "Offline", icon: <PiChalkboardTeacher size={18} />, href: "/courses/offline" },
        { name: "Free", icon: <PiStudent size={18} />, href: "/courses/free" }
      ]
    },
    { 
      name: "Students", 
      icon: <PiStudent size={20} />, 
      href: "/students", 
      group: "Learning" 
    },
    { 
      name: "Instructors", 
      icon: <PiChalkboardTeacher size={20} />, 
      href: "/instructors", 
      group: "Learning" 
    },
    { 
      name: "Classrooms", 
      icon: <PiUsers size={20} />, 
      href: "/classrooms", 
      group: "Learning" 
    },
    { 
      name: "Articles", 
      icon: <PiArticle size={20} />, 
      href: "/articles", 
      group: "Content" 
    },
    {
      name: "Media",
      icon: <PiUpload size={20} />,
      group: "Content",
      children: [
        { name: "Images", icon: <PiImage size={18} />, href: "/media/images" },
        { name: "Videos", icon: <PiVideo size={18} />, href: "/media/videos" }
      ]
    },
    {
      name: "Communications",
      icon: <LuMessagesSquare size={20} />,
      group: "Content",
      children: [
        { name: "Mail", icon: <CiMail size={18} />, href: "/communications/mail" },
        { name: "Notifications", icon: <IoIosNotificationsOutline size={18} />, href: "/communications/notifications" }
      ]
    },
    { 
      name: "Payments", 
      icon: <PiBank size={20} />, 
      href: "/payments", 
      group: "Finance" 
    },
    { 
      name: "Accounts", 
      icon: <MdCurrencyRupee size={20} />, 
      href: "/accounts", 
      group: "Finance" 
    },
    { 
      name: "Settings", 
      icon: <PiGear size={20} />, 
      href: "/settings", 
      group: "System" 
    },
  ];

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isParentActive = (item: NavItem): boolean => {
    if (item.href && isActive(item.href)) return true;
    
    if (item.children) {
      return item.children.some(child => {
        if (child.href) return isActive(child.href);
        return false;
      });
    }
    
    return false;
  };

  const shouldExpand = (item: NavItem): boolean => {
    if (expandedItems[item.name]) return true;
    
    if (item.children) {
      return item.children.some(child => {
        if (child.href) return isActive(child.href);
        return false;
      });
    }
    
    return false;
  };

  const renderNavItems = (items: NavItem[], isRoot = false) => {
    return items.map((item, index) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = shouldExpand(item);
      const isItemActive = isParentActive(item);

      return (
        <li key={index}>
          {item.href && !hasChildren ? (
            <Link
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? "bg-orange-100 dark:bg-orange-900/80 text-orange-800 dark:text-orange-100 font-medium border-l-4 border-orange-500"
                  : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-orange-600 dark:hover:text-orange-400"
              } ${isCollapsed ? "justify-center border-l-0" : "justify-start"}`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <span className={`flex-shrink-0 ${isActive(item.href) ? "text-orange-600 dark:text-orange-300" : ""}`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="whitespace-nowrap text-sm">{item.name}</span>
              )}
            </Link>
          ) : hasChildren ? (
            <>
              <button
                onClick={() => toggleExpand(item.name)}
                className={`flex items-center gap-3 p-3 w-full rounded-lg transition-all ${
                  isItemActive
                    ? "bg-orange-100 dark:bg-orange-900/80 text-orange-800 dark:text-orange-100"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-orange-600 dark:hover:text-orange-400"
                } ${isCollapsed ? "justify-center" : "justify-between"}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex-shrink-0 ${isItemActive ? "text-orange-600 dark:text-orange-300" : ""}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="whitespace-nowrap text-sm">{item.name}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <span className={`ml-2 transition-transform duration-200 ${isItemActive ? "text-orange-600 dark:text-orange-300" : "text-stone-500 dark:text-stone-400"}`}>
                    {isExpanded ? <BiChevronDown size={16} /> : <BiChevronRight size={16} />}
                  </span>
                )}
              </button>
              {!isCollapsed && isExpanded && hasChildren && (
                <ul className="ml-8 mt-1 space-y-1 border-l border-orange-200 dark:border-orange-700 pl-3">
                  {renderNavItems(item.children!)}
                </ul>
              )}
            </>
          ) : null}
        </li>
      );
    });
  };

  if (!adminId) {
    return <div></div>;
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-screen ${
        isCollapsed ? "w-20" : "w-64"
      } bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-700 shadow-sm transition-all duration-300 ease-in-out z-50 flex flex-col md:relative`}
      aria-label="Sidebar navigation"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
        {!isCollapsed ? (
          <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100">
            <span className="text-orange-500">Edu</span>Admin
          </h2>
        ) : (
          <div className="w-full flex justify-center">
            <span className="text-orange-500 text-xl font-semibold">EA</span>
          </div>
        )}
        <button
          onClick={handleManualToggle}
          className="p-1.5 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/30 text-stone-600 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <FiChevronsRight size={20} className="transform transition-transform hover:scale-110" />
          ) : (
            <FiChevronsLeft size={20} className="transform transition-transform hover:scale-110" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {isCollapsed ? (
          <ul className="flex flex-col gap-1 px-2">
            {navItems.map((item, index) => {
              const isItemActive = isParentActive(item);
              return (
                <li key={index}>
                  <Tooltip 
                    content={item.name} 
                    placement="right"
                    classNames={{
                      content: "bg-stone-800 text-stone-100 px-3 py-2 text-xs"
                    }}
                  >
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={`flex items-center justify-center p-3 rounded-lg transition-all ${
                          isItemActive
                            ? "bg-orange-100 dark:bg-orange-900/80 text-orange-600 dark:text-orange-300"
                            : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-orange-600 dark:hover:text-orange-400"
                        }`}
                        aria-current={isItemActive ? "page" : undefined}
                      >
                        {item.icon}
                      </Link>
                    ) : (
                      <button
                        onClick={() => toggleExpand(item.name)}
                        className={`flex items-center justify-center p-3 w-full rounded-lg transition-all ${
                          isItemActive
                            ? "bg-orange-100 dark:bg-orange-900/80 text-orange-600 dark:text-orange-300"
                            : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-orange-600 dark:hover:text-orange-400"
                        }`}
                        aria-label={item.name}
                      >
                        {item.icon}
                      </button>
                    )}
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="flex flex-col gap-1 px-4">
            {renderNavItems(navItems, true)}
          </ul>
        )}
      </nav>
    </aside>
  );
}
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const DynamicBreadcrumb = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    ...pathSegments.map((segment, index) => {
      const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
      return {
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/%20/g, " "),
        href: index === pathSegments.length - 1 ? null : href,
      };
    }),
  ];

  return (
    <nav
      aria-label="breadcrumb"
      className="flex items-center sticky top-16 w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 my-4"
    >
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center last:font-semibold">
          {item.href ? (
            <Link
              href={item.href}
              className="text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300 transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white">{item.label}</span>
          )}
          {index < breadcrumbItems.length - 1 && (
            <span className="mx-2 text-gray-400 dark:text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default DynamicBreadcrumb;
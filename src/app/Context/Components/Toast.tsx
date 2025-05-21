import { FaX } from "react-icons/fa6";
import { HiOutlineInformationCircle, HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { FaCircleNotch } from "react-icons/fa6";

interface Popup {
    id: string | number;
    type: "info" | "success" | "warning" | "error" | "process" | "custom"; // Added "custom" to match IPopup
    message: string | React.ReactNode; // Updated to match IPopup from PopupProvider
    onclose: (id: string | number) => void;
    className?: string;
    isExiting?: boolean; // Added to handle exit animation
}

export default function Toast({ id, type, message, onclose, className, isExiting }: Popup):React.ReactElement{
    const textColors = {
        info: "text-blue-600 dark:text-blue-300",
        success: "text-emerald-600 dark:text-emerald-300",
        warning: "text-amber-600 dark:text-amber-300",
        error: "text-rose-600 dark:text-rose-300",
        process: "text-gray-600 dark:text-gray-300",
        custom: "text-gray-600 dark:text-gray-300",
    };

    const bgColors = {
        info: "bg-blue-50/30 dark:bg-blue-900/30",
        success: "bg-emerald-50/30 dark:bg-emerald-900/30",
        warning: "bg-amber-50/30 dark:bg-amber-900/30",
        error: "bg-rose-50/30 dark:bg-rose-900/30",
        process: "bg-gray-50/30 dark:bg-gray-900/30",
        custom: "bg-gray-50/30 dark:bg-gray-900/30",
    };

    const borderColors = {
        info: "border-blue-500",
        success: "border-emerald-500",
        warning: "border-amber-500",
        error: "border-rose-500",
        process: "border-gray-500",
        custom: "border-gray-500",
    };

    const icons = {
        info: <HiOutlineInformationCircle className="w-6 h-6" />,
        success: <HiOutlineCheckCircle className="w-6 h-6" />,
        warning: <HiOutlineExclamationTriangle className="w-6 h-6" />,
        error: <HiOutlineXCircle className="w-6 h-6" />,
        process: <FaCircleNotch className="w-6 h-6 animate-spin" />,
        custom: null, // Custom type might not need a default icon
    };

    return (
        <div
            className={`
                flex items-center justify-between
                ${bgColors[type]}
                p-4
                rounded-xl
                shadow-lg
                max-w-md
                w-full
                transform
                transition-all
                duration-300
                ease-in-out
                border-l-4
                ${borderColors[type]}
                ${className || ""}
                ${isExiting 
                    ? "animate-toast-exit opacity-0" 
                    : "animate-toast-enter opacity-100"}
                backdrop-blur-md
                hover:shadow-xl
                hover:-translate-y-1
            `}
        >
            {/* Icon (if present) */}
            {icons[type] && (
                <span className={`text-2xl mr-3 ${textColors[type]}`}>
                    {icons[type]}
                </span>
            )}

            {/* Message */}
            <span
                className={`
                    flex-1
                    text-sm
                    font-medium
                    ${textColors[type]}
                    line-clamp-2
                    leading-relaxed
                `}
            >
                {message || "No message provided"}
            </span>

            {/* Close Button */}
            <button
                onClick={() => onclose(id)}
                className={`
                    ml-3
                    p-1.5
                    rounded-full
                    hover:bg-white/20
                    dark:hover:bg-black/20
                    transition-all
                    duration-200
                    focus:outline-none
                    focus:ring-2
                    focus:ring-offset-2
                    focus:ring-${type === "process" || type === "custom" ? "gray" : type}-400
                `}
                aria-label="Close toast"
            >
                <FaX className={`w-3.5 h-3.5 ${textColors[type]}`} />
            </button>
        </div>
    );
}
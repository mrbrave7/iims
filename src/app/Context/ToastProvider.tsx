"use client";
import { createContext, useState, ReactNode, useContext, useEffect } from "react";
import Toast from "@/app/Context/Components/Toast";
import { v4 as uuidv4 } from 'uuid';

export interface IPopup {
    id: string;
    message: string | ReactNode;
    type: "info" | "success" | "warning" | "error" | "process" | "custom";
    onclose?: (id: string) => void;
    addedAt?: number;
    isExiting?: boolean;
}

// Define the interface for the context
interface IPopupContext {
    popups: IPopup[];
    Popup: () => {
        error: (message: string) => void;
        loading: (message: string) => void;
        success: (message: string) => void;
        warning: (message: string) => void;
        info: (message: string) => void;
        custom: (message: ReactNode) => void;
        dismiss: () => void;
    };
}

const PopupContext = createContext<IPopupContext | undefined>(undefined);

// Provider component
export const PopupProvider = ({ children }: { children: ReactNode }) => {
    const [popups, setPopups] = useState<IPopup[]>([]);

    const Popup = () => {
        const createPopup = (type: IPopup["type"], message: string | ReactNode) => {
            const newPopup: IPopup = {
                id: uuidv4(),
                type,
                message,
                onclose: removePopup,
                addedAt: Date.now(),
                isExiting: false // Changed from true to false as initial state
            };
            setPopups((prevPopups) => [...prevPopups, newPopup]);
        };

        return {
            error: (message: string) => createPopup("error", message),
            loading: (message: string) => createPopup("process", message),
            success: (message: string) => createPopup("success", message),
            warning: (message: string) => createPopup("warning", message),
            info: (message: string) => createPopup("info", message),
            custom: (message: ReactNode) => createPopup("custom", message),
            dismiss: () => removePopups()
        };
    };

    function removePopups(): void {
        setPopups([]);
    }

    function removePopup(id: string) {
        setPopups((prevPopups) =>
            prevPopups.map((popup) =>
                popup.id === id ? { ...popup, isExiting: true } : popup
            )
        );
        setTimeout(() => {
            setPopups((prevPopups) => prevPopups.filter((popup) => popup.id !== id));
        }, 300); // This matches with your animation duration
    }

    useEffect(() => {
        const timers = popups.map((popup) => {
            if (!popup.isExiting && popup.addedAt) {
                const timeElapsed = Date.now() - popup.addedAt;
                const delay = Math.max(3000 - timeElapsed, 0);
                return setTimeout(() => removePopup(popup.id), delay);
            }
            return undefined;
        });
        return () => timers.forEach((timer) => timer && clearTimeout(timer));
    }, [popups]);

    return (
        <PopupContext.Provider value={{ popups, Popup }}>
            {/* Toast Container */}
            <div className="fixed bottom-5 right-5 flex flex-col gap-3 overflow-y-hidden z-50 max-h-[80vh]">
                {popups.map((popup) => (
                    <Toast
                        id={popup.id}
                        type={popup.type}
                        message={popup.message}
                        onclose={() => {removePopup(popup.id)}}
                        isExiting={popup.isExiting}
                        key={popup.id} />
                ))}
            </div>
            {children}
        </PopupContext.Provider>
    );
};

// Custom hook to use the popup context
export function usePopupContext() {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error("usePopupContext must be used within a PopupProvider");
    }
    return context;
};
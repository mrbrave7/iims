"use client"

import { useRouter } from "next/navigation"
import { useAdminContext } from "./Context/AdminProvider"

export default function Home(): React.ReactElement {
  const { adminId, } = useAdminContext()
  if(!adminId) {
    
    return (
      <div className="min-h-screen  flex items-center justify-center bg-red-100 dark:bg-stone-900 transition-colors duration-300">
      <div className="text-center space-y-6">
        {/* Spinner */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-t-orange-500 border-stone-300 dark:border-stone-700 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-t-orange-500 border-stone-200 dark:border-stone-800 rounded-full animate-spin animate-reverse"></div>
          <div className="absolute inset-4 flex items-center justify-center">
            <span className="text-orange-500 text-2xl font-bold animate-pulse">AP</span>
          </div>
        </div>
  
        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-200">
          {adminId ? "Loading Admin Panel..." : "Verifying Access..."}
        </h2>
  
        {/* Subtext */}
        <p className="text-sm text-stone-600 dark:text-stone-400">
          {adminId ? "Preparing your dashboard" : "Please wait while we check your credentials"}
        </p>
  
        {/* Decorative Dots */}
        <div className="flex justify-center gap-2">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
        </div>
      </div>
    </div>
    )
  }
  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen bg-white dark:bg-red-950 bg-orange-200">
      {/* <Sidebar /> */}
      Hello Admin Panel
      <div className="flex items-center justify-center gap-5">
      </div>
    </div>
  )
}
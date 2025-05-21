"use client";
import { useAdminContext } from "@/app/Context/AdminProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SigninData {
  username: string;
  password: string;
}

export default function Signin(): React.ReactElement {
  const { signInAdmin,signOutAdmin } = useAdminContext();
  const [userData, setUserData] = useState<SigninData>({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
    setError(null);
  };

  useEffect(() => {
    signOutAdmin()
  },[])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!userData.username || !userData.password) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      const isSignedIn = await signInAdmin(userData.username, userData.password);
      if (!isSignedIn) {
        setError("Sign-in failed. Check your credentials.");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black px-4">
      <div className="bg-stone-50 dark:bg-stone-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4 transform transition-all hover:shadow-xl">
        <h1 className="text-3xl font-bold text-center text-stone-800 dark:text-orange-200 mb-4">
          Welcome Back!
        </h1>
        <p className="text-center text-stone-600 dark:text-stone-300 mb-6">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Field */}
          {error && (
            <div className="bg-orange-100 dark:bg-stone-700 border-l-4 border-orange-500 dark:border-orange-400 text-orange-700 dark:text-orange-300 p-4 rounded text-sm text-center">
              {error}
            </div>
          )}

          {/* Username Input */}
          <div className="flex flex-col">
            <label
              className="text-orange-600 dark:text-orange-400 font-medium mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="p-3 bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-400 dark:border-stone-600 rounded focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 outline-none transition-all"
              type="text"
              id="username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              placeholder="johndoe12"
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col">
            <label
              className="text-orange-600 dark:text-orange-400 font-medium mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="p-3 bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-400 dark:border-stoe-600 rounded focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 outline-none transition-all"
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="********"
              required
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="w-4 h-4 accent-orange-500 dark:accent-orange-400"
                />
                <label
                  htmlFor="showPassword"
                  className="text-orange-600 dark:text-orange-400 text-sm font-medium"
                >
                  Show Password
                </label>
              </div>
              <Link
                href="/admins/signup"
                className="font-medium underline text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-orange-500 dark:bg-orange-600 text-white p-3 font-bold rounded-lg hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors duration-300 ${
              isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
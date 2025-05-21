"use client";

import { useAdminContext } from "@/app/Context/AdminProvider";
import Link from "next/link";
import { useState } from "react";

interface SigninData {
  username: string;
  password: string;
  phone: number;
  email: string;
  signedUpWith: "phone" | "email";
}

export default function Signup(): React.ReactElement {
  const { signUpAdmin } = useAdminContext();
  const [userData, setUserData] = useState<SigninData>({
    username: "",
    password: "",
    phone: 0,
    email: "",
    signedUpWith: "email",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: name === "phone" ? Number(value) : value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      (userData.signedUpWith === "phone" && !userData.phone) ||
      (userData.signedUpWith === "email" && !userData.email) ||
      !userData.password ||
      !userData.username
    ) {
      setError("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      const isSignedUp = await signUpAdmin(userData);
      if (!isSignedUp) {
        setError("Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  function handleSignUpWithType(type: "phone" | "email") {
    setUserData((prev) => ({ ...prev, signedUpWith: type, phone: 0, email: "" }));
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 dark:from-stone-800 dark:via-stone-900 dark:to-black px-4">
      <div className="bg-stone-50 dark:bg-stone-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4 transform transition-all hover:shadow-xl">
        <h1 className="text-3xl font-bold text-center text-stone-800 dark:text-orange-200 mb-4">
          Welcome!
        </h1>
        <p className="text-center text-stone-600 dark:text-stone-300 mb-6">
          Sign up to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-orange-100 dark:bg-stone-700 border-l-4 border-orange-500 dark:border-orange-400 text-orange-700 dark:text-orange-300 p-4 rounded text-sm text-center">
              {error}
            </div>
          )}

          {/* Signup Method Toggle */}
          <div className="flex w-full justify-between gap-5">
            <button
              type="button"
              onClick={() => handleSignUpWithType("email")}
              className={`w-full border-b-2 pb-2 text-orange-600 dark:text-orange-400 font-medium transition-colors ${
                userData.signedUpWith === "email"
                  ? "border-orange-600 dark:border-orange-400"
                  : "border-stone-400 dark:border-stone-600"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              disabled
              onClick={() => handleSignUpWithType("phone")}
              className={`w-full border-b-2 pb-2 text-orange-600 dark:text-orange-400 font-medium transition-colors ${
                userData.signedUpWith === "phone"
                  ? "border-orange-600 dark:border-orange-400"
                  : "border-stone-400 dark:border-stone-600"
              } opacity-50 cursor-not-allowed`}
            >
              Phone
            </button>
          </div>

          {/* Email or Phone Input */}
          <div className="flex flex-col">
            <label className="text-orange-600 dark:text-orange-400 font-medium mb-2">
              {userData.signedUpWith === "phone" ? "Phone" : "Email"}
            </label>
            {userData.signedUpWith === "phone" ? (
              <input
                className="p-3 bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-400 dark:border-stone-600 rounded focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 outline-none transition-all"
                type="number"
                id="phone"
                name="phone"
                value={userData.phone || ""}
                onChange={handleChange}
                required
                placeholder="977123456789"
              />
            ) : (
              <input
                className="p-3 bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-400 dark:border-stone-600 rounded focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 outline-none transition-all"
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                required
                placeholder="johndoe@gmail.com"
              />
            )}
          </div>

          {/* Username Input */}
          <div className="flex flex-col">
            <label className="text-orange-600 dark:text-orange-400 font-medium mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="p-3 bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-400 dark:border-stone-600 rounded focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 outline-none transition-all"
              type="text"
              id="username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              required
              placeholder="johndoe"
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col">
            <label className="text-orange-600 dark:text-orange-400 font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="p-3 bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-400 dark:border-stone-600 rounded focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 outline-none transition-all"
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
                href="/admins/signin"
                className="font-medium underline text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
              >
                Sign In
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
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </main>
  );
}
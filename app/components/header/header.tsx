"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Heart, MessageCircle, User, LogOut } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<{ name?: string; photoUrl?: string }>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

  // Fetch user details from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("userDetails");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser({
          name: parsed.name || "User",
          photoUrl: parsed.photoUrl || "",
        });
      }
    } catch (error) {
      console.error("Error parsing userDetails from localStorage", error);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userDetails");
    setDropdownOpen(false);
    router.push("/auth"); // redirect to login page
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              DateIt
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/match"
              className={`flex flex-col items-center gap-1 transition group ${
                isActive("/match") ? "text-pink-600" : "text-gray-600 hover:text-pink-600"
              }`}
            >
              <Heart
                className={`w-5 h-5 group-hover:scale-110 transition ${
                  isActive("/match") ? "fill-current" : ""
                }`}
                fill={isActive("/match") ? "currentColor" : "none"}
              />
              <span className="text-xs font-medium">Find</span>
            </Link>

            <Link
              href="/my-matches"
              className={`flex flex-col items-center gap-1 transition group ${
                isActive("/my-matches") ? "text-pink-600" : "text-gray-600 hover:text-pink-600"
              }`}
            >
              <MessageCircle
                className={`w-5 h-5 group-hover:scale-110 transition ${
                  isActive("/my-matches") ? "text-pink-600" : ""
                }`}
              />
              <span className="text-xs font-medium">Matches</span>
            </Link>

            <Link
              href="/profile"
              className={`flex flex-col items-center gap-1 transition group ${
                isActive("/profile") ? "text-pink-600" : "text-gray-600 hover:text-pink-600"
              }`}
            >
              <User
                className={`w-5 h-5 group-hover:scale-110 transition ${
                  isActive("/profile") ? "text-pink-600" : ""
                }`}
              />
              <span className="text-xs font-medium">Profile</span>
            </Link>
          </nav>

          {/* User Info + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-3 focus:outline-none"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : "User"}
                </p>
                <p className="text-xs text-gray-500">Find your match</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-md border-2 border-pink-400 cursor-pointer">
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4 mr-2 text-pink-500" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

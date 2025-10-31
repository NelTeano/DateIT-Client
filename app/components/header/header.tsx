"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MessageCircle, User } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
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

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-800">John Doe</p>
              <p className="text-xs text-gray-500">Find your match</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

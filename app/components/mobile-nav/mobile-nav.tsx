"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MessageCircle, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden bg-white border-t border-gray-100 shadow-lg fixed bottom-0 left-0 right-0 z-50">
      <div className="flex justify-around items-center h-16 px-4">
        <Link
          href="/match"
          className={`flex flex-col items-center gap-1 transition group ${
            isActive("/match") ? "text-pink-600" : "text-gray-600 hover:text-pink-600"
          }`}
        >
          <Heart
            className="w-6 h-6 group-hover:scale-110 transition"
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
            className="w-6 h-6 group-hover:scale-110 transition"
            fill={isActive("/my-matches") ? "currentColor" : "none"}
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
            className="w-6 h-6 group-hover:scale-110 transition"
            fill={isActive("/profile") ? "currentColor" : "none"}
          />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}

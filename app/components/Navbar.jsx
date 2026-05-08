"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/70 backdrop-blur-md border-b border-black/8 shadow-xs"
          : "bg-white border-b border-black/6"
      }`}
    >
      <nav className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-12">
          <Link href="/">
            <Image src="/dripx.svg" alt="DripX Logo" width={100} height={32} />
          </Link>

          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            <li>
              <Link
                href="/software"
                className="text-[#1c1c1d] text-[15px] font-normal hover:text-gray-500 transition"
              >
                Software
              </Link>
            </li>

            <li>
              <Link
                href="/resources"
                className="text-[15px] font-medium transition"
                style={{
                  background:
                    "linear-gradient(90deg, #ee7aee 0%, #fe9b85 100%)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Resources
              </Link>
            </li>

            <li>
              <Link
                href="/pricing"
                className="text-[#1c1c1d] text-[15px] font-normal hover:text-gray-500 transition"
              >
                Pricing
              </Link>
            </li>

            <li>
              <Link
                href="/partners"
                className="text-[#1c1c1d] text-[15px] font-normal hover:text-gray-500 transition"
              >
                Partners
              </Link>
            </li>
          </ul>
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-[#1c1c1d] text-[15px] hover:text-gray-500 transition px-4 py-2"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="text-white text-[15px] px-6 py-2.5 rounded-full hover:opacity-90 transition"
            style={{
              background: "linear-gradient(to right, #7f64f5, #ae79f8)",
            }}
          >
            Get Started Free
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

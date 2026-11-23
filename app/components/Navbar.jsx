"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-gray-200/80 shadow-2xs"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <nav className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo + Desktop Nav Links */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Image
              src="/dripx.svg"
              alt="DripX Logo"
              width={105}
              height={32}
              priority
              className="h-7 w-auto object-contain"
            />
          </Link>

          <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="text-gray-700 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-full border border-gray-200/90 shadow-2xs hover:bg-gray-50 active:scale-95 transition cursor-pointer"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-bold px-5 py-2 text-sm shadow-sm active:scale-95 transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Get Started Free</span>
            <ArrowRight size={14} className="stroke-[2.5]" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/login"
            className="text-xs font-semibold text-gray-700 px-3 py-1.5 rounded-full border border-gray-200/90 hover:bg-gray-50 transition cursor-pointer"
          >
            Sign In
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="w-9 h-9 rounded-full border border-gray-200/90 flex items-center justify-center text-gray-700 hover:bg-gray-50 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Medium Screen Hamburger Button (when sm is visible but md is hidden) */}
        <div className="hidden sm:flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="w-9 h-9 rounded-full border border-gray-200/90 flex items-center justify-center text-gray-700 hover:bg-gray-50 shadow-2xs active:scale-95 transition cursor-pointer ml-1"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Stateful Responsive Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="flex flex-col gap-1 list-none m-0 p-0">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-base font-medium transition cursor-pointer ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full border border-gray-200/90 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs active:scale-95 transition cursor-pointer"
            >
              Sign In to Your Workspace
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full bg-indigo-400 hover:bg-indigo-500 text-white text-sm font-bold shadow-sm active:scale-95 transition cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

import Link from "next/link";
import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  const socials = [
    { icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: FaXTwitter, href: "https://x.com", label: "X (Twitter)" },
    { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
    { icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
    { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  ];

  return (
    <footer className="border-t border-gray-200/90 bg-white mt-24">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Column 1: Brand & Status */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
            <div>
              <Link href="/" className="inline-block cursor-pointer">
                <Image
                  src="/dripx.svg"
                  alt="DripX"
                  width={110}
                  height={32}
                  className="h-7 w-auto object-contain"
                />
              </Link>

              <p className="text-sm text-gray-500 mt-3.5 leading-relaxed">
                Cloud-native LinkedIn and cold email outreach engine. Run multi-channel drip sequences 24/7 with dedicated residential IPs and zero ban risk.
              </p>

              {/* Live System Status Pill */}
              <div className="mt-5">
                <div className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-medium inline-flex items-center gap-2 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>All Systems Operational</span>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 mt-6 flex-wrap">
              {socials.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={i}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    title={item.label}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200/90 text-gray-500 transition-all duration-200 hover:text-indigo-400 hover:border-indigo-300 hover:bg-indigo-50/50 shadow-2xs cursor-pointer"
                  >
                    <Icon size={14} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 tracking-wide uppercase mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-600 list-none m-0 p-0">
              <li>
                <Link href="/features" className="hover:text-indigo-600 transition">
                  Features Overview
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-indigo-600 transition">
                  Pricing & Plans
                </Link>
              </li>
              <li>
                <Link href="/#timeline" className="hover:text-indigo-600 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#comparison" className="hover:text-indigo-600 transition">
                  Cloud vs Extension
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-indigo-600 transition">
                  Product FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 tracking-wide uppercase mb-4">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-600 list-none m-0 p-0">
              <li>
                <span className="text-gray-700 font-medium">Solo Founders & SMBs</span>
              </li>
              <li>
                <span className="text-gray-700 font-medium">B2B Sales Teams</span>
              </li>
              <li>
                <span className="text-gray-700 font-medium">Lead Gen Agencies</span>
              </li>
              <li>
                <span className="text-gray-700 font-medium">Enterprise Outreach</span>
              </li>
              <li>
                <Link href="/contact?topic=enterprise" className="hover:text-indigo-600 transition text-indigo-600 font-medium inline-block mt-1">
                  Request Custom Plan →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 tracking-wide uppercase mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-600 list-none m-0 p-0">
              <li>
                <Link href="/about" className="hover:text-indigo-600 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-600 transition">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/about#security" className="hover:text-indigo-600 transition">
                  Security & Compliance
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="hover:text-indigo-600 transition">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link href="/contact?topic=partnership" className="hover:text-indigo-600 transition">
                  Partnerships
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 tracking-wide uppercase mb-4">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-600 list-none m-0 p-0">
              <li>
                <Link href="/privacy" className="hover:text-indigo-600 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy#gdpr" className="hover:text-indigo-600 transition">
                  GDPR & Erasure Rights
                </Link>
              </li>
              <li>
                <Link href="/terms#acceptable-use" className="hover:text-indigo-600 transition">
                  Acceptable Use Policy
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 mt-1">
                  SOC-2 Type II In Progress
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} DripX Inc. All rights reserved. Built with cloud-native reliability.
          </p>

          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900 transition">
              Privacy
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/terms" className="hover:text-gray-900 transition">
              Terms
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/contact" className="hover:text-gray-900 transition">
              Help Desk
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

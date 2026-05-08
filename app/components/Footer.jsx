import Link from "next/link";
import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const socials = [
    { icon: FaFacebookF, href: "#", label: "Facebook" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
    { icon: FaXTwitter, href: "#", label: "X (Twitter)" },
    { icon: FaYoutube, href: "#", label: "YouTube" },
    { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="border-t border-black/10 bg-white mt-24">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* BRAND */}
          <div className="lg:col-span-2">
            <Image src="/dripx.svg" alt="DripX" width={110} height={32} />

            <p className="text-sm text-gray-500 mt-4 max-w-sm leading-relaxed">
              Automate your LinkedIn outreach and scale your pipeline with
              powerful automation and smart workflows.
            </p>

            {/* SOCIAL */}
            <div className="flex items-center gap-3 mt-6 flex-wrap">
              {socials.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={i}
                    href={item.href}
                    title={item.label}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-black/10 text-gray-600 transition-all duration-300 hover:text-white hover:border-transparent hover:scale-105 hover:bg-gradient-to-r from-[#7f64f5] to-[#ae79f8]"
                  >
                    <Icon size={16} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* PRODUCT */}
          <div>
            <h4 className="text-sm font-semibold text-[#1c1c1d] mb-4">
              Product
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/software" className="hover:text-black">
                  Software
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-black">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-black">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="text-sm font-semibold text-[#1c1c1d] mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-black">
                  About
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-black">
                  Partners
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* RESOURCES */}
          <div>
            <h4 className="text-sm font-semibold text-[#1c1c1d] mb-4">
              Resources
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/blog" className="hover:text-black">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-black">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-black">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-black/10 mt-14 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()} DripX. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-black">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-black">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-black">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

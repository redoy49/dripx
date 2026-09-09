"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid email or password");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef2ff]">
      {/* soft grid background */}
      <div
        className="
          absolute inset-0
          bg-[linear-gradient(rgba(148,163,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,255,0.08)_1px,transparent_1px)]
          bg-[size:40px_40px]
        "
      />

      {/* blur gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[10%] h-[420px] w-[420px] rounded-full bg-blue-300/40 blur-[120px]" />

        <div className="absolute right-[-10%] top-[20%] h-[420px] w-[420px] rounded-full bg-purple-300/40 blur-[120px]" />

        <div className="absolute left-1/2 top-[-10%] h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-cyan-200/30 blur-[120px]" />
      </div>

      {/* login card */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/95 p-6 shadow-[0_10px_60px_rgba(80,80,180,.12)] backdrop-blur-xl sm:p-8">
          {/* heading */}
          <h1
            className="text-center text-3xl font-bold"
            style={{
              background: "linear-gradient(90deg, #ee7aee 0%, #fe9b85 100%)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Welcome to DripX
          </h1>

          <p className="mt-2 text-center text-sm text-gray-500">
            Don&apos;t have an account?
            <a
              href="/register"
              className="
                ml-1 bg-gradient-to-r from-[#7f64f5] to-[#ae79f8]
                bg-clip-text font-medium text-transparent
                transition hover:opacity-80 hover:underline
              "
            >
              Sign up for free
            </a>
          </p>

          {/* social buttons */}
          <div className="mt-8 space-y-3">
            <button
              type="button"
              className="
                flex h-12 w-full cursor-pointer items-center justify-center gap-3
                rounded-lg border border-gray-200 bg-white px-4
                text-sm font-medium text-gray-600 transition
                hover:border-indigo-200 hover:shadow-sm
                focus:outline-none focus:ring-4 focus:ring-indigo-100
              "
            >
              <div className="flex h-8 w-8 items-center justify-center">
                <GoogleIcon />
              </div>

              <span>Log in with Google</span>
            </button>

            <button
              type="button"
              className="
                flex h-12 w-full cursor-pointer items-center justify-center gap-3
                rounded-lg border border-gray-200 bg-white px-4
                text-sm font-medium text-gray-600 transition
                hover:border-indigo-200 hover:shadow-sm
                focus:outline-none focus:ring-4 focus:ring-indigo-100
              "
            >
              <div className="flex h-8 w-8 items-center justify-center">
                <AppleIcon />
              </div>

              <span>Log in with Apple</span>
            </button>
          </div>

          {/* divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />

            <p className="text-sm text-gray-400">or continue with email</p>

            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* form */}
          <form onSubmit={handleLogin} className="space-y-3">
            {/* email */}
            <input
              type="email"
              autoComplete="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                h-12 w-full rounded-lg border border-gray-200 px-4
                text-sm outline-none transition
                focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100
              "
            />

            {/* password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  h-12 w-full rounded-lg border border-gray-200
                  px-4 pr-12 text-sm outline-none transition
                  focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute right-4 top-1/2 flex -translate-y-1/2
                  cursor-pointer items-center justify-center
                  text-gray-400 transition hover:text-gray-700
                  focus:outline-none
                "
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {/* login button */}
            <button
              type="submit"
              disabled={loading}
              className="
                h-12 w-full cursor-pointer rounded-lg
                bg-gradient-to-r from-[#7f64f5] to-[#ae79f8]
                px-4 text-sm font-semibold text-white transition
                hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed
                focus:outline-none focus:ring-4 focus:ring-indigo-100
              "
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* footer */}
          <div className="mt-5 text-center">
            <a
              href="#"
              className="
                bg-gradient-to-r from-[#7f64f5] to-[#ae79f8]
                bg-clip-text text-sm font-medium text-transparent
                transition hover:opacity-80 hover:underline
              "
            >
              Reset password
            </a>

            <p className="mt-4 text-xs leading-relaxed text-gray-400">
              By logging in, you agree to DripX&apos;s{" "}
              <a href="#" className="font-medium text-gray-700 underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="#" className="font-medium text-gray-700 underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* Google Icon */
function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="h-5 w-5"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />

      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />

      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />

      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

/* Apple Icon */
function AppleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      fill="currentColor"
      className="h-5 w-5 text-black"
    >
      <path d="M44.527344 34.75C43.449219 37.144531 42.929688 38.214844 41.542969 40.328125C39.601563 43.28125 36.863281 46.96875 33.480469 46.992188C30.46875 47.019531 29.691406 45.027344 25.601563 45.0625C21.515625 45.082031 20.664063 47.03125 17.648438 47C14.261719 46.96875 11.671875 43.648438 9.730469 40.699219C4.300781 32.429688 3.726563 22.734375 7.082031 17.578125C9.457031 13.921875 13.210938 11.773438 16.738281 11.773438C20.332031 11.773438 22.589844 13.746094 25.558594 13.746094C28.441406 13.746094 30.195313 11.769531 34.351563 11.769531C37.492188 11.769531 40.8125 13.480469 43.1875 16.433594C35.421875 20.691406 36.683594 31.78125 44.527344 34.75ZM31.195313 8.46875C32.707031 6.527344 33.855469 3.789063 33.4375 1C30.972656 1.167969 28.089844 2.742188 26.40625 4.78125C24.878906 6.640625 23.613281 9.398438 24.105469 12.066406C26.796875 12.152344 29.582031 10.546875 31.195313 8.46875Z" />
    </svg>
  );
}

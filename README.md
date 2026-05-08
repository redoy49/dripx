app/
├── layout.jsx                       ← Root (html + body + font + metadata)
├── (public)/
│   ├── layout.jsx                   ← Navbar + Footer
│   └── page.jsx                     ← /
├── (auth)/
│   ├── layout.jsx                   ← Clean centered layout
│   ├── login/
│   │   └── page.jsx                 ← /login
│   └── register/
│       └── page.jsx                 ← /register
└── (dashboard)/
    └── dashboard/
        ├── layout.jsx               ← Sidebar + Header
        ├── page.jsx                 ← /dashboard
        ├── settings/
        │   └── page.jsx             ← /dashboard/settings
        └── analytics/
            └── page.jsx             ← /dashboard/analytics

<!-- app/layout.jsx | Only html + body + font + metadata Never put Navbar/Footer here -->
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}

<!-- app/(public)/layout.jsx | Only public pages get Navbar + Footer -->
export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

<!-- app/(auth)/layout.jsx | Clean centered, no distractions -->
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {children}
    </div>
  );
}

<!-- app/(dashboard)/dashboard/layout.jsx | Sidebar + Header only -->
export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
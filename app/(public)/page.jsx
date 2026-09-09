import Link from "next/link";

export default function Home() {
  return (
    <div className="pt-28">
      {/* HERO SECTION */}
      <section className="max-w-384 mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-[#1c1c1d] leading-tight">
          Automate Your LinkedIn Outreach <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7f64f5] to-[#ae79f8]">
            and Grow Faster
          </span>
        </h1>
        <p className="mt-6 text-gray-600 text-lg max-w-2xl mx-auto">
          DripX helps you automate connection requests, messages, and follow-ups
          so you can focus on closing deals instead of manual work.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="px-6 py-3 rounded-full text-white"
            style={{
              background: "linear-gradient(to right, #7f64f5, #ae79f8)",
            }}
          >
            Get Started Free
          </Link>
          <Link
            href="/pricing"
            className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-384 mx-auto px-4 sm:px-6 lg:px-8 mt-24 grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Automated Messaging",
            desc: "Send personalized messages automatically without manual effort.",
          },
          {
            title: "Smart Lead Targeting",
            desc: "Find the right prospects based on your ideal customer profile.",
          },
          {
            title: "Follow-up Sequences",
            desc: "Never miss a lead with automated follow-up workflows.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-black/10 bg-white shadow-sm"
          >
            <h3 className="text-lg font-semibold text-[#1c1c1d]">
              {item.title}
            </h3>
            <p className="text-gray-600 mt-2 text-sm">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mt-24 text-center bg-gray-50 py-20">
        <h2 className="text-3xl font-bold text-[#1c1c1d]">
          Ready to scale your outreach?
        </h2>
        <p className="text-gray-600 mt-3">
          Start automating your LinkedIn today with DripX.
        </p>
        <Link
          href="/register"
          className="inline-block mt-6 px-8 py-3 rounded-full text-white"
          style={{ background: "linear-gradient(to right, #7f64f5, #ae79f8)" }}
        >
          Get Started Free
        </Link>
      </section>
    </div>
  );
}

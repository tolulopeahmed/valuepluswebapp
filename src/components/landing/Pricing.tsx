const academyPricing = [
  {
    name: "Free Preview",
    price: "₦0",
    usd: "$0",
    note: "Complete your first module. No payment required.",
    perks: [
      "The Foundations of Publishing",
      "Tools of the Trade",
      "Understanding the Publishing Process",
      "From Manuscript to Market",
      "XP & Streaks",
      "Community Access",
    ],
  },
  {
    name: "Full Course",
    price: "₦100,000",
    usd: "$100",
    note: "Dive Right In. Get the A—Z Publishing Education.",
    featured: true,
    perks: [
      "All 6 Modules",
      "Earn 15% Payment on all Referrals",
      "Internship: Work with ValuePlus Publishing",
      "From Manuscript to Market (For Real)",
      "Publish Your First Book at the End",
      "Get a Professional Certificate",
    ],
  },
];

function VerifiedCheckIcon() {
  return (
    <span
      className="pricing-verified-icon"
      aria-hidden="true"
      style={{ marginBottom: -10 }}
    >
      <svg
        viewBox="0 0 24 24"
        width="34"
        height="34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <path
          className="verified-bg-spin"
          fill="#1d9bf0"
          d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
        />
        <path
          fill="white"
          d="M9.5 16.5 6 13l1.42-1.42 2.08 2.09 7.08-7.09L18 8l-8.5 8.5z"
        />
      </svg>
    </span>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="bg-vp-ink px-4 py-20 md:py-28">
      <div className="mx-auto max-w-7xl text-center">
        <p className="eyebrow">Academy plans</p>

        <h2 className="display-heading section-heading mx-auto text-white">
          Start Free. <span className="text-[#fbbf24]">Pay After</span>
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/50">
          Pay in Naira or Dollars. No commitment to start.
        </p>

        <div className="mx-auto mt-10 grid max-w-3xl gap-6 md:grid-cols-2">
          {academyPricing.map((plan) => (
            <div
              key={plan.name}
              className={plan.featured ? "price-card featured" : "price-card"}
              style={{
                minHeight: "420px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                color: "grey",
              }}
            >
              {plan.featured && <div className="popular">MOST POPULAR</div>}

              <div>
                <div className="pricing-plan-title">
                  {plan.featured && <VerifiedCheckIcon />}

                  <h3
                    style={{
                      color: "white",
                      fontSize: 27,
                      marginBottom: -10,
                      fontFamily: "PP Telegraf",
                    }}
                  >
                    {plan.name}
                  </h3>
                </div>

                <p
                  className="note"
                  style={{ color: "grey", fontSize: 14, marginTop: 20 }}
                >
                  {plan.note}
                </p>

                <h4 style={{ fontSize: 55, marginTop: -15 }}>{plan.price}</h4>

                <span>{plan.usd} USD</span>

                <ul className="mt-6 space-y-3 text-left text-xs text-white/60">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <span
                        className="text-vp-accent"
                        style={{ color: "#fbbf24" }}
                      >
                        ✓
                      </span>

                      <span style={{ fontSize: 15, color: "darkgrey" }}>
                        {perk}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="/pricing"
                className="mt-8 block text-[0.72rem] font-black uppercase tracking-widest"
              >
                GET STARTED
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

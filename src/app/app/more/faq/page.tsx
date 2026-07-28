"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Title from "../../../../components/Title";
import Subtitle from "../../../../components/Subtitle";
import SectionLabel from "../../../../components/SectionLabel";
import { useAppShell } from "../../AppShellContext";

// Same admin line used elsewhere (Sidebar's "Chat Admin" row, Settings'
// "Message Admin" row, the public site's footer FAB).
const ADMIN_WHATSAPP_URL = "https://wa.me/2349024312689";

interface Faq {
  q: string;
  a: string;
}

const GENERAL_FAQS: Faq[] = [
  {
    q: "What is ValuePlus Publishing?",
    a: "A platform for two kinds of people — authors who want their book professionally published, and learners who want to learn the A–Z of publishing and eventually publish their own titles. You can do either, or both, from the same account.",
  },
  {
    q: "How do I switch between Learner and Publisher mode?",
    a: "Use the mode switch in Settings, or the header. Your dashboard, navigation, and accent color all update to match, and the choice is saved to your account so it's remembered the next time you log in.",
  },
  {
    q: "How does the referral program work?",
    a: "Share your account email with a friend. When they sign up entering your email as their referrer, you earn 5% of their service cost once their project payment is confirmed. Track every referral and what you've earned on the Refer & Earn page.",
  },
  {
    q: "How do payments work? Is my payment information safe?",
    a: "ValuePlus doesn't collect or store your card details. For now, you pay directly (e.g. bank transfer) and mark the transaction as paid in your dashboard, or our team confirms it once received — a full in-app payment gateway is on the way.",
  },
  {
    q: "Who do I contact if I need help?",
    a: "Tap \"Message Admin\" in the More tab to chat with our support team directly on WhatsApp — or use the button below.",
  },
];

const LEARNER_FAQS: Faq[] = [
  {
    q: "What does the \"Learn the A–Z of Publishing\" course cover?",
    a: "Six modules taking you from the fundamentals through design, proofreading, printing, and distribution, ending in a capstone project — built to take you from never having published a book to being ready to publish your own.",
  },
  {
    q: "Is the course free?",
    a: "Yes — the core Learn the A–Z of Publishing course is free to enroll in and complete.",
  },
  {
    q: "How do I earn XP, and what does it do?",
    a: "You earn XP by completing lessons in the Academy. Your total XP determines your level, shown at the top of your dashboard — it's a running record of your progress, not something that unlocks or expires.",
  },
  {
    q: "What are streaks?",
    a: "A streak counts the consecutive days you've been active in the Academy. Keep learning daily to build (and protect) yours — your current and longest streak are both shown on your dashboard.",
  },
  {
    q: "Can I start publishing my own book after learning?",
    a: "Absolutely. Switch to Publisher mode any time from Settings, then use \"Get a Quote\" to start your own book's publishing journey — everything you learn carries straight over.",
  },
];

const PUBLISHER_FAQS: Faq[] = [
  {
    q: "How do I get a quote for my book?",
    a: "Tap \"Add New Title\" on the Publish page (or use Get a Quote from the homepage), fill in your manuscript details and the services you want, and you'll get an instant estimate plus an emailed summary.",
  },
  {
    q: "What's the difference between service cost and print cost?",
    a: "Service cost covers everything with a fixed, known price up front — ISBN, cover design, editing, and similar. Print cost (paper type, lamination, binding, etc.) is priced by hand once we review your manuscript, since it depends on your actual print run.",
  },
  {
    q: "How do I pay for my quote?",
    a: "A pending transaction appears in your dashboard the moment you submit a quote. Pay via your preferred method, then mark it as paid — you can self-confirm once you've made the transfer, or our team confirms it for you.",
  },
  {
    q: "How long does publishing take?",
    a: "It varies by project scope, but most titles move from manuscript to market within about a month once your quote is confirmed and your materials are received.",
  },
  {
    q: "What does \"Pending\" mean on my book?",
    a: "Your book is created the moment you submit a quote request — \"Pending\" just means it's awaiting your confirmed payment and our team's review before moving into production.",
  },
  {
    q: "How do I withdraw my royalties?",
    a: "Add your bank account under Settings, then use \"Withdraw royalties\" from Quick Actions once you have a positive balance.",
  },
  {
    q: "Can I publish more than one book?",
    a: "Yes — use \"Add New Title\" on the Publish page any time to start a new title alongside your existing ones.",
  },
];

function FaqAccordionItem({
  faq,
  open,
  onToggle,
}: {
  faq: Faq;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: open ? "rgba(var(--vp-accent-rgb),0.35)" : "rgba(255,255,255,0.08)",
      }}
    >
      {/* styled-jsx only scopes to the component that declares the
          <style jsx> tag, not to sibling/parent components in the same
          file — this has to live here, in the component that actually
          renders .faq-collapse, not up in FaqPage. */}
      <style jsx>{`
        .faq-collapse {
          display: grid;
          transition: grid-template-rows 0.3s ease;
        }
      `}</style>

      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-[0.88rem] font-bold text-white">{faq.q}</span>
        <ChevronDown
          size={16}
          className="shrink-0 transition-transform duration-300"
          style={{
            color: "rgb(var(--vp-accent-rgb))",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* CSS-only accordion: grid-template-rows 0fr -> 1fr, no JS height
          measurement needed, and it degrades gracefully either way. */}
      <div
        className="faq-collapse"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-4 text-[0.8rem] leading-relaxed text-white/55">
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  );
}

function FaqSection({
  label,
  faqs,
  openQuestion,
  onToggle,
}: {
  label: string;
  faqs: Faq[];
  openQuestion: string | null;
  onToggle: (q: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>{label}</SectionLabel>
      <div className="flex flex-col gap-2.5">
        {faqs.map((faq) => (
          <FaqAccordionItem
            key={faq.q}
            faq={faq}
            open={openQuestion === faq.q}
            onToggle={() => onToggle(faq.q)}
          />
        ))}
      </div>
    </div>
  );
}

export default function FaqPage() {
  const { mode } = useAppShell();
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const modeFaqs = mode === "publisher" ? PUBLISHER_FAQS : LEARNER_FAQS;
  const modeLabel = mode === "publisher" ? "For publishers" : "For learners";

  const handleToggle = (q: string) => {
    setOpenQuestion((current) => (current === q ? null : q));
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="vp-card-in mb-6">
        <Title className="block">FAQs</Title>
        <Subtitle>
          Answers to the questions we get asked the most —{" "}
          {mode === "publisher" ? "as a publisher" : "as a learner"}.
        </Subtitle>
      </div>

      <div className="vp-card-in flex flex-col gap-6" style={{ animationDelay: "40ms" }}>
        <FaqSection
          label={modeLabel}
          faqs={modeFaqs}
          openQuestion={openQuestion}
          onToggle={handleToggle}
        />
        <FaqSection
          label="General"
          faqs={GENERAL_FAQS}
          openQuestion={openQuestion}
          onToggle={handleToggle}
        />
      </div>

      <div
        className="vp-card-in mt-6 flex flex-col items-center gap-3 rounded-2xl border p-5 text-center"
        style={{
          animationDelay: "80ms",
          borderColor: "rgba(var(--vp-accent-rgb),0.2)",
          background: "rgba(var(--vp-accent-rgb),0.06)",
        }}
      >
        <p className="text-[0.85rem] font-bold text-white">
          Still have questions?
        </p>
        <p className="text-[0.76rem] text-white/50">
          Our team is a message away.
        </p>
        <a
          href={ADMIN_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 rounded-full px-5 py-2.5 text-[0.78rem] font-black uppercase tracking-wide"
          style={{
            background: "rgb(var(--vp-accent-rgb))",
            color: "#171100",
          }}
        >
          Message Admin
        </a>
      </div>
    </div>
  );
}

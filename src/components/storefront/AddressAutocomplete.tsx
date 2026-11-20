"use client";

// Delivery address with suggestions as you type (Google Places via our
// server, Nigeria only). Like Bolt: picking one locks it in as a card
// (exact map point included, which the courier uses), with Change to
// search again - no half-edited picks. If suggestions aren't available
// it behaves like a plain textarea.

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api";

export interface PickedPlace {
  lat: number;
  lng: number;
}

interface Suggestion {
  place_id: string;
  main: string;
  secondary: string;
}

const newSession = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()).slice(2);

export default function AddressAutocomplete({
  value,
  onChange,
  onPick,
  picked,
  placeholder,
  className,
}: {
  value: string;
  onChange: (text: string) => void;
  /** Called with the exact location when a suggestion is chosen, or null when the text is edited by hand. */
  onPick: (place: PickedPlace | null) => void;
  /** The current pick, if any: the address then shows as a locked card. */
  picked?: PickedPlace | null;
  placeholder: string;
  className: string;
}) {
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const session = useRef(newSession());
  const skipNext = useRef(false);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const text = value.trim();
    if (text.length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch<{ available: boolean; results: Suggestion[] }>(
          `/storefront/address/suggest/?q=${encodeURIComponent(text)}&session=${session.current}`,
          { skipAuth: true, silent: true },
        );
        if (!cancelled) {
          setResults(res.results);
          setActive(-1);
        }
      } catch {
        if (!cancelled) setResults([]);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value]);

  const pick = async (s: Suggestion) => {
    setOpen(false);
    setResults([]);
    try {
      const place = await apiFetch<{ address: string; lat: number; lng: number }>(
        `/storefront/address/place/${encodeURIComponent(s.place_id)}/?session=${session.current}`,
        { skipAuth: true },
      );
      skipNext.current = true;
      onChange(place.address || [s.main, s.secondary].filter(Boolean).join(", "));
      onPick(place.lat != null && place.lng != null ? { lat: place.lat, lng: place.lng } : null);
    } catch {
      skipNext.current = true;
      onChange([s.main, s.secondary].filter(Boolean).join(", "));
      onPick(null);
    }
    session.current = newSession(); // a pick ends the billing session
  };

  if (picked && value) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-[#c2410c]/30 bg-[#c2410c]/[0.05] px-3.5 py-3">
        <MapPin size={16} className="mt-0.5 shrink-0 text-[#c2410c]" />
        <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-[#14181f]">{value}</p>
        <button
          type="button"
          onClick={() => {
            skipNext.current = true;
            onChange("");
            onPick(null);
            setOpen(true);
          }}
          className="shrink-0 text-xs font-bold text-[#c2410c] underline underline-offset-2"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onPick(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!open || results.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            pick(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        rows={2}
        autoComplete="off"
        className={className}
      />
      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">
          {results.map((s, i) => (
            <li key={s.place_id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
                className={`flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left ${i === active ? "bg-black/[0.05]" : "hover:bg-black/[0.03]"}`}
              >
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#c2410c]" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#14181f]">{s.main}</span>
                  {s.secondary && <span className="block truncate text-xs text-black/50">{s.secondary}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";

type ServiceType =
  | "fixed"
  | "perPage"
  | "perWord"
  | "perUnit"
  | "free"
  | "quote";

type ServiceGroup =
  | "Essentials"
  | "Design"
  | "Print Finish"
  | "Digital"
  | "Special";

type ServiceOption = {
  id: string;
  label: string;
  priceLabel: string;
  amount?: number;
  type: ServiceType;
  group: ServiceGroup;
  requiresPages?: boolean;
  requiresWords?: boolean;
  requiresCopies?: boolean;
  requiresChapters?: boolean;
  autoReason?: string;
};

type QuoteEstimateDetail = {
  formattedTotal: string;
  hasSelection: boolean;
  estimateInView: boolean;
};

type QuoteWindow = Window & {
  __valuePlusQuoteEstimate?: QuoteEstimateDetail;
};

const serviceOptions: ServiceOption[] = [
  {
    id: "isbn",
    label: "ISBN with Barcode",
    priceLabel: "₦30,000",
    amount: 30000,
    type: "fixed",
    group: "Essentials",
  },
  {
    id: "proofreading",
    label: "Proofreading",
    priceLabel: "₦3.5/word",
    amount: 3.5,
    type: "perWord",
    group: "Essentials",
    requiresWords: true,
  },
  {
    id: "editing",
    label: "Developmental Editing",
    priceLabel: "₦4.5/word",
    amount: 4.5,
    type: "perWord",
    group: "Essentials",
    requiresWords: true,
  },
  {
    id: "cover",
    label: "Cover Design",
    priceLabel: "₦40,000",
    amount: 40000,
    type: "fixed",
    group: "Design",
  },
  {
    id: "layout",
    label: "Inside Design / Layout",
    priceLabel: "₦450/page",
    amount: 450,
    type: "perPage",
    group: "Design",
    requiresPages: true,
  },
  {
    id: "illustrations",
    label: "Graphic Illustrations",
    priceLabel: "₦4,500/chapter",
    amount: 4500,
    type: "perUnit",
    group: "Design",
    requiresChapters: true,
  },
  {
    id: "cream",
    label: "Cream Paper",
    priceLabel: "Custom quote",
    type: "quote",
    group: "Print Finish",
  },
  {
    id: "white",
    label: "White Paper",
    priceLabel: "Custom quote",
    type: "quote",
    group: "Print Finish",
  },
  {
    id: "colour-print",
    label: "Colour Print",
    priceLabel: "Custom quote",
    type: "quote",
    group: "Print Finish",
  },
  {
    id: "matt",
    label: "Matt Lamination",
    priceLabel: "Custom quote",
    type: "quote",
    group: "Print Finish",
  },
  {
    id: "gloss",
    label: "Gloss Lamination",
    priceLabel: "Custom quote",
    type: "quote",
    group: "Print Finish",
  },
  {
    id: "paperback",
    label: "Paper Back",
    priceLabel: "Custom quote",
    type: "quote",
    group: "Print Finish",
  },
  {
    id: "hardback",
    label: "Hard Back (Hard Cover)",
    priceLabel: "Custom quote",
    type: "quote",
    group: "Print Finish",
  },
  {
    id: "jacket",
    label: "Hard Cover with Jacket",
    priceLabel: "Custom quote",
    type: "quote",
    group: "Print Finish",
  },
  {
    id: "nylon",
    label: "Nylon Seals",
    priceLabel: "₦45/copy",
    amount: 45,
    type: "perUnit",
    group: "Print Finish",
    requiresCopies: true,
    autoReason: "Auto with print finish",
  },
  {
    id: "sewing",
    label: "Sewing",
    priceLabel: "Auto-added for 250+ pages",
    type: "quote",
    group: "Print Finish",
    autoReason: "Custom quote",
  },
  {
    id: "embossing",
    label: "Embossing",
    priceLabel: "Custom quote",
    type: "quote",
    group: "Print Finish",
  },
  {
    id: "debossing",
    label: "Debossing",
    priceLabel: "Custom quote",
    type: "quote",
    group: "Print Finish",
  },
  {
    id: "ebook-pdf",
    label: "Ebook PDF",
    priceLabel: "Free bonus",
    type: "free",
    group: "Digital",
    autoReason: "Auto with layout",
  },
  {
    id: "ebook-epub",
    label: "Ebook EPUB",
    priceLabel: "₦500/page",
    amount: 500,
    type: "perPage",
    group: "Digital",
    requiresPages: true,
  },
  {
    id: "mockups",
    label: "Mockups",
    priceLabel: "Free bonus",
    type: "free",
    group: "Digital",
    autoReason: "Auto with cover design",
  },
  {
    id: "selar-ebook",
    label: "Selar Setup (Ebook)",
    priceLabel: "₦35,000/setup",
    amount: 35000,
    type: "fixed",
    group: "Digital",
  },
  {
    id: "selar-hardcopy",
    label: "Selar Setup (Hardcopy)",
    priceLabel: "₦35,000/setup",
    amount: 35000,
    type: "fixed",
    group: "Digital",
  },
  {
    id: "amazon-kdp-paperback",
    label: "Amazon KDP (Paperback)",
    priceLabel: "₦35,000/setup",
    amount: 35000,
    type: "fixed",
    group: "Digital",
  },
  {
    id: "amazon-kindle-ebook",
    label: "Amazon Kindle (Ebook)",
    priceLabel: "₦35,000/setup",
    amount: 35000,
    type: "fixed",
    group: "Digital",
  },
  {
    id: "amazon-hardback",
    label: "Amazon Hardback",
    priceLabel: "₦35,000/setup",
    amount: 35000,
    type: "fixed",
    group: "Digital",
  },
  {
    id: "trailer",
    label: "Book Trailer Video",
    priceLabel: "₦70,000",
    amount: 70000,
    type: "fixed",
    group: "Special",
  },
  {
    id: "transcription",
    label: "Audio/Podcast Transcription",
    priceLabel: "₦1,000/min",
    amount: 1000,
    type: "perUnit",
    group: "Special",
  },
  {
    id: "translation-french",
    label: "Translation to the French Language",
    priceLabel: "₦10/word",
    amount: 10,
    type: "perWord",
    group: "Special",
    requiresWords: true,
  },
  {
    id: "typing",
    label: "Typing of Manuscript",
    priceLabel: "₦10/word",
    amount: 10,
    type: "perWord",
    group: "Special",
    requiresWords: true,
  },
];

const groups: ServiceGroup[] = [
  "Essentials",
  "Design",
  "Print Finish",
  "Digital",
  "Special",
];

const printFinishIds = [
  "cream",
  "white",
  "colour-print",
  "matt",
  "gloss",
  "paperback",
  "hardback",
  "jacket",
  "sewing",
  "embossing",
  "debossing",
];

const bookSizes = [
  "A5 (5.83 x 8.27 in)",
  "A4 (8.27 x 11.69 in)",
  "A6 (4.13 x 5.83 in)",
  "A3 (11.69 x 16.54 in)",
  "A5 Slim (5.25 x 8.0 in)",
  "6 x 9 (Trimmed A4)",
  "5 x 8 (Amazon)",
];

const bookCategories = [
  "Personal Development / Success",
  "Faith / Christian",
  "Business / Leadership",
  "Children's Book",
  "Academic / Research",
  "Memoir / Biography",
  "Fiction",
  "Other",
];

const printVolumeOptions = [
  {
    title: "Sample Prints",
    range: "Below 50 copies",
    note: "High unit cost",
  },
  {
    title: "POD Prints",
    range: "50–499 copies",
    note: "Fair unit cost",
    popular: true,
  },
  {
    title: "Mini Bulk",
    range: "500–999 copies",
    note: "Lower unit cost",
  },
  {
    title: "Bulk Print",
    range: "Above 1000 copies",
    note: "Lowest unit cost",
  },
];

const publishingPricing = [
  {
    name: "POD Starter",
    price: "₦20,000",
    note: "For authors who want to print from as low as 50 copies.",
  },
  {
    name: "POD Prolific",
    price: "₦66,500",
    note: "For authors working on multiple books or regular small-batch prints.",
  },
  {
    name: "Corporate POD",
    price: "₦100,000",
    note: "For prolific authors who want to reduce POD costs and keep publishing momentum.",
    featured: true,
  },
  {
    name: "Unlimited365",
    price: "₦120,000",
    note: "Unlimited publishing support for one year.",
  },
];

function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

function toNumber(value: string) {
  return Number(onlyNumbers(value)) || 0;
}

function formatNaira(value: number) {
  return `₦${Math.round(value).toLocaleString()}`;
}

function sortIds(ids: string[]) {
  const set = new Set(ids);

  return serviceOptions
    .filter((service) => set.has(service.id))
    .map((service) => service.id);
}

function uniqueSortedIds(ids: string[]) {
  return sortIds(Array.from(new Set(ids)));
}

function getServiceCost({
  item,
  pages,
  words,
  copies,
  chapters,
}: {
  item: ServiceOption;
  pages: number;
  words: number;
  copies: number;
  chapters: number;
}) {
  if (!item.amount) return 0;

  if (item.type === "fixed") return item.amount;
  if (item.type === "perPage") return item.amount * pages;
  if (item.type === "perWord") return item.amount * words;

  if (item.type === "perUnit") {
    if (item.id === "nylon") return item.amount * copies;
    if (item.id === "illustrations") return item.amount * chapters;

    return item.amount;
  }

  return 0;
}

// showExtras/onToggleExtras are optional so the public /getQuote page's
// <GetQuote /> (no props) renders byte-identical to before — the Print
// Quantity Guide + POD Plans section always shows there. The app's
// "Add New Title" page passes both, to tuck that section behind a
// "View more" toggle that sits right after the request button instead
// of an arbitrary height-based cutoff partway through the form.
export default function GetQuote({
  showExtras = true,
  onToggleExtras,
}: {
  showExtras?: boolean;
  onToggleExtras?: () => void;
} = {}) {
  const estimateCardRef = useRef<HTMLDivElement | null>(null);
  const pagesInputRef = useRef<HTMLInputElement | null>(null);
  const wordsInputRef = useRef<HTMLInputElement | null>(null);
  const copiesInputRef = useRef<HTMLInputElement | null>(null);
  const chaptersInputRef = useRef<HTMLInputElement | null>(null);
  const displayTotalRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [bookTitle, setBookTitle] = useState("");
  const [category, setCategory] = useState("");
  const [bookSize, setBookSize] = useState("");
  const [copies, setCopies] = useState("");
  const [pages, setPages] = useState("");
  const [words, setWords] = useState("");
  const [chapters, setChapters] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [manualSelectedIds, setManualSelectedIds] = useState<string[]>([]);
  const [wordAnchorId, setWordAnchorId] = useState<string | null>(null);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [estimateInView, setEstimateInView] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [completedFields, setCompletedFields] = useState<string[]>([]);

  const pageCount = toNumber(pages);
  const wordCount = toNumber(words);
  const copyCount = toNumber(copies);
  const chapterCount = toNumber(chapters);

  const hasManualPrintFinish = useMemo(() => {
    return manualSelectedIds.some((id) => printFinishIds.includes(id));
  }, [manualSelectedIds]);

  const effectiveSelectedIds = useMemo(() => {
    const next = [...manualSelectedIds];

    if (manualSelectedIds.includes("layout") && !next.includes("ebook-pdf")) {
      next.push("ebook-pdf");
    }

    if (manualSelectedIds.includes("cover") && !next.includes("mockups")) {
      next.push("mockups");
    }

    if (pageCount > 250 && !next.includes("sewing")) {
      next.push("sewing");
    }

    const hasAnyPrintFinish =
      hasManualPrintFinish || pageCount > 250 || next.includes("sewing");

    if (hasAnyPrintFinish && !next.includes("nylon")) {
      next.push("nylon");
    }

    return uniqueSortedIds(next);
  }, [hasManualPrintFinish, manualSelectedIds, pageCount]);

  const selectedSet = useMemo(
    () => new Set(effectiveSelectedIds),
    [effectiveSelectedIds],
  );

  const selectedServices = useMemo(() => {
    return serviceOptions.filter((service) => selectedSet.has(service.id));
  }, [selectedSet]);

  const firstSelectedWordServiceId = useMemo(() => {
    return (
      serviceOptions.find(
        (service) => service.requiresWords && selectedSet.has(service.id),
      )?.id || null
    );
  }, [selectedSet]);

  const activeWordAnchorId = useMemo(() => {
    if (wordAnchorId) {
      const anchorService = serviceOptions.find(
        (service) => service.id === wordAnchorId,
      );

      if (anchorService?.requiresWords && selectedSet.has(wordAnchorId)) {
        return wordAnchorId;
      }
    }

    return firstSelectedWordServiceId;
  }, [firstSelectedWordServiceId, selectedSet, wordAnchorId]);

  const estimate = useMemo(() => {
    return selectedServices.reduce((total, item) => {
      return (
        total +
        getServiceCost({
          item,
          pages: pageCount,
          words: wordCount,
          copies: copyCount,
          chapters: chapterCount,
        })
      );
    }, 0);
  }, [chapterCount, copyCount, pageCount, selectedServices, wordCount]);

  const quoteCount = selectedServices.filter(
    (item) => item.type === "quote",
  ).length;

  const selectedServiceNames = selectedServices.map((service) => service.label);

  useEffect(() => {
    const node = estimateCardRef.current;

    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        window.requestAnimationFrame(() => {
          setEstimateInView(
            entry.isIntersecting && entry.intersectionRatio > 0.35,
          );
        });
      },
      {
        threshold: [0, 0.2, 0.35, 0.7, 1],
        rootMargin: "-72px 0px 0px 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const formattedTotal = formatNaira(displayTotal);

    const detail: QuoteEstimateDetail = {
      formattedTotal,
      hasSelection: effectiveSelectedIds.length > 0,
      estimateInView,
    };

    (window as QuoteWindow).__valuePlusQuoteEstimate = detail;

    window.dispatchEvent(
      new CustomEvent("valueplus:quote-estimate", {
        detail,
      }),
    );
  }, [displayTotal, effectiveSelectedIds.length, estimateInView]);

  useEffect(() => {
    return () => {
      const detail: QuoteEstimateDetail = {
        formattedTotal: "₦0",
        hasSelection: false,
        estimateInView: true,
      };

      (window as QuoteWindow).__valuePlusQuoteEstimate = detail;

      window.dispatchEvent(
        new CustomEvent("valueplus:quote-estimate", {
          detail,
        }),
      );
    };
  }, []);

  useEffect(() => {
    const start = displayTotalRef.current;
    const end = estimate;

    if (start === end) return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const duration = 480;
    const startTime = performance.now();

    function animate(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = start + (end - start) * eased;

      displayTotalRef.current = nextValue;
      setDisplayTotal(nextValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        displayTotalRef.current = end;
        setDisplayTotal(end);
        animationRef.current = null;
      }
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [estimate]);

  function updateNumeric(
    event: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
  ) {
    setter(onlyNumbers(event.target.value));
  }

  function markFieldComplete(fieldId: string, value: string) {
    const hasValue = value.trim().length > 0;

    setFocusedField(null);

    setCompletedFields((current) => {
      const alreadyCompleted = current.includes(fieldId);

      if (hasValue && !alreadyCompleted) {
        return [...current, fieldId];
      }

      if (!hasValue && alreadyCompleted) {
        return current.filter((id) => id !== fieldId);
      }

      return current;
    });
  }

  function shouldShowFieldTag(fieldId: string, value: string) {
    return (
      value.trim().length > 0 &&
      completedFields.includes(fieldId) &&
      focusedField !== fieldId
    );
  }

  function getFieldClassName(fieldId: string, value: string, extra = "") {
    const base = `vpgq-field${extra ? ` ${extra}` : ""}`;

    if (shouldShowFieldTag(fieldId, value)) {
      return `${base} vpgq-field-complete`;
    }

    return base;
  }

  function focusInput(ref: RefObject<HTMLInputElement | null>) {
    window.setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      window.setTimeout(() => {
        ref.current?.focus({ preventScroll: true });
      }, 280);
    }, 40);
  }

  function playSelectionSound() {
    if (typeof window === "undefined") return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return;

      const context = audioContextRef.current || new AudioContextClass();
      audioContextRef.current = context;

      if (context.state === "suspended") {
        void context.resume();
      }

      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(660, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        880,
        context.currentTime + 0.045,
      );

      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.035,
        context.currentTime + 0.012,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + 0.12,
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.13);
    } catch {
      // Sound is optional.
    }
  }

  function isAutoOnlySelected(serviceId: string) {
    if (manualSelectedIds.includes(serviceId)) return false;

    if (serviceId === "ebook-pdf" && manualSelectedIds.includes("layout")) {
      return true;
    }

    if (serviceId === "mockups" && manualSelectedIds.includes("cover")) {
      return true;
    }

    if (serviceId === "sewing" && pageCount > 250) {
      return true;
    }

    if (serviceId === "nylon" && (hasManualPrintFinish || pageCount > 250)) {
      return true;
    }

    return false;
  }

  function toggleService(serviceId: string) {
    const service = serviceOptions.find((item) => item.id === serviceId);

    if (!service) return;

    const alreadySelected = manualSelectedIds.includes(serviceId);

    if (!alreadySelected && service.requiresPages && pageCount === 0) {
      focusInput(pagesInputRef);
    }

    if (!alreadySelected && service.requiresWords) {
      if (!activeWordAnchorId) {
        setWordAnchorId(serviceId);
      }

      if (wordCount === 0) {
        window.setTimeout(() => focusInput(wordsInputRef), 160);
      }
    }

    if (!alreadySelected && service.requiresChapters && chapterCount === 0) {
      window.setTimeout(() => focusInput(chaptersInputRef), 160);
    }

    if (!alreadySelected && service.id === "nylon" && copyCount === 0) {
      focusInput(copiesInputRef);
    }

    if (isAutoOnlySelected(serviceId)) {
      return;
    }

    setManualSelectedIds((current) => {
      const currentlySelected = current.includes(serviceId);
      let next = [...current];

      if (currentlySelected) {
        next = next.filter((id) => id !== serviceId);
        return uniqueSortedIds(next);
      }

      if (service.amount) {
        playSelectionSound();
      }

      if (serviceId === "editing") {
        next = next.filter((id) => id !== "proofreading");
      }

      if (serviceId === "proofreading") {
        next = next.filter((id) => id !== "editing");
      }

      next.push(serviceId);

      return uniqueSortedIds(next);
    });
  }

  function getMeta(item: ServiceOption) {
    const isSelected = selectedSet.has(item.id);
    const cost = getServiceCost({
      item,
      pages: pageCount,
      words: wordCount,
      copies: copyCount,
      chapters: chapterCount,
    });

    if (isSelected && cost > 0) return formatNaira(cost);

    if (isSelected && item.type === "perWord" && wordCount === 0) {
      return "Enter words";
    }

    if (isSelected && item.type === "perPage" && pageCount === 0) {
      return "Enter pages";
    }

    if (isSelected && item.id === "illustrations" && chapterCount === 0) {
      return "Enter chapters";
    }

    if (isSelected && item.id === "nylon" && copyCount === 0) {
      return "Enter copies";
    }

    if (item.type === "free") return "Free bonus";
    if (item.autoReason) return item.autoReason;
    if (item.type === "quote") return "Custom quote";

    return item.priceLabel;
  }

  function getMetaClassName(item: ServiceOption) {
    const isSelected = selectedSet.has(item.id);
    const cost = getServiceCost({
      item,
      pages: pageCount,
      words: wordCount,
      copies: copyCount,
      chapters: chapterCount,
    });

    if (isSelected && cost > 0) return "vpgq-chip-meta vpgq-chip-meta-cost";
    if (item.type === "free") return "vpgq-chip-meta vpgq-chip-meta-free";

    return "vpgq-chip-meta";
  }

  function renderWordCountField(serviceId: string) {
    if (activeWordAnchorId !== serviceId) return null;

    return (
      <div className="vpgq-inline-field-shell">
        <span className="vpgq-inline-word-label">Estimated word count</span>

        <div
          className={getFieldClassName(
            "words",
            words,
            "vpgq-inline-input-wrap",
          )}
        >
          <input
            ref={wordsInputRef}
            value={words}
            onChange={(event) => updateNumeric(event, setWords)}
            onFocus={() => setFocusedField("words")}
            onBlur={() => markFieldComplete("words", words)}
            placeholder="Enter word count"
            inputMode="numeric"
            pattern="[0-9]*"
          />

          {shouldShowFieldTag("words", words) && (
            <span className="vpgq-field-tag">Words</span>
          )}
        </div>
      </div>
    );
  }

  function renderIllustrationCountField(serviceId: string) {
    if (serviceId !== "illustrations" || !selectedSet.has("illustrations")) {
      return null;
    }

    return (
      <div className="vpgq-inline-field-shell">
        <span className="vpgq-inline-word-label">Number of chapters</span>

        <div
          className={getFieldClassName(
            "illustrations",
            chapters,
            "vpgq-inline-input-wrap vpgq-inline-input-wrap-long",
          )}
        >
          <input
            ref={chaptersInputRef}
            value={chapters}
            onChange={(event) => updateNumeric(event, setChapters)}
            onFocus={() => setFocusedField("illustrations")}
            onBlur={() => markFieldComplete("illustrations", chapters)}
            placeholder="Enter number of chapters"
            inputMode="numeric"
            pattern="[0-9]*"
          />

          {shouldShowFieldTag("illustrations", chapters) && (
            <span className="vpgq-field-tag">Illustrations</span>
          )}
        </div>
      </div>
    );
  }

  function sendToWhatsApp() {
    const message = [
      "Hello ValuePlus, I would like to request the full cost for my book.",
      "",
      `Book Title: ${bookTitle || "Not provided"}`,
      `Category: ${category || "Not provided"}`,
      `Book Size: ${bookSize || "Not provided"}`,
      `Estimated Pages: ${pages || "Not provided"}`,
      `Estimated Words: ${words || "Not provided"}`,
      `Chapters / Illustrations: ${chapters || "Not provided"}`,
      `Copies: ${copies || "Not provided"}`,
      "",
      `Selected Services: ${
        selectedServiceNames.length > 0
          ? selectedServiceNames.join(", ")
          : "None selected"
      }`,
      `Estimated Total: ${formatNaira(estimate)}`,
      quoteCount > 0
        ? `Custom Quote Items: ${quoteCount} item${quoteCount > 1 ? "s" : ""}`
        : "",
      "",
      `Name: ${fullName || "Not provided"}`,
      `WhatsApp: ${whatsapp || "Not provided"}`,
      `Email: ${email || "Not provided"}`,
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappNumber = "234";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .vpgq-root,
            .vpgq-root * {
              box-sizing: border-box;
            }

            .vpgq-root {
              position: relative;
              z-index: 1;
              isolation: isolate;
              padding-bottom: 2rem;
            }

            .vpgq-card {
              border-radius: 1.45rem;
              padding: 1rem;
              /* Was #0a0f1a — nearly the same near-black navy as the page
                 background behind it, so the card barely read as a
                 container at all. Matches GlassCard's lighter slate now
                 (the "card on dark page" tone already used everywhere
                 else in the app), for a real, consistent contrast. */
              background:
                linear-gradient(
                  180deg,
                  rgba(255,255,255,.07),
                  rgba(255,255,255,.025)
                ),
                linear-gradient(180deg, #2F3A5E 0%, #2D375A 55%, #29325A 100%);
              border: 1px solid rgba(255,255,255,.14);
              box-shadow: 0 35px 110px rgba(0,0,0,.42);
            }

            .vpgq-estimate-card {
              position: relative;
              z-index: 1;
              overflow: hidden;
              margin-bottom: 1rem;
              border-radius: 1.25rem;
              border: 1px solid rgba(74,222,128,.28);
              background:
                radial-gradient(circle at 12% 8%, rgba(74,222,128,.2), transparent 34%),
                linear-gradient(145deg, rgba(255,255,255,.09), rgba(255,255,255,.035)),
                rgba(8,13,22,.92);
              padding: 1rem;
              backdrop-filter: blur(22px) saturate(1.35);
              -webkit-backdrop-filter: blur(22px) saturate(1.35);
              box-shadow:
                0 18px 48px rgba(0,0,0,.32),
                inset 0 1px 0 rgba(255,255,255,.08);
            }

            .vpgq-estimate-card::before {
              content: "";
              position: absolute;
              inset-inline: 1rem;
              top: 0;
              height: 1px;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
              pointer-events: none;
            }

            .vpgq-estimate-label {
              color: rgba(255,255,255,.45);
              font-size: .58rem;
              font-weight: 950;
              letter-spacing: .22em;
              text-transform: uppercase;
            }

            .vpgq-estimate-amount {
              margin-top: .35rem;
              color: #4ade80;
              font-size: clamp(2rem, 7vw, 3.2rem);
              font-weight: 950;
              letter-spacing: -.055em;
              line-height: .95;
            }

            .vpgq-services-panel {
              margin-top: 1rem;
              border-radius: 1.25rem;
              padding: 1rem;
              border: 1px solid rgba(var(--vp-accent-rgb), .28);
              background:
                radial-gradient(circle at 10% 0%, rgba(var(--vp-accent-rgb), .18), transparent 34%),
                linear-gradient(180deg, rgba(var(--vp-accent-rgb), .052), rgba(0,0,0,.19)),
                rgba(0,0,0,.2);
              box-shadow:
                inset 0 1px 0 rgba(255,255,255,.06),
                0 18px 45px rgba(0,0,0,.18);
            }

            .vpgq-sub-panel {
              border-radius: 1rem;
              padding: .85rem;
              border: 1px solid rgba(255,255,255,.08);
              background: rgba(0,0,0,.12);
            }

            .vpgq-sub-panel + .vpgq-sub-panel {
              margin-top: .85rem;
            }

            .vpgq-sub-panel-contact {
              background:
                radial-gradient(circle at 92% 0%, rgba(255,255,255,.07), transparent 32%),
                rgba(255,255,255,.025);
            }

            .vpgq-label {
              display: block;
              margin: 0 0 .48rem;
              color: rgba(255,255,255,.42);
              font-size: .56rem;
              font-weight: 950;
              letter-spacing: .2em;
              text-transform: uppercase;
            }

            .vpgq-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: .55rem;
            }

            .vpgq-wide {
              grid-column: 1 / -1;
            }

            .vpgq-field {
              position: relative;
            }

            .vpgq-field input {
              padding-right: 5rem !important;
            }

            .vpgq-field-select select {
              padding-right: 6.4rem !important;
            }

            .vpgq-field-complete input,
            .vpgq-field-complete select {
              background-color: #fdf6e7 !important;
              border-color: rgba(var(--vp-accent-rgb), .45) !important;
              color: #14181f !important;
              box-shadow:
                inset 0 1px 0 rgba(255,255,255,.6),
                0 8px 24px rgba(0,0,0,.14);
            }

            .vpgq-field-complete input::placeholder {
              color: rgba(20,24,31,.4);
            }

            .vpgq-field-tag {
              position: absolute;
              right: .55rem;
              top: 50%;
              transform: translateY(-50%);
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: 999px;
              border: 1px solid rgba(var(--vp-accent-rgb), .35);
              background: rgba(20,20,30,.88);
              padding: .18rem .42rem;
              color: var(--vp-accent);
              font-size: .48rem;
              font-weight: 950;
              letter-spacing: .12em;
              text-transform: uppercase;
              pointer-events: none;
              white-space: nowrap;
            }

            .vpgq-field-select .vpgq-field-tag {
              right: 2.75rem;
            }

            /* Main fields (text/select inputs) are light with dark text —
               selection fields (.vpgq-chip, further down) stay as they
               were, untouched. */
            .vpgq-card input,
            .vpgq-card select {
              width: 100%;
              min-height: 2.85rem;
              border: 1px solid rgba(15,20,32,.14);
              border-radius: .8rem;
              background-color: #f4f5f7;
              padding: .75rem .9rem;
              color: #14181f;
              font-size: .86rem;
              outline: none;
              touch-action: manipulation;
            }

            .vpgq-card input::placeholder {
              color: rgba(20,24,31,.42);
            }

            .vpgq-card select {
              appearance: none;
              -webkit-appearance: none;
              color: #14181f;
              background-color: #f4f5f7;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%2314181f' stroke-opacity='0.6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
              background-repeat: no-repeat;
              background-size: 1rem 1rem;
              background-position: right 1.05rem center;
              padding-right: 3rem;
            }

            .vpgq-card select option {
              background: #f4f5f7;
              color: #14181f;
            }

            .vpgq-card input:focus,
            .vpgq-card select:focus {
              border-color: rgba(var(--vp-accent-rgb), .55);
              box-shadow: 0 0 0 3px rgba(var(--vp-accent-rgb), .16);
            }

            .vpgq-head {
              margin: 0 0 .85rem;
              color: rgba(255,255,255,.78);
              font-size: .6rem;
              font-weight: 950;
              letter-spacing: .22em;
              text-transform: uppercase;
            }

            .vpgq-group {
              margin-bottom: .9rem;
            }

            .vpgq-group:last-child {
              margin-bottom: 0;
            }

            .vpgq-group-title {
              margin-bottom: .45rem;
              color: var(--vp-accent);
              font-size: .56rem;
              font-weight: 950;
              letter-spacing: .17em;
              text-transform: uppercase;
            }

            .vpgq-chips {
              display: flex;
              flex-wrap: wrap;
              gap: .42rem;
            }

            .vpgq-chip-wrap {
              display: contents;
            }

            .vpgq-chip {
              appearance: none;
              -webkit-appearance: none;
              display: inline-flex;
              align-items: center;
              gap: .45rem;
              border: 1px solid rgba(255,255,255,.095);
              border-radius: 999px;
              background: rgba(255,255,255,.04);
              padding: .5rem .75rem;
              color: rgba(255,255,255,.62);
              font-size: .75rem;
              font-weight: 850;
              text-align: left;
              cursor: pointer;
              user-select: none;
              -webkit-user-select: none;
              touch-action: manipulation;
              -webkit-tap-highlight-color: transparent;
            }

            .vpgq-chip:active {
              transform: scale(.985);
            }

            .vpgq-chip-active {
              border-color: var(--vp-accent);
              background: var(--vp-accent);
              color: #171100;
              box-shadow:
                0 0 0 1px rgba(var(--vp-accent-rgb), .2),
                0 4px 16px rgba(var(--vp-accent-rgb), .22);
            }

            .vpgq-chip-free {
              border-color: rgba(52, 211, 153, .22);
              background: rgba(52, 211, 153, .055);
              color: rgba(209, 250, 229, .9);
            }

            .vpgq-chip-free.vpgq-chip-active {
              border-color: #34d399;
              background: #34d399;
              color: #022c22;
              box-shadow:
                0 0 0 1px rgba(52, 211, 153, .2),
                0 4px 16px rgba(52, 211, 153, .22);
            }

            .vpgq-check {
              display: grid;
              place-items: center;
              width: 1.15rem;
              height: 1.15rem;
              min-width: 1.15rem;
              border-radius: 999px;
              border: 1.5px solid rgba(255,255,255,.2);
              background: rgba(255,255,255,.04);
            }

            .vpgq-check-icon {
              width: .7rem;
              height: .7rem;
              color: transparent;
            }

            .vpgq-chip-active .vpgq-check {
              border-color: transparent;
              background: rgba(23, 17, 0, .14);
            }

            .vpgq-chip-active .vpgq-check-icon {
              color: #171100;
            }

            .vpgq-chip-free .vpgq-check {
              border-color: rgba(52, 211, 153, .42);
            }

            .vpgq-chip-free.vpgq-chip-active .vpgq-check {
              border-color: transparent;
              background: rgba(2, 44, 34, .14);
            }

            .vpgq-chip-free.vpgq-chip-active .vpgq-check-icon {
              color: #022c22;
            }

            .vpgq-chip-meta {
              color: rgba(255,255,255,.3);
              font-size: .58rem;
              font-weight: 800;
            }

            .vpgq-chip-active .vpgq-chip-meta {
              color: #171100;
            }

            .vpgq-chip-meta-cost {
              display: inline-flex;
              align-items: center;
              border-radius: 999px;
              border: 1px solid rgba(var(--vp-accent-rgb), .34);
              background: rgba(var(--vp-accent-rgb), .12);
              padding: .12rem .38rem;
              color: var(--vp-accent) !important;
              font-weight: 950;
            }

            .vpgq-chip-active .vpgq-chip-meta-cost {
              border-color: rgba(23, 17, 0, .28);
              background: rgba(23, 17, 0, .1);
              color: #171100 !important;
            }

            .vpgq-chip-free .vpgq-chip-meta,
            .vpgq-chip-meta-free {
              color: #34d399 !important;
            }

            .vpgq-chip-free.vpgq-chip-active .vpgq-chip-meta,
            .vpgq-chip-free.vpgq-chip-active .vpgq-chip-meta-free {
              color: #022c22 !important;
            }

            .vpgq-inline-field-shell {
              flex-basis: 100%;
              width: 100%;
              margin: .08rem 0 .32rem;
              border-radius: .95rem;
              border: 1px solid rgba(var(--vp-accent-rgb), .26);
              background:
                radial-gradient(circle at 8% 0%, rgba(var(--vp-accent-rgb), .12), transparent 32%),
                rgba(255,255,255,.035);
              padding: .65rem;
            }

            .vpgq-inline-input-wrap {
              position: relative;
            }

            .vpgq-inline-input-wrap input {
              padding-right: 5rem !important;
            }

            .vpgq-inline-input-wrap-long input {
              padding-right: 8.6rem !important;
            }

            .vpgq-inline-input-wrap .vpgq-field-tag {
              right: .55rem;
              top: 50%;
            }

            .vpgq-inline-word-label {
              display: block;
              margin-bottom: .42rem;
              color: rgba(255,255,255,.42);
              font-size: .52rem;
              font-weight: 950;
              letter-spacing: .18em;
              text-transform: uppercase;
            }

            .vpgq-submit {
              margin-top: 1rem;
              width: 100%;
              border: none;
              border-radius: 1rem;
              background: var(--vp-accent);
              padding: .9rem 1rem;
              color: #171100;
              cursor: pointer;
              box-shadow:
                0 14px 44px rgba(var(--vp-accent-rgb), .22),
                0 8px 22px rgba(0,0,0,.28);
            }

            .vpgq-submit-title {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: .36rem;
              white-space: nowrap;
              font-size: .78rem;
              font-weight: 950;
              letter-spacing: .02em;
              text-transform: uppercase;
              line-height: 1;
            }

            .vpgq-submit-total {
              display: inline-flex;
              align-items: center;
              border-radius: 999px;
              background: #16a34a !important;
              padding: .2rem .5rem;
              color: #ffffff !important;
              font-size: .84rem;
              font-weight: 950;
              letter-spacing: -.03em;
            }

            .vpgq-volume-card,
            .vpgq-pod-card {
              margin-top: 5rem;
              border-radius: 1.4rem;
              border: 1px solid rgba(255,255,255,.1);
              background: rgba(255,255,255,.04);
              padding: 1rem;
            }

            .vpgq-volume-grid,
            .vpgq-pod-grid {
              margin-top: 1rem;
              display: grid;
              gap: .75rem;
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }

            .vpgq-volume-item,
            .vpgq-price-card {
              position: relative;
              overflow: hidden;
              border-radius: 1rem;
              border: 1px solid rgba(255,255,255,.1);
              background: rgba(0,0,0,.2);
              padding: 1rem;
            }

            .vpgq-volume-item::before {
              content: "";
              position: absolute;
              inset: 0;
              background: radial-gradient(circle at 15% 0%, rgba(var(--vp-accent-rgb), .1), transparent 38%);
              pointer-events: none;
            }

            .vpgq-volume-popular {
              border-color: rgba(var(--vp-accent-rgb), .4);
              background: rgba(var(--vp-accent-rgb), .07);
            }

            .vpgq-volume-tag {
              display: inline-flex;
              align-items: center;
              border-radius: 999px;
              border: 1px solid rgba(var(--vp-accent-rgb), .28);
              background: rgba(var(--vp-accent-rgb), .1);
              padding: .22rem .5rem;
              color: var(--vp-accent);
              font-size: .5rem;
              font-weight: 950;
              letter-spacing: .12em;
              text-transform: uppercase;
            }

            .vpgq-volume-item h3,
            .vpgq-price-card h3 {
              position: relative;
              color: white;
              font-size: .9rem;
              font-weight: 950;
            }

            .vpgq-volume-range {
              position: relative;
              margin-top: .45rem;
              color: rgba(255,255,255,.62);
              font-size: .72rem;
              font-weight: 850;
            }

            .vpgq-volume-note,
            .vpgq-price-card p {
              position: relative;
              margin-top: .45rem;
              color: rgba(255,255,255,.48);
              font-size: .72rem;
              line-height: 1.45;
            }

            .vpgq-price-card h4 {
              margin-top: .75rem;
              color: var(--vp-accent);
              font-size: 1.2rem;
              font-weight: 950;
            }

            .vpgq-featured {
              border-color: rgba(var(--vp-accent-rgb), .35);
              background: rgba(var(--vp-accent-rgb), .07);
            }

            @media (max-width: 767px) {
              .vpgq-root {
                padding-bottom: 3rem;
              }

              .vpgq-card {
                padding: .85rem;
              }

              .vpgq-estimate-card {
                padding: .75rem .85rem;
                border-radius: 1rem;
              }

              .vpgq-estimate-amount {
                font-size: clamp(1.8rem, 9.4vw, 2.4rem);
              }

              .vpgq-services-panel {
                padding: .78rem;
                border-radius: 1.05rem;
              }

              .vpgq-grid {
                grid-template-columns: 1fr;
              }

              .vpgq-wide {
                grid-column: auto;
              }

              .vpgq-field input {
                padding-right: 4.8rem !important;
              }

              .vpgq-field-select select {
                padding-right: 6.2rem !important;
              }

              .vpgq-field-tag {
                font-size: .46rem;
                padding: .17rem .38rem;
              }

              .vpgq-inline-input-wrap input {
                padding-right: 4.8rem !important;
              }

              .vpgq-inline-input-wrap-long input {
                padding-right: 8.45rem !important;
              }

              .vpgq-chips {
                flex-direction: column;
              }

              .vpgq-chip-wrap {
                display: block;
              }

              .vpgq-chip {
                width: 100%;
                min-height: 44px;
                border-radius: .88rem;
                padding: .65rem .8rem;
              }

              .vpgq-submit {
                position: static;
                margin-top: 1rem;
              }

              .vpgq-submit-title {
                gap: .25rem;
                font-size: clamp(.55rem, 2.75vw, .68rem);
              }

              .vpgq-submit-total {
                padding: .18rem .38rem;
                font-size: clamp(.58rem, 2.9vw, .72rem);
              }

              .vpgq-volume-grid,
              .vpgq-pod-grid {
                grid-template-columns: 1fr;
              }
            }
          `,
        }}
      />

      <section className="vpgq-root quote-section-dark px-4 py-14 md:py-20">
        <div
          className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start"
          style={{ marginTop: -20 }}
        >
          <div className="lg:sticky lg:top-28" style={{ marginTop: -20 }}>
            <h2 className="display-heading section-heading text-white">
              Enter manuscript details.{" "}
              <span className="text-[#fbbf24]">Get estimate cost.</span>
            </h2>
          </div>

          <div className="vpgq-card">
            <div ref={estimateCardRef} className="vpgq-estimate-card">
              <p className="vpgq-estimate-label">Estimated Amount</p>

              <div className="vpgq-estimate-amount">
                {formatNaira(displayTotal)}
              </div>
            </div>

            <div className="vpgq-sub-panel">
              <span className="vpgq-label" style={{ color: "#60c8ff" }}>
                Manuscript details
              </span>

                <div className="vpgq-grid">
                  <div
                    className={getFieldClassName(
                      "title",
                      bookTitle,
                      "vpgq-wide",
                    )}
                  >
                    <input
                      value={bookTitle}
                      onChange={(event) => setBookTitle(event.target.value)}
                      onFocus={() => setFocusedField("title")}
                      onBlur={() => markFieldComplete("title", bookTitle)}
                      placeholder="Book title"
                      autoComplete="off"
                    />

                    {shouldShowFieldTag("title", bookTitle) && (
                      <span className="vpgq-field-tag">Title</span>
                    )}
                  </div>

                  <div
                    className={getFieldClassName(
                      "category",
                      category,
                      "vpgq-field-select vpgq-wide",
                    )}
                  >
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      onFocus={() => setFocusedField("category")}
                      onBlur={() => markFieldComplete("category", category)}
                    >
                      <option value="">Book category</option>

                      {bookCategories.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>

                    {shouldShowFieldTag("category", category) && (
                      <span className="vpgq-field-tag">Category</span>
                    )}
                  </div>

                  <div
                    className={getFieldClassName(
                      "size",
                      bookSize,
                      "vpgq-field-select",
                    )}
                  >
                    <select
                      value={bookSize}
                      onChange={(event) => setBookSize(event.target.value)}
                      onFocus={() => setFocusedField("size")}
                      onBlur={() => markFieldComplete("size", bookSize)}
                    >
                      {bookSizes.map((size) => (
                        <option key={size}>{size}</option>
                      ))}
                    </select>

                    {shouldShowFieldTag("size", bookSize) && (
                      <span className="vpgq-field-tag">Book Size</span>
                    )}
                  </div>

                  <div className={getFieldClassName("pages", pages)}>
                    <input
                      ref={pagesInputRef}
                      value={pages}
                      onChange={(event) => updateNumeric(event, setPages)}
                      onFocus={() => setFocusedField("pages")}
                      onBlur={() => markFieldComplete("pages", pages)}
                      placeholder="Estimated number of pages"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />

                    {shouldShowFieldTag("pages", pages) && (
                      <span className="vpgq-field-tag">Pages</span>
                    )}
                  </div>

                  <div className={getFieldClassName("copies", copies)}>
                    <input
                      ref={copiesInputRef}
                      value={copies}
                      onChange={(event) => updateNumeric(event, setCopies)}
                      onFocus={() => setFocusedField("copies")}
                      onBlur={() => markFieldComplete("copies", copies)}
                      placeholder="Total copies needed"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />

                    {shouldShowFieldTag("copies", copies) && (
                      <span className="vpgq-field-tag">Copies</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="vpgq-sub-panel vpgq-sub-panel-contact">
                <span className="vpgq-label" style={{ color: "#60c8ff" }}>
                  Your Details
                </span>

                <div className="vpgq-grid">
                  <div className={getFieldClassName("name", fullName)}>
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => markFieldComplete("name", fullName)}
                      placeholder="Your full name"
                      autoComplete="name"
                    />

                    {shouldShowFieldTag("name", fullName) && (
                      <span className="vpgq-field-tag">Name</span>
                    )}
                  </div>

                  <div className={getFieldClassName("number", whatsapp)}>
                    <input
                      value={whatsapp}
                      onChange={(event) => setWhatsapp(event.target.value)}
                      onFocus={() => setFocusedField("number")}
                      onBlur={() => markFieldComplete("number", whatsapp)}
                      placeholder="WhatsApp number"
                      inputMode="tel"
                    />

                    {shouldShowFieldTag("number", whatsapp) && (
                      <span className="vpgq-field-tag">WhatsApp</span>
                    )}
                  </div>

                  <div
                    className={getFieldClassName("email", email, "vpgq-wide")}
                  >
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => markFieldComplete("email", email)}
                      placeholder="Email address"
                      type="email"
                      autoComplete="email"
                    />

                    {shouldShowFieldTag("email", email) && (
                      <span className="vpgq-field-tag">Email</span>
                    )}
                  </div>
                </div>
              </div>

            <div className="vpgq-services-panel">
              <p className="vpgq-head">Other Services for Your Book</p>

              {groups.map((group) => {
                const items = serviceOptions.filter(
                  (item) => item.group === group,
                );

                return (
                  <div key={group} className="vpgq-group">
                    <p className="vpgq-group-title">{group}</p>

                    <div className="vpgq-chips">
                      {items.map((item) => {
                        const isSelected = selectedSet.has(item.id);
                        const meta = getMeta(item);
                        const isFree = item.type === "free";

                        return (
                          <div key={item.id} className="vpgq-chip-wrap">
                            <button
                              type="button"
                              className={`vpgq-chip${
                                isSelected ? " vpgq-chip-active" : ""
                              }${isFree ? " vpgq-chip-free" : ""}`}
                              onClick={() => toggleService(item.id)}
                              aria-pressed={isSelected}
                            >
                              <span className="vpgq-check">
                                <Check className="vpgq-check-icon" strokeWidth={3} />
                              </span>

                              <span>{item.label}</span>

                              {meta && (
                                <span className={getMetaClassName(item)}>
                                  {meta}
                                </span>
                              )}
                            </button>

                            {renderWordCountField(item.id)}
                            {renderIllustrationCountField(item.id)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="vpgq-submit"
              onClick={sendToWhatsApp}
            >
              <span className="vpgq-submit-title">
                Send me{" "}
                <span style={{ fontFamily: "PP Telegraf" }}>PRINT Cost + </span>
                <span className="vpgq-submit-total">
                  {formatNaira(displayTotal)}
                </span>
                <span> →</span>
              </span>
            </button>

            {onToggleExtras && (
              <button
                type="button"
                onClick={onToggleExtras}
                className="mt-3 flex w-full flex-col items-center gap-1.5 py-2 text-white/40 transition-colors hover:text-white/60"
              >
                <div className="flex w-full items-center gap-3">
                  <span className="h-px flex-1 bg-white/12" />
                  <span
                    style={{
                      display: "inline-flex",
                      transition: "transform 0.25s ease",
                      transform: showExtras
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    <ChevronDown size={16} strokeWidth={2} />
                  </span>
                  <span className="h-px flex-1 bg-white/12" />
                </div>

                <span className="text-[0.72rem] font-semibold">
                  {showExtras ? "Show less" : "View more"}
                </span>
              </button>
            )}
          </div>
        </div>

        {showExtras && (
        <div className="mx-auto max-w-7xl">
          <div className="vpgq-volume-card">
            <div>
              <p className="eyebrow">Print Quantity Guide</p>

              <h2 className="display-heading section-heading text-white">
                Choose{" "}
                <span className="text-[var(--vp-accent)]">print range</span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/55">
                Your unit cost reduces as your print quantity increases. This
                helps authors choose between sample prints, POD, mini bulk, and
                full bulk production.
              </p>
            </div>

            <div className="vpgq-volume-grid">
              {printVolumeOptions.map((option) => (
                <div
                  key={option.title}
                  className={`vpgq-volume-item${
                    option.popular ? " vpgq-volume-popular" : ""
                  }`}
                >
                  {option.popular && (
                    <span className="vpgq-volume-tag">Most Popular</span>
                  )}

                  <h3 className={option.popular ? "mt-3" : ""}>
                    {option.title}
                  </h3>

                  <p className="vpgq-volume-range">{option.range}</p>

                  <p className="vpgq-volume-note">{option.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="vpgq-pod-card">
            <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-center">
              <div>
                <p className="eyebrow">POD Plans</p>

                <h2 className="display-heading section-heading text-white">
                  Print on Demand{" "}
                  <span className="text-[var(--vp-accent)]">(POD)</span>
                </h2>

                <p className="mt-4 text-sm leading-7 text-white/55">
                  We offer Print on Demand for units as low as 50 copies as well
                  as Conventional Bulk Prints. POD allows authors to print with
                  what they have, though unit cost is usually higher.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <Image
                  src="/images/pod.png"
                  alt="Print on Demand"
                  width={1200}
                  height={760}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>

            <div className="vpgq-pod-grid">
              {publishingPricing.map((plan) => (
                <div
                  key={plan.name}
                  className={`vpgq-price-card${
                    plan.featured ? " vpgq-featured" : ""
                  }`}
                >
                  <h3>{plan.name}</h3>

                  <p>{plan.note}</p>

                  <h4>{plan.price}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </section>
    </>
  );
}

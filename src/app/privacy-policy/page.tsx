import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument, { LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy Policy | ValuePlus",
  description:
    "How ValuePlus Media Limited collects, uses, and protects your personal information across the ValuePlus website and mobile app.",
};

const LAST_UPDATED = "August 13, 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      tagline="How we collect, use, and protect your information."
      lastUpdated={LAST_UPDATED}
      intro={
        <>
          This Privacy Policy explains how ValuePlus Media Limited
          (&quot;ValuePlus,&quot; &quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;) collects, uses, shares, and protects personal
          information when you use the ValuePlus website at{" "}
          <span className="text-white">valuepluspublishing.com</span>, our
          mobile app, and related services (together, the
          &quot;Services&quot;). By creating an account or otherwise using
          the Services, you agree to the practices described in this
          Privacy Policy. If you do not agree, please do not use the
          Services.
        </>
      }
      contactNote={
        <>
          Questions, concerns, or requests about this Privacy Policy or
          your personal information can be sent to{" "}
          <a
            href="mailto:valuepluspublishing@gmail.com"
            className="text-vp-accent underline underline-offset-2"
          >
            valuepluspublishing@gmail.com
          </a>{" "}
          or{" "}
          <a
            href="tel:+2349024312689"
            className="text-vp-accent underline underline-offset-2"
          >
            +234 902 431 2689
          </a>
          , or via{" "}
          <a
            href="https://wa.me/2349024312689"
            target="_blank"
            rel="noopener noreferrer"
            className="text-vp-accent underline underline-offset-2"
          >
            WhatsApp
          </a>
          . See also our{" "}
          <Link
            href="/terms"
            className="text-vp-accent underline underline-offset-2"
          >
            Terms of Service
          </Link>
          .
        </>
      }
    >
      <LegalSection heading="Who This Policy Covers">
        <p>
          ValuePlus is a Nigerian platform for two kinds of
          users: authors who want their book professionally published and
          printed, and learners who want to study our Learn the A–Z of
          Publishing course and eventually publish their own titles. This
          Policy applies to anyone who visits our website, creates an
          account, uses our mobile app, requests a print quotation, or
          places an order through our storefront.
        </p>
      </LegalSection>

      <LegalSection heading="Information We Collect">
        <p>
          <span className="font-bold text-white">Account information.</span>{" "}
          When you register, we collect your first and last name, email
          address, phone number, password, and — if you choose to add
          one — a profile photo. If you sign up because someone referred
          you, we record that referral relationship.
        </p>
        <p>
          <span className="font-bold text-white">
            Identity verification (KYC) information.
          </span>{" "}
          Before we can pay out wallet earnings or referral commissions to
          your bank account, Nigerian financial-compliance requirements
          mean we need to verify who you are. This may include your date
          of birth, gender, relationship and employment status, address,
          state and country of residence, your mother&apos;s maiden name,
          a government-issued ID document (e.g. a national ID, driver&apos;s
          licence, or passport, submitted as a photo or scan), and
          next-of-kin contact details.
        </p>
        <p>
          <span className="font-bold text-white">
            Financial and payout information.
          </span>{" "}
          To pay you for book royalties, referral commissions, or other
          earnings, we collect your bank account name, account number, and
          bank. We do not collect or store your debit/credit card details —
          card payments you make (e.g. to buy a book, pay for a print
          order, or fund a wallet top-up) are processed directly by our
          payment processor, Paystack, as described below.
        </p>
        <p>
          <span className="font-bold text-white">
            Your books and manuscripts.
          </span>{" "}
          When you use ValuePlus to publish a book, we collect the
          manuscript, cover art, title, description, and any other content
          you upload for editing, typesetting, printing, and listing.
        </p>
        <p>
          <span className="font-bold text-white">
            Orders, print requests, and delivery information.
          </span>{" "}
          If you request a print quotation, buy a book from our storefront,
          or order printed copies, we collect the buyer&apos;s name, email,
          phone or WhatsApp number, book specifications (size, page count,
          copies, chosen services), and — for physical orders — a shipping
          address.
        </p>
        <p>
          <span className="font-bold text-white">
            Reviews and public content.
          </span>{" "}
          If you leave a review on a book, that review, your name, and (in
          our records, not publicly) your email are stored and the review
          text is shown publicly on that book&apos;s page.
        </p>
        <p>
          <span className="font-bold text-white">Communications.</span> If
          you contact our support team — including via the in-app
          &quot;Message Admin&quot; WhatsApp link — we keep a record of that
          conversation to help resolve your request and improve our
          support.
        </p>
        <p>
          <span className="font-bold text-white">
            Device and usage information.
          </span>{" "}
          Like most apps and websites, our servers automatically log basic
          technical information when you use the Services — such as your
          app version, device/browser type, operating system, IP address,
          and the pages or screens you visit — for security, debugging,
          and improving the Services. We do not currently use any
          third-party analytics, advertising, or crash-reporting SDKs in
          either the website or the mobile app; if that changes, we will
          update this Policy first.
        </p>
      </LegalSection>

      <LegalSection heading="How We Use Your Information">
        <p>We use the information described above to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            create and manage your account, and let you switch between
            Author and Learner modes;
          </li>
          <li>
            provide our core services — editing, typesetting, printing,
            and publishing your book; processing quotation requests and
            storefront orders; and delivering physical copies;
          </li>
          <li>
            verify your identity where required by law before releasing
            wallet earnings, referral commissions, or other payouts to
            your bank account;
          </li>
          <li>
            process payments and payouts through Paystack, and send
            transactional emails (e.g. order confirmations, OTP codes,
            password resets) through our email provider, Resend;
          </li>
          <li>
            run the Learn the A–Z of Publishing course, track your
            progress, XP, and streaks, and run the referral program;
          </li>
          <li>
            respond to support requests and communicate with you about
            your account, orders, or this Policy;
          </li>
          <li>
            detect, investigate, and prevent fraud, abuse, or violations
            of our{" "}
            <Link
              href="/terms"
              className="text-vp-accent underline underline-offset-2"
            >
              Terms of Service
            </Link>
            ; and
          </li>
          <li>comply with applicable Nigerian law and regulation.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="How We Share Your Information">
        <p>
          We do not sell your personal information, and we do not share it
          with third parties for their own marketing purposes. We share
          information only where necessary to run the Services:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-bold text-white">Paystack</span> —
            processes card/bank payments and payouts on our behalf; they
            receive the transaction details needed to complete each
            payment.
          </li>
          <li>
            <span className="font-bold text-white">Resend</span> — sends
            transactional emails (OTPs, receipts, notifications) on our
            behalf.
          </li>
          <li>
            <span className="font-bold text-white">
              Printing and delivery partners
            </span>{" "}
            — receive the shipping address and order details needed to
            print and deliver a physical book to you.
          </li>
          <li>
            <span className="font-bold text-white">Legal and safety</span>{" "}
            — we may disclose information if required by law, court order,
            or governmental request, or where we believe it&apos;s
            necessary to protect the rights, property, or safety of
            ValuePlus, our users, or the public.
          </li>
          <li>
            <span className="font-bold text-white">Business transfers</span>{" "}
            — if ValuePlus is involved in a merger, acquisition, or sale of
            assets, your information may be transferred as part of that
            transaction; we will notify you before your information becomes
            subject to a different privacy policy.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Data Retention">
        <p>
          We keep your personal information for as long as your account is
          active, plus a reasonable period afterward to comply with legal,
          tax, and accounting obligations (Nigerian financial-compliance
          rules generally require transaction and identity-verification
          records to be retained for several years), resolve disputes, and
          enforce our agreements. When you delete your account (see
          &quot;Your Rights and Choices&quot; below), we delete or
          anonymize your personal information except where we&apos;re
          required to retain it by law.
        </p>
      </LegalSection>

      <LegalSection heading="How We Protect Your Information">
        <p>
          We use industry-standard safeguards to protect your information,
          including encrypting data in transit (HTTPS/TLS), storing your
          transaction PIN as a one-way hash (never in plain text), and
          storing session/login credentials in your device&apos;s
          platform-standard secure storage (e.g. iOS Keychain / Android
          Keystore via Expo SecureStore) rather than in plain files. No
          method of transmission or storage is 100% secure, so we cannot
          guarantee absolute security — but we work to protect your
          information and encourage you to keep your password and PIN
          confidential and notify us immediately of any unauthorized
          account activity.
        </p>
      </LegalSection>

      <LegalSection heading="Your Rights and Choices">
        <p>
          <span className="font-bold text-white">
            Access and update your information.
          </span>{" "}
          You can view and update most of your account and KYC information
          at any time from Settings in the app or website.
        </p>
        <p>
          <span className="font-bold text-white">
            Delete your account and data.
          </span>{" "}
          You can permanently delete your account and associated personal
          information at any time, directly in the app or website — open
          the menu, select{" "}
          <span className="italic">Manage Account → Delete Account</span>,
          and confirm. This is irreversible. If you&apos;d rather we handle
          it for you, email{" "}
          <a
            href="mailto:valuepluspublishing@gmail.com"
            className="text-vp-accent underline underline-offset-2"
          >
            valuepluspublishing@gmail.com
          </a>{" "}
          from your registered email address and we will process your
          request within a reasonable time, subject to any records we&apos;re
          legally required to retain (see &quot;Data Retention&quot;
          above).
        </p>
        <p>
          <span className="font-bold text-white">Opt out of marketing.</span>{" "}
          Any promotional email we send includes an unsubscribe option; you
          will still receive essential account and transaction emails
          unless you delete your account.
        </p>
        <p>
          <span className="font-bold text-white">Request your data.</span>{" "}
          You can ask us for a copy of the personal information we hold
          about you by contacting us at the details below.
        </p>
      </LegalSection>

      <LegalSection heading="Children's Privacy">
        <p>
          Our Services are not directed to, and are not intended for use
          by, anyone under the age of 18. We do not knowingly collect
          personal information from children. If you believe a child has
          provided us with personal information, please contact us so we
          can remove it.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies and Local Storage">
        <p>
          Our website uses only essential first-party cookies and local
          storage — for example, to keep you signed in and remember your
          Author/Learner mode preference. We do not currently use
          third-party advertising or tracking cookies, so no
          consent-required tracking currently takes place. If that
          changes, we will update this section and, where required by law,
          add a cookie consent notice.
        </p>
      </LegalSection>

      <LegalSection heading="Third-Party Links">
        <p>
          The Services may link to third-party websites or services (for
          example, WhatsApp, or a printing partner&apos;s tracking page)
          that we don&apos;t own or control. This Privacy Policy does not
          apply to those third parties — please review their own privacy
          policies before providing them any information.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. If we make
          material changes, we will update the &quot;Last updated&quot;
          date above and, where appropriate, notify you in the app or by
          email. Your continued use of the Services after a change takes
          effect means you accept the revised Policy.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}

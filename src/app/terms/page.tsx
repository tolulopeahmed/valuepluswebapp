import type { Metadata } from "next";
import Link from "next/link";
import LegalDocument, { LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Terms of Service | ValuePlus Publishing",
  description:
    "The terms and conditions governing your use of the ValuePlus Publishing website and mobile app.",
};

const LAST_UPDATED = "August 13, 2026";

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      tagline="The terms and conditions for using ValuePlus Publishing."
      lastUpdated={LAST_UPDATED}
      intro={
        <>
          These Terms of Service (&quot;Terms&quot;) are an agreement
          between you and ValuePlus Media Limited (&quot;ValuePlus,&quot;
          &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) governing your
          use of the ValuePlus Publishing website, mobile app, and related
          services (together, the &quot;Services&quot;). By creating an
          account or otherwise using the Services, you agree to be bound
          by these Terms and by our{" "}
          <Link
            href="/privacy-policy"
            className="text-vp-accent underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          . If you do not agree, do not use the Services.
        </>
      }
      contactNote={
        <>
          Questions about these Terms can be sent to{" "}
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
          .
        </>
      }
    >
      <LegalSection heading="What We Offer">
        <p>
          ValuePlus Publishing offers: (1) publishing and printing services
          for authors, including manuscript editing, cover design,
          typesetting, print quotations, and physical printing/delivery of
          books; (2) a storefront where readers can buy published titles;
          (3) the Learn the A–Z of Publishing course and Academy features
          for learners; and (4) a wallet through which authors and referrers
          can track and withdraw earnings, including a referral program.
          Some features (like Learner mode) may be limited or rolled out
          gradually — we&apos;ll indicate in the app when a feature isn&apos;t
          yet available.
        </p>
      </LegalSection>

      <LegalSection heading="Eligibility and Your Account">
        <p>
          To use the Services you must be at least 18 years old and able
          to form a binding contract under Nigerian law. You must provide
          accurate, current information when creating your account and
          keep it up to date. You&apos;re responsible for keeping your
          password and any transaction PIN confidential, and for all
          activity on your account. Contact us immediately if you suspect
          unauthorized access to your account.
        </p>
        <p>
          Before we can release wallet earnings or referral commissions to
          your bank account, Nigerian financial-compliance requirements
          mean you must complete identity verification (KYC) as described
          in our{" "}
          <Link
            href="/privacy-policy"
            className="text-vp-accent underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Your Content">
        <p>
          You retain ownership of the manuscripts, cover art, and any other
          content you upload to publish a book (&quot;Your Content&quot;).
          By submitting Your Content, you grant ValuePlus a license to
          host, edit, typeset, print, list, market, and — where you
          choose to sell it through our storefront — sell and deliver Your
          Content, solely for the purpose of providing the Services to
          you. You represent and warrant that you own or have the
          necessary rights to Your Content, and that it does not infringe
          any third party&apos;s copyright, trademark, or other rights, and
          is not illegal, defamatory, or otherwise unlawful. We may remove
          or refuse to publish content that violates these Terms.
        </p>
      </LegalSection>

      <LegalSection heading="Orders, Pricing, and Payments">
        <p>
          Prices for print quotations, storefront purchases, and other
          paid services are shown in the app or website before you confirm
          an order. Payments are processed by our payment processor,
          Paystack — we do not collect or store your card details. Wallet
          earnings and referral commissions are paid out to your linked,
          verified bank account, subject to successful KYC verification
          and any minimum withdrawal amount shown in the app.
        </p>
      </LegalSection>

      <LegalSection heading="Refunds and Cancellations">
        <p>
          Because publishing and print orders are produced specifically
          for you (e.g. typesetting your manuscript or printing your book
          copies), work already performed or copies already printed are
          generally non-refundable once production has started. If you
          need to cancel or change an order, contact us as soon as possible
          — we&apos;ll do our best to accommodate changes before production
          begins, and will handle any billing error or service failure on
          our part fairly and promptly.
        </p>
      </LegalSection>

      <LegalSection heading="Wallet, Referrals, and Withdrawals">
        <p>
          You earn referral commissions when someone you refer signs up
          and completes a paid transaction, and book-sale or other
          earnings as described in the app. Amounts shown as
          &quot;pending&quot; become withdrawable once confirmed. We may
          withhold or reverse a payout we reasonably believe resulted from
          fraud, abuse of the referral program, or a violation of these
          Terms.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            upload content that is illegal, infringing, defamatory,
            obscene, or otherwise violates the rights of others;
          </li>
          <li>
            use the Services for any fraudulent, abusive, or unauthorized
            purpose, including creating fake referrals or manipulating the
            wallet/referral system;
          </li>
          <li>
            attempt to gain unauthorized access to any account, system, or
            network connected to the Services; or
          </li>
          <li>
            interfere with or disrupt the integrity or performance of the
            Services.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Suspension and Termination">
        <p>
          You may stop using the Services and permanently delete your
          account and data at any time — from the app or website menu,
          select{" "}
          <span className="italic">Manage Account → Delete Account</span>.
          We may suspend or terminate your access if you violate these
          Terms, misuse the Services, or where required by law, and we
          will settle any confirmed, withdrawable wallet balance owed to
          you.
        </p>
      </LegalSection>

      <LegalSection heading="Disclaimers and Limitation of Liability">
        <p className="uppercase">
          The Services are provided &quot;as is&quot; and &quot;as
          available&quot; without warranties of any kind, express or
          implied. To the fullest extent permitted by Nigerian law,
          ValuePlus will not be liable for any indirect, incidental, or
          consequential damages arising from your use of the Services. Our
          total liability for any claim relating to the Services will not
          exceed the amount you paid us for the specific order or service
          giving rise to the claim in the preceding twelve months.
        </p>
        <p>
          Nothing in these Terms limits liability that cannot be limited
          under applicable Nigerian law.
        </p>
      </LegalSection>

      <LegalSection heading="Governing Law">
        <p>
          These Terms are governed by the laws of the Federal Republic of
          Nigeria, without regard to its conflict-of-law principles. Any
          dispute arising from these Terms or the Services will be subject
          to the exclusive jurisdiction of the Nigerian courts.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to These Terms">
        <p>
          We may update these Terms from time to time. If we make material
          changes, we will update the &quot;Last updated&quot; date above
          and, where appropriate, notify you in the app or by email. Your
          continued use of the Services after a change takes effect means
          you accept the revised Terms.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}

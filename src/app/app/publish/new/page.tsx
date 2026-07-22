// app/(app)/publish/new/page.tsx
//
// "Add New Title" is the Get Quote form, reused as-is — same fields,
// same live pricing, same running-total mechanism — just reached after
// signup instead of from the public site. GetQuote is fully
// self-contained (its own scoped styles, no Navbar/Footer dependency),
// so it drops straight into the app shell.
//
// The running total already broadcasts a `valueplus:quote-estimate`
// window event with { formattedTotal, hasSelection, estimateInView } —
// the public Navbar listens for this to show a mini total once the
// estimate card scrolls out of view; our own Header does the same
// (see components/Header.tsx), which is what makes the header update
// as the user scrolls down and keeps adding requirements.

import GetQuote from "../../../../components/landing/GetQuote";
import Title from "../../../../components/Title";
import Subtitle from "../../../../components/Subtitle";

export default function AddNewTitlePage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="vp-card-in mb-4">
        <Title className="block">Add New Title</Title>
        <Subtitle>
          Tell us about your book — the total updates live as you add
          requirements.
        </Subtitle>
      </div>

      <GetQuote />
    </div>
  );
}

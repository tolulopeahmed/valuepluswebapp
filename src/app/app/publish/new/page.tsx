// app/(app)/publish/new/page.tsx
"use client";

import { useState } from "react";
import GetQuote from "../../../../components/landing/GetQuote";

export default function AddNewTitlePage() {
  const [showExtras, setShowExtras] = useState(false);

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* <div className="vp-card-in mb-4">
        <Title className="block">New Book</Title>
        <Subtitle>
          Enter the details of your new book and receive a cost estimate.
        </Subtitle>
      </div> */}

      <div style={{ marginTop: -25 }}>
        <GetQuote
          showExtras={showExtras}
          onToggleExtras={() => setShowExtras((v) => !v)}
        />
      </div>
    </div>
  );
}

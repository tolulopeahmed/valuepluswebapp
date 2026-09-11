const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.valuepluspublishing.app";
const APP_STORE_URL =
  "https://apps.apple.com/ng/app/valueplus-learn-publishing/id6801470780";

function destinationFor(userAgent: string) {
  if (/android/i.test(userAgent)) {
    return PLAY_STORE_URL;
  }

  // iPadOS can identify itself as Macintosh, but still includes "Mobile".
  if (/iphone|ipad|ipod/i.test(userAgent) || /macintosh.*mobile/i.test(userAgent)) {
    return APP_STORE_URL;
  }

  return "/login?mode=signup";
}

export function GET(request: Request) {
  const destination = destinationFor(request.headers.get("user-agent") ?? "");
  return new Response(null, {
    status: 307,
    headers: {
      Location: new URL(destination, request.url).toString(),
      // The response varies by device, so CDNs must not reuse one platform's
      // redirect for another platform (or for desktop visitors).
      "Cache-Control": "no-store",
      Vary: "User-Agent",
    },
  });
}

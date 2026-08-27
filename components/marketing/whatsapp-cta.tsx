"use client";

// Floating round WhatsApp CTA — home page only, so it doesn't compete with
// HR/candidate module chrome elsewhere in the app.
const WHATSAPP_NUMBER = "6287786062794"; // 087786062794 in international format
const WHATSAPP_MESSAGE = "Halo kak, aku punya pertanyaan tentang Skillsync.";

export function WhatsAppCta() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat via WhatsApp"
      className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}

// Official WhatsApp glyph, hardcoded like the Google "G" in auth-form.tsx —
// brand marks keep their real colours/shape regardless of the design tokens.
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
      <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.386.7 4.61 1.905 6.48L4 29l7.72-1.86A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.75c-1.94 0-3.75-.55-5.29-1.5l-.38-.23-4.58 1.1 1.13-4.46-.25-.4A9.7 9.7 0 0 1 5.25 15c0-5.93 4.82-10.75 10.754-10.75S26.75 9.07 26.75 15 21.94 24.75 16.004 24.75Zm5.98-8.1c-.328-.164-1.94-.957-2.24-1.066-.3-.11-.52-.164-.738.164-.219.328-.848 1.066-1.04 1.285-.192.219-.383.246-.71.082-.328-.164-1.386-.51-2.64-1.63-.976-.87-1.636-1.945-1.828-2.273-.192-.328-.02-.505.145-.668.148-.148.328-.383.492-.574.164-.192.219-.328.328-.547.11-.219.055-.41-.027-.574-.082-.164-.738-1.78-1.012-2.437-.267-.64-.539-.555-.738-.566-.191-.01-.41-.012-.629-.012-.219 0-.574.082-.875.41-.3.328-1.148 1.121-1.148 2.734s1.176 3.172 1.34 3.39c.164.219 2.312 3.531 5.605 4.95.783.338 1.394.54 1.87.69.786.25 1.5.215 2.066.13.63-.094 1.94-.793 2.213-1.559.273-.766.273-1.422.191-1.559-.082-.137-.3-.219-.629-.383Z" />
    </svg>
  );
}

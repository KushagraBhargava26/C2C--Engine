import { useEffect, useRef, useState } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let scriptLoadingPromise = null;
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptLoadingPromise;
}

/**
 * Renders Google's own Sign-In button (styled by Google, not us — that's
 * required by their branding guidelines) and calls onCredential(idToken)
 * once the person picks an account.
 */
export default function GoogleSignInButton({ onCredential, onError }) {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;

    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => onCredential(response.credential),
        });
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            width: 356,
            shape: "rectangular",
            text: "continue_with",
          });
        }
        setReady(true);
      })
      .catch(() => onError?.("Couldn't load Google Sign-In. Check your connection and try again."));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) {
    return (
      <div className="rounded-lg border border-dashed border-steel px-3.5 py-3 text-center text-[11.5px] text-parchment-faint">
        Google Sign-In isn&apos;t configured yet — set VITE_GOOGLE_CLIENT_ID in
        frontend/.env
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      {!ready && (
        <div className="flex w-full items-center justify-center rounded-lg border border-steel bg-ink-soft py-3 text-[13.5px] text-parchment-faint">
          Loading…
        </div>
      )}
      <div ref={buttonRef} className={ready ? "" : "hidden"} />
    </div>
  );
}

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Hand, Sparkles } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  type: string; // IMAGE | VIDEO
  mediaUrl: string;
  linkUrl?: string | null;
  durationSeconds: number;
}

export default function DisplayPage() {
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load ads
  useEffect(() => {
    api
      .get("/ads/active")
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        if (list.length > 0) {
          setAds(list);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const goToKiosk = useCallback(() => {
    router.push("/");
  }, [router]);

  // Auto-advance per durationSeconds
  useEffect(() => {
    if (ads.length === 0) return;
    const current = ads[currentIndex];
    const duration = Math.max((current?.durationSeconds || 8) * 1000, 3000);
    timerRef.current = setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % ads.length);
    }, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ads, currentIndex]);

  // Touch/keyboard anywhere → kiosk
  useEffect(() => {
    const touch = (e: Event) => {
      e.preventDefault();
      goToKiosk();
    };
    const events = ["pointerdown", "touchstart", "keydown", "click"];
    events.forEach((ev) => window.addEventListener(ev, touch, { passive: false }));
    return () => events.forEach((ev) => window.removeEventListener(ev, touch));
  }, [goToKiosk]);

  // Fallback: no ads → brand slideshow
  const fallbackAds: Ad[] = [
    {
      id: "brand-1",
      title: "EKRAF Kiosk",
      type: "IMAGE",
      mediaUrl: "",
      durationSeconds: 6,
    },
    {
      id: "brand-2",
      title: "17 Subsektor Ekonomi Kreatif",
      type: "IMAGE",
      mediaUrl: "",
      durationSeconds: 6,
    },
    {
      id: "brand-3",
      title: "Dukung Karya Anak Bangsa",
      type: "IMAGE",
      mediaUrl: "",
      durationSeconds: 6,
    },
  ];
  const displayAds = ads.length > 0 ? ads : fallbackAds;
  const current = displayAds[currentIndex % displayAds.length];

  return (
    <div
      className="relative flex h-screen w-screen cursor-pointer select-none items-center justify-center overflow-hidden bg-primary"
      onClick={goToKiosk}
      onPointerDown={() => {}}
    >
      {current.type === "VIDEO" ? (
        <video
          key={current.id}
          src={current.mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : current.mediaUrl ? (
        <img
          key={current.id}
          src={current.mediaUrl}
          alt={current.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-8 bg-gradient-to-br from-primary via-primary to-primary-hover p-10 text-center text-primary-fg">
          <img src="/ekraf-logo.png" alt="EKRAF" className="h-36 w-36 object-contain drop-shadow-lg" />
          <h1 className="text-7xl font-bold tracking-tight sm:text-9xl">{current.title}</h1>
          <p className="max-w-3xl text-3xl opacity-90 sm:text-4xl">
            Marketplace Ekonomi Kreatif Indonesia
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-full bg-primary-fg/10 px-8 py-4 text-2xl font-semibold">
            <Hand className="h-8 w-8" /> Sentuh layar untuk mulai
          </div>
        </div>
      )}

      {/* Gradient overlay for text readability on image ads */}
      {current.mediaUrl && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-10 pb-14">
          <p className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl">
            {current.title}
          </p>
        </div>
      )}

      {/* Progress dots */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {displayAds.map((_, i) => (
          <span
            key={i}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === currentIndex % displayAds.length
                ? "w-8 bg-white"
                : "w-2.5 bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Touch hint */}
      <div className="absolute right-8 top-8 flex items-center gap-2 rounded-full bg-black/40 px-6 py-3.5 text-white backdrop-blur-sm">
        <Hand className="h-6 w-6" />
        <span className="text-xl font-semibold">Sentuh untuk mulai</span>
      </div>

      <div className="absolute bottom-6 right-8 flex items-center gap-2 text-white/80">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm">EKRAF Kiosk</span>
      </div>
    </div>
  );
}

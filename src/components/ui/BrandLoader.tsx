"use client";

import Image from "next/image";

interface BrandLoaderProps {
  message?: string;
}

const particlePositions = [
  { top: "12%", left: "18%", delay: "0s" },
  { top: "22%", right: "16%", delay: "0.4s" },
  { bottom: "18%", left: "10%", delay: "0.7s" },
  { bottom: "12%", right: "22%", delay: "1s" },
  { top: "50%", left: "6%", delay: "1.3s" },
  { top: "48%", right: "8%", delay: "1.6s" },
];

export function BrandLoader({ message }: BrandLoaderProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-100 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_65%)]" />

      <div className="relative flex flex-col items-center gap-6 text-center">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 animate-[pulse_2.8s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-orange-200/80 via-red-200/60 to-amber-300/80 blur-2xl dark:from-orange-500/30 dark:via-red-500/20 dark:to-amber-400/25" />
          <div className="absolute -inset-4 animate-[spin_12s_linear_infinite] rounded-full border border-dashed border-orange-400/40 dark:border-orange-300/20" />

          <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-white/95 via-white/80 to-amber-50/90 shadow-2xl shadow-orange-200/60 ring-1 ring-orange-400/20 dark:from-slate-900/80 dark:via-slate-900/70 dark:to-slate-950/90 dark:shadow-orange-900/30 dark:ring-orange-500/20">
            <Image
              src="/images/AlertFire.png"
              alt="Logo AlertFire"
              width={96}
              height={96}
              priority
              className="select-none"
            />
            <div className="absolute inset-0 animate-[flameGlow_1.8s_ease-in-out_infinite] rounded-3xl bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-2xl font-bold tracking-tight text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text dark:from-orange-300 dark:via-red-300 dark:to-yellow-200">
            AlertFire prépare votre expérience
          </p>
          <p className="text-sm text-muted-foreground">
            {message ??
              "Sécurisation des données et synchronisation des capteurs"}
          </p>
        </div>

        <div className="relative h-1 w-40 overflow-hidden rounded-full bg-white/60 dark:bg-white/10">
          <div className="absolute inset-0 animate-[progress_2.4s_ease-in-out_infinite] bg-gradient-to-r from-orange-500/80 via-red-500/90 to-amber-400/80" />
        </div>
      </div>

      {particlePositions.map((pos, index) => (
        <span
          key={index}
          className="pointer-events-none absolute h-2 w-2 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500/80 opacity-0"
          style={{
            top: pos.top,
            right: pos.right,
            bottom: pos.bottom,
            left: pos.left,
            animation: `emberFloat 4s linear ${pos.delay} infinite`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes flameGlow {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.55;
            transform: scale(1.06);
          }
        }

        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(10%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes emberFloat {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) scale(0.6);
          }
          20% {
            opacity: 0.8;
          }
          60% {
            opacity: 0.6;
            transform: translate3d(0, -30px, 0) scale(1.05);
          }
          100% {
            opacity: 0;
            transform: translate3d(10px, -50px, 0) scale(0.7);
          }
        }
      `}</style>
    </div>
  );
}

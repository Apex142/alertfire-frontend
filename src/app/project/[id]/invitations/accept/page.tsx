"use client";

import { getAuth } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams?.get("project") || "";
  const userId = searchParams?.get("user") || "";

  const [loading, setLoading] = useState(false);
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  // Helper: invitation "forbidden" or "not found" or param error
  const forbiddenErrors = [
    "Action interdite",
    "Paramètres invalides.",
    "Impossible de vérifier l'invitation.",
    "Technicien non trouvé",
    "Invitation non trouvée",
  ];
  const isForbidden =
    message &&
    !message.success &&
    forbiddenErrors.some((e) => message.text?.includes(e));

  // Vérifier l'état de l'invitation au chargement
  useEffect(() => {
    async function checkInvitation() {
      if (!projectId || !userId) {
        setMessage({ text: "Paramètres invalides.", success: false });
        return;
      }
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setMessage({
            text: "Vous devez être connecté pour vérifier l'invitation.",
            success: false,
          });
          return;
        }
        const idToken = await currentUser.getIdToken();

        const params = new URLSearchParams({ projectId, userId });
        const res = await fetch(`/api/project/accept-invitation?${params}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const data = await res.json();

        if (res.ok && data.accepted) {
          setAlreadyAccepted(true);
          setMessage({
            text: "Vous avez déjà accepté cette invitation.",
            success: true,
          });
        } else if (!res.ok) {
          setMessage({
            text: data.error || "Impossible de vérifier l'invitation.",
            success: false,
          });
        }
      } catch {
        setMessage({ text: "Erreur réseau ou serveur.", success: false });
      }
    }

    checkInvitation();
  }, [projectId, userId]);

  async function handleAccept() {
    if (loading) return;
    if (!projectId || !userId) {
      setMessage({ text: "Paramètres invalides.", success: false });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setMessage({
          text: "Vous devez être connecté pour accepter l'invitation.",
          success: false,
        });
        setLoading(false);
        return;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch("/api/project/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ projectId, userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlreadyAccepted(true);
        setMessage({
          text: "Invitation acceptée avec succès !",
          success: true,
        });
      } else {
        setMessage({
          text: data.error || "Erreur lors de l'acceptation.",
          success: false,
        });
      }
    } catch {
      setMessage({ text: "Erreur réseau ou serveur.", success: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-sky-100 via-indigo-100 to-purple-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center"
      >
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-4 select-none">
          <span className="inline-block mr-2">📩</span> Accepter l'invitation
        </h1>

        {/* Message d'erreur blocant */}
        <AnimatePresence>
          {isForbidden && message && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.4 }}
              className="mt-6 flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm bg-red-100 text-red-800 select-none"
            >
              <XCircle className="w-6 h-6" />
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Texte + bouton seulement si pas forbidden */}
        {!isForbidden && (
          <>
            <p className="text-indigo-600 mb-8 text-lg">
              Vous êtes sur le point d'accepter l'invitation pour rejoindre le
              project{" "}
              <strong className="font-semibold">{projectId || "..."}</strong>.
            </p>

            <button
              onClick={handleAccept}
              disabled={loading || alreadyAccepted}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="w-6 h-6 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-20"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-70"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Traitement...
                </span>
              ) : alreadyAccepted ? (
                "Invitation déjà acceptée"
              ) : (
                "Accepter l'invitation"
              )}
            </button>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.4 }}
                  className={`mt-6 flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm ${
                    message.success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  } select-none`}
                >
                  {message.success ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                  <span>{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </main>
  );
}

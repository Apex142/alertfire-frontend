import { motion } from "framer-motion";
import { Mail, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  status: "approved" | "en attente";
}

interface TechnicalTeamCardProps {
  members: TeamMember[];
}

function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

export const TechnicalTeamCard = ({ members }: TechnicalTeamCardProps) => {
  const hasMounted = useHasMounted();

  return (
    <div
      className="
        bg-white rounded-2xl shadow px-3 py-3 sm:px-5 sm:py-5
        border border-slate-100 w-full max-w-full
      "
    >
      <div className="font-bold text-gray-900 text-base mb-3 tracking-tight select-none">
        Équipe technique
      </div>
      <div className="flex flex-col gap-2">
        {members.map((m, i) => {
          const fullName =
            m.firstName || m.lastName
              ? `${m.firstName || ""} ${m.lastName || ""}`.trim()
              : m.name;

          return (
            <motion.div
              key={m.id}
              initial={!hasMounted ? { opacity: 0, y: 18 } : false}
              animate={!hasMounted ? { opacity: 1, y: 0 } : false}
              transition={{
                delay: !hasMounted ? i * 0.04 : 0,
                duration: 0.24,
                type: "spring",
                bounce: 0.18,
              }}
              className="
                flex items-center gap-3 sm:gap-4 rounded-xl px-2 py-2
                group hover:shadow-md hover:-translate-y-[2px] hover:bg-primary/5 transition-all cursor-pointer
                min-w-0
              "
            >
              {/* Avatar */}
              {m.photoUrl ? (
                <img
                  src={m.photoUrl}
                  alt={fullName}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary border border-slate-200 flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate text-sm sm:text-base">
                  {fullName}
                </div>
                <div className="text-xs text-gray-500 truncate">{m.role}</div>
                <div className="flex flex-col sm:flex-row gap-x-2">
                  {m.email && (
                    <div className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span className="hidden xs:inline">{m.email}</span>
                      <span className="inline xs:hidden">
                        {m.email.split("@")[0]}
                      </span>
                    </div>
                  )}
                  {m.phone && (
                    <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span className="hidden xs:inline">{m.phone}</span>
                      <span className="inline xs:hidden">
                        {m.phone.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Statut */}
              <motion.span
                className={`
                  text-xs font-medium px-2 py-0.5 rounded-full border 
                  min-w-[58px] sm:min-w-[80px] text-center truncate
                  ${
                    m.status === "approved"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-yellow-50 text-yellow-700 border-yellow-100"
                  }
                `}
                animate={
                  m.status === "en attente"
                    ? {
                        scale: [1, 1.08, 1],
                        opacity: [1, 0.85, 1],
                      }
                    : { scale: 1, opacity: 1 }
                }
                transition={
                  m.status === "en attente"
                    ? {
                        duration: 1.3,
                        repeat: Infinity,
                        repeatType: "loop",
                      }
                    : {}
                }
              >
                {m.status === "approved" ? "Approuvé" : "En attente"}
              </motion.span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

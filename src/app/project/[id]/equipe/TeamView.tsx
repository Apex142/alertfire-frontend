// src/features/project/team/TeamView.tsx

"use client";

import Modal from "@/components/ui/Modal";
import AddRoleFlow from "@/features/project/roles/add/AddRoleFlow";
import { useUsers } from "@/hooks/useUser";
import { db } from "@/lib/firebase/client";
import { ProjectMembership } from "@/types/entities/ProjectMembership";
import { User as UserEntity } from "@/types/entities/User";
import { ProjectMemberStatus } from "@/types/enums/ProjectMemberStatus";
import clsx from "clsx";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  ArrowLeftCircle,
  ArrowRightCircle,
  CalendarCheck,
  CheckCircle,
  Clock,
  Eye,
  LogOut,
  Mail,
  Phone,
  Settings,
  User,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useActiveProjectStore } from "../useActiveProjectStore";

// Interface pour nos membres "hydratés" (fusion de Membership et User)
type HydratedMember = ProjectMembership & Partial<UserEntity>;

export default function TeamView() {
  // ==================================================================
  // BLOC 1 : DÉCLARATION DE TOUS LES HOOKS ET ÉTATS
  // ==================================================================

  const { project } = useActiveProjectStore();
  const { users, loading: usersLoading } = useUsers();

  const [members, setMembers] = useState<HydratedMember[]>([]);
  const [membershipsLoading, setMembershipsLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean | string>(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);

  const main = members.length > 0 ? members[index] : null;
  const prevIdx = index > 0 ? index - 1 : null;
  const nextIdx = main && index < members.length - 1 ? index + 1 : null;
  const left = prevIdx !== null ? members[prevIdx] : null;
  const right = nextIdx !== null ? members[nextIdx] : null;

  const status = useMemo(() => {
    if (!main) return {};
    switch (main.status) {
      case ProjectMemberStatus.ACTIVE:
        return {
          label: "Actif",
          color: "bg-green-100 text-green-700 border-green-200 ring-green-100",
          icon: <CheckCircle className="w-4 h-4 text-green-600 mr-1" />,
        };
      case ProjectMemberStatus.REMOVED:
      case ProjectMemberStatus.DECLINED:
        return {
          label: "Retiré",
          color: "bg-red-100 text-red-700 border-red-200 ring-red-100",
          icon: <XCircle className="w-4 h-4 text-red-600 mr-1" />,
          tooltip: "L'utilisateur a été retiré ou a refusé l'invitation.",
        };
      default:
        return {
          label: "En attente",
          color:
            "bg-yellow-100 text-yellow-900 border-yellow-200 ring-yellow-100",
          icon: <Clock className="w-4 h-4 text-yellow-500 mr-1" />,
          tooltip: "Invitation en attente d'acceptation.",
        };
    }
  }, [main]);

  const displayName =
    main?.displayName ||
    `${main?.firstName || ""} ${main?.lastName || ""}`.trim() ||
    "Utilisateur inconnu";

  // ==================================================================
  // BLOC 2 : EFFETS DE BORD (useEffect)
  // ==================================================================

  useEffect(() => {
    if (!project || users.length === 0) return;
    const loadAndMergeMembers = async () => {
      setMembershipsLoading(true);
      try {
        const userMap = new Map(users.map((u) => [u.uid, u]));
        const membershipsRef = collection(db, "project_memberships");
        const q = query(membershipsRef, where("projectId", "==", project.id));
        const querySnapshot = await getDocs(q);
        const hydratedMembers = querySnapshot.docs.map((doc) => {
          const membershipData = {
            id: doc.id,
            ...doc.data(),
          } as ProjectMembership;
          const userData = userMap.get(membershipData.userId);
          return { ...membershipData, ...userData, id: membershipData.id };
        });
        setMembers(hydratedMembers);
      } catch (error) {
        console.error("Erreur lors du chargement des membres:", error);
      } finally {
        setMembershipsLoading(false);
      }
    };
    loadAndMergeMembers();
  }, [project, users]);

  useEffect(() => {
    if (members.length > 0 && index >= members.length)
      setIndex(members.length - 1);
  }, [members, index]);

  useEffect(() => {
    if (!settingsOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      )
        setSettingsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [settingsOpen]);

  // ==================================================================
  // BLOC 3 : RETOURS ANTICIPÉS (Early Returns)
  // ==================================================================

  if (membershipsLoading || usersLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <Users className="w-16 h-16 text-gray-200 mb-3 animate-spin-slow" />
        <span className="text-lg text-center text-gray-400">
          Chargement de l'équipe...
        </span>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <Users className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-700">
          L'équipe est vide pour le moment.
        </h3>
        <p className="text-slate-500 mt-2 mb-4">
          Soyez le premier à inviter un collaborateur !
        </p>
        <button
          className="mt-2 px-5 py-2 rounded-xl bg-primary text-white flex items-center gap-2 font-semibold shadow-lg hover:bg-primary/90 transition-all text-base"
          onClick={() => setModalOpen(true)}
        >
          <UserPlus className="w-5 h-5" />
          Inviter un membre
        </button>
      </div>
    );
  }

  // ==================================================================
  // BLOC 4 : LOGIQUE DE VUE ET RENDU FINAL
  // ==================================================================

  const handleRemove = async () => {
    if (!main || !project) return;
    setConfirmRemove(false);
    setSettingsOpen(false);
    try {
      const idToken = await getAuth().currentUser?.getIdToken();
      const res = await fetch("/api/project/member", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          membershipId: main.id,
          userId: main.userId,
          projectId: project.id,
          projectName: project.projectName,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors du retrait du membre.");
      setMembers((ms) => ms.filter((m) => m.id !== main.id));
    } catch (e) {
      alert("Erreur lors du retrait du membre.");
    }
  };

  function Avatar({
    member,
    size = 20,
    faded = false,
    highlight = false,
    ...rest
  }: {
    member: HydratedMember | null;
    size?: number;
    faded?: boolean;
    highlight?: boolean;
    [k: string]: any;
  }) {
    if (!member)
      return (
        <div
          className="rounded-full bg-slate-200 flex items-center justify-center"
          style={{ width: size, height: size, opacity: faded ? 0.2 : 1 }}
          {...rest}
        />
      );
    const name =
      member.displayName ||
      `${member.firstName || ""} ${member.lastName || ""}`.trim();
    if (member.photoURL)
      return (
        <img
          src={member.photoURL}
          alt={name}
          className={clsx(
            "rounded-full object-cover border-2 border-white shadow transition-all",
            faded && "grayscale opacity-50",
            highlight &&
              "ring-4 ring-primary/20 drop-shadow-lg hover:ring-primary/40"
          )}
          style={{ width: size, height: size, zIndex: highlight ? 2 : 1 }}
          {...rest}
        />
      );
    return (
      <div
        className={clsx(
          "rounded-full bg-slate-100 border-2 border-white flex items-center justify-center shadow transition-all",
          faded && "grayscale opacity-50",
          highlight &&
            "ring-4 ring-primary/20 drop-shadow-lg hover:ring-primary/40"
        )}
        style={{ width: size, height: size, zIndex: highlight ? 2 : 1 }}
        {...rest}
      >
        <User
          className="text-slate-400"
          style={{ width: size * 0.7, height: size * 0.7 }}
        />
      </div>
    );
  }

  function SettingsMenu() {
    return (
      <div
        ref={settingsRef}
        className="absolute top-3 right-3 z-30"
        tabIndex={-1}
      >
        <button
          className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-primary shadow transition"
          aria-label="Options"
          onClick={() => setSettingsOpen((v) => !v)}
        >
          <Settings className="w-5 h-5" />
        </button>
        {settingsOpen === true && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col p-1 animate-in fade-in z-40">
            <Link
              href={`/profile/${main?.userId}`}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition text-slate-700 text-sm"
              onClick={() => setSettingsOpen(false)}
            >
              <Eye className="w-4 h-4" />
              Voir le profil
            </Link>
            <button
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 transition text-sm"
              onClick={() => {
                setSettingsOpen(false);
                setConfirmRemove(true);
              }}
            >
              <LogOut className="w-4 h-4" />
              Retirer ce membre
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-sky-50/60 via-slate-100 to-blue-100/60">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-100 py-3 px-4 flex items-center gap-4 shadow-sm">
          <Users className="w-6 h-6 text-primary" />
          <span className="font-bold text-slate-800 text-lg truncate max-w-[70vw]">
            {project?.projectName || "Équipe"}
          </span>
          <span className="ml-2 text-sm text-slate-400 font-medium">
            {members.length} membre{members.length > 1 ? "s" : ""}
          </span>
        </header>

        <section className="flex flex-col items-center justify-center mt-10 mb-3 px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            L’équipe du projet
          </h2>
          <p className="text-slate-500 mb-3 max-w-lg">
            Retrouvez tous les membres, leurs rôles, disponibilités et moyens de
            contact.
          </p>
          <button
            className="mt-2 px-5 py-2 rounded-xl bg-primary text-white flex items-center gap-2 font-semibold shadow-lg hover:bg-primary/90 transition-all text-base"
            onClick={() => setModalOpen(true)}
          >
            <UserPlus className="w-5 h-5" />
            Inviter un membre
          </button>
        </section>

        <section className="flex flex-col items-center justify-center px-4">
          <div
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl px-3 sm:px-6 py-3 pt-12 sm:py-6 w-full max-w-full sm:max-w-xl flex flex-col items-center border border-slate-100 relative"
            style={{ minHeight: "200px" }}
          >
            <SettingsMenu />
            <div className="flex justify-center items-center gap-2 sm:gap-5 w-full mb-3 relative">
              <button
                disabled={prevIdx === null}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                className="transition-all hover:bg-blue-50 rounded-full p-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Membre précédent"
              >
                <ArrowLeftCircle className="w-5 h-5 sm:w-7 sm:h-7 text-slate-300 hover:text-primary transition-all" />
              </button>
              <Avatar member={left} size={40} faded />
              <Link
                href={`/profile/${main?.userId}`}
                className="z-10 group"
                aria-label={`Voir le profil de ${displayName}`}
              >
                <Avatar member={main} size={90} highlight />
              </Link>
              <Avatar member={right} size={40} faded />
              <button
                disabled={nextIdx === null}
                onClick={() =>
                  setIndex((i) => Math.min(members.length - 1, i + 1))
                }
                className="transition-all hover:bg-blue-50 rounded-full p-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Membre suivant"
              >
                <ArrowRightCircle className="w-5 h-5 sm:w-7 sm:h-7 text-slate-300 hover:text-primary transition-all" />
              </button>
            </div>
            <div className="flex gap-2 items-center justify-center mb-3">
              {members.map((_, idx) => (
                <button
                  key={idx}
                  className={clsx(
                    "w-3 h-3 rounded-full transition-all",
                    idx === index
                      ? "bg-primary shadow ring-2 ring-primary/30"
                      : "bg-slate-300/50 hover:bg-primary/40"
                  )}
                  aria-label={`Voir le membre ${idx + 1}`}
                  onClick={() => setIndex(idx)}
                />
              ))}
            </div>
            <div className="flex flex-col items-center mb-3 text-center">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-1 truncate max-w-[90vw]">
                {displayName}
              </h3>
              <div className="text-base text-primary font-semibold capitalize mb-1">
                <span
                  className={clsx(
                    "inline-block px-3 py-1 rounded-xl bg-blue-50 text-blue-800 text-sm font-bold tracking-wide mt-1 shadow",
                    main?.role?.toLowerCase().includes("lead") &&
                      "bg-amber-100 text-amber-800"
                  )}
                >
                  {main?.role}
                </span>
              </div>
              <div className="mt-1">
                <span
                  className={clsx(
                    "inline-flex items-center gap-1 px-3 py-1 rounded-full border ring-1 text-xs font-bold transition cursor-default relative",
                    status.color
                  )}
                >
                  {status.icon}
                  {status.label}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mx-auto mt-4">
              <div className="flex flex-col items-center bg-blue-50/60 rounded-xl py-3 px-2 shadow-sm">
                <Mail className="w-6 h-6 text-blue-500 mb-1" />
                <span className="text-sm text-slate-700 font-semibold break-all text-center">
                  {main?.email}
                </span>
              </div>
              <div className="flex flex-col items-center bg-green-50/70 rounded-xl py-3 px-2 shadow-sm">
                <Phone className="w-6 h-6 text-green-600 mb-1" />
                <span className="text-sm text-slate-700 font-semibold break-all text-center">
                  {main?.phone || (
                    <span className="italic text-gray-400">Non renseigné</span>
                  )}
                </span>
              </div>
              <div className="flex flex-col items-center bg-purple-50/70 rounded-xl py-3 px-2 shadow-sm">
                <CalendarCheck className="w-6 h-6 text-purple-600 mb-1" />
                <span className="text-sm text-slate-700 font-semibold break-all text-center">
                  {main?.availability || (
                    <span className="italic text-gray-400">Non renseignée</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full flex flex-col items-center justify-center mt-10 mb-20 px-4">
          <div className="mb-2 text-slate-500 font-medium text-sm text-center">
            Tous les membres du projet
          </div>
          <div className="flex flex-wrap gap-3 justify-center max-w-full">
            {members.map((m, i) => (
              <button
                key={m.id}
                className={clsx(
                  "flex flex-col items-center px-2 py-2 rounded-xl transition group hover:bg-blue-50/50",
                  i === index && "ring-2 ring-primary/40 bg-primary/10"
                )}
                onClick={() => setIndex(i)}
                aria-label={`Voir ${m.displayName}`}
                style={{ minWidth: 56 }}
              >
                <Avatar member={m} size={50} highlight={i === index} />
                <div className="mt-1 text-xs text-slate-700 font-semibold truncate w-16 text-center">
                  {m.firstName || m.displayName?.split(" ")[0]}
                </div>
              </button>
            ))}
          </div>
        </section>

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Inviter un membre"
        >
          <AddRoleFlow
            projectId={project?.id}
            onSuccess={() => setModalOpen(false)}
          />
        </Modal>

        <Modal
          open={!!confirmRemove}
          onClose={() => setConfirmRemove(false)}
          title="Retirer ce membre ?"
        >
          <div className="py-2 text-slate-700 text-base">
            Voulez-vous vraiment retirer <b>{displayName}</b> de l’équipe ?
          </div>
          <div className="flex gap-4 mt-6 justify-end">
            <button
              className="px-4 py-2 rounded-lg border bg-white text-slate-600 font-semibold hover:bg-slate-50 transition"
              onClick={() => setConfirmRemove(false)}
            >
              Annuler
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              onClick={handleRemove}
            >
              Retirer
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface RoleTemplate {
  id: string;
  label: string;
  category: string;
  icon: string;
  defaultStatus: string;
  priority: number;
}

export default function ImportRolesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { success: boolean; count?: number; message?: string; error?: string }>();
  const [roles, setRoles] = useState<RoleTemplate[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [editingField, setEditingField] = useState<{ roleId: string; field: keyof RoleTemplate } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const rolesCollection = collection(db, "role_templates");
      const rolesSnapshot = await getDocs(rolesCollection);
      const rolesList = rolesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RoleTemplate[];
      const sortedRoles = rolesList.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      setRoles(sortedRoles);
    } catch (error) {
      console.error("Erreur lors de la récupération des rôles:", error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/import/role-templates", { method: "POST" });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        fetchRoles();
      }
    } catch (e) {
      setResult({ success: false, error: "Erreur réseau ou serveur." });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldEdit = (roleId: string, field: keyof RoleTemplate, value: string | number) => {
    setEditingField({ roleId, field });
    setEditValue(value.toString());
  };

  const handleFieldSave = async () => {
    if (!editingField) return;

    try {
      const roleRef = doc(db, "role_templates", editingField.roleId);
      const updateData = {
        [editingField.field]: editingField.field === 'priority' ? parseInt(editValue) || 0 : editValue
      };
      await updateDoc(roleRef, updateData);
      setEditingField(null);
      fetchRoles();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du champ:", error);
    }
  };

  const handleSelectChange = async (value: string) => {
    if (!editingField) return;

    try {
      const roleRef = doc(db, "role_templates", editingField.roleId);
      await updateDoc(roleRef, {
        [editingField.field]: value
      });
      setEditingField(null);
      fetchRoles();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du champ:", error);
    }
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFieldSave();
    } else if (e.key === 'Escape') {
      handleFieldCancel();
    }
  };

  // Filtrer les rôles en fonction de la recherche et de la catégorie
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.icon.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || role.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Obtenir les catégories uniques
  const uniqueCategories = Array.from(new Set(roles.map(role => role.category)));

  const renderEditableField = (role: RoleTemplate, field: keyof RoleTemplate) => {
    const isEditing = editingField?.roleId === role.id && editingField?.field === field;
    const value = role[field];

    if (isEditing) {
      if (field === 'priority') {
        return (
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleFieldSave}
            className="w-20"
            min="0"
            autoFocus
          />
        );
      } else if (field === 'category') {
        return (
          <Select
            value={editValue}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="w-48"
            autoFocus
          >
            {uniqueCategories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </Select>
        );
      } else if (field === 'defaultStatus') {
        return (
          <Select
            value={editValue}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="w-48"
            autoFocus
          >
            <option value="confirmed">Confirmé</option>
            <option value="pending">En attente</option>
            <option value="declined">Refusé</option>
          </Select>
        );
      } else {
        return (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleFieldSave}
            className={field === 'icon' ? 'w-24' : ''}
            autoFocus
          />
        );
      }
    }

    return (
      <div
        onClick={() => handleFieldEdit(role.id, field, value)}
        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
      >
        {field === 'category' && typeof value === 'string'
          ? value.charAt(0).toUpperCase() + value.slice(1)
          : value}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des templates de rôles</h1>

      <div className="mb-8">
        <Button onClick={handleImport} disabled={loading}>
          {loading ? "Import en cours..." : "Importer les rôles"}
        </Button>
        {result && (
          <div className="mt-4 p-4 rounded border bg-gray-50 dark:bg-gray-800">
            {result.success ? (
              <div className="text-green-700 dark:text-green-400">
                ✅ {result.message || `${result.count} rôles importés avec succès.`}
              </div>
            ) : (
              <div className="text-red-700 dark:text-red-400">
                ❌ {result.error || "Erreur inconnue."}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Liste des rôles importés</h2>
          <div className="flex gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Rechercher un rôle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              )}
            </div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-48"
            >
              <option value="">Toutes les catégories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loadingRoles ? (
          <div>Chargement des rôles...</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="h-10">
                  <TableHead className="py-2">Priorité</TableHead>
                  <TableHead className="py-2">Icône</TableHead>
                  <TableHead className="py-2">Label</TableHead>
                  <TableHead className="py-2">Catégorie</TableHead>
                  <TableHead className="py-2">ID</TableHead>
                  <TableHead className="py-2">Statut par défaut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id} className="h-10 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="py-1">{renderEditableField(role, 'priority')}</TableCell>
                    <TableCell className="py-1">{renderEditableField(role, 'icon')}</TableCell>
                    <TableCell className="py-1">{renderEditableField(role, 'label')}</TableCell>
                    <TableCell className="py-1">{renderEditableField(role, 'category')}</TableCell>
                    <TableCell className="py-1 font-mono text-sm">{role.id}</TableCell>
                    <TableCell className="py-1">{renderEditableField(role, 'defaultStatus')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
} 
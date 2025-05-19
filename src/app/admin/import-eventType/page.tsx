'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { collection, doc, setDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import eventTypes from './eventType.json';
import { Pencil, Trash2, Save, X } from 'lucide-react';

interface EventType {
  code: string;
  label: string;
  icon: string;
  color: string;
  created_at?: Date;
  updated_at?: Date;
}

interface EditingEventType extends EventType {
  isEditing: boolean;
}

export default function ImportEventTypePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [eventTypesList, setEventTypesList] = useState<EditingEventType[]>([]);
  const [editingType, setEditingType] = useState<EventType | null>(null);

  // Charger les types d'événements existants
  const loadEventTypes = async () => {
    try {
      const eventTypesRef = collection(db, 'event_types');
      const q = query(eventTypesRef, orderBy('label'));
      const snapshot = await getDocs(q);

      const types = snapshot.docs.map(doc => ({
        ...doc.data(),
        code: doc.id,
        isEditing: false,
      })) as EditingEventType[];

      setEventTypesList(types);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setStatus({
        type: 'error',
        message: 'Erreur lors du chargement des types d\'événements.',
      });
    }
  };

  useEffect(() => {
    loadEventTypes();
  }, []);

  const importEventTypes = async () => {
    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const eventTypesRef = collection(db, 'event_types');

      for (const eventType of eventTypes) {
        await setDoc(doc(eventTypesRef, eventType.code), {
          ...eventType,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      setStatus({
        type: 'success',
        message: `${eventTypes.length} types d'événements ont été importés avec succès.`,
      });
      await loadEventTypes();
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      setStatus({
        type: 'error',
        message: 'Une erreur est survenue lors de l\'importation des types d\'événements.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (type: EventType) => {
    setEditingType({ ...type });
    setEventTypesList(prev =>
      prev.map(t => (t.code === type.code ? { ...t, isEditing: true } : t))
    );
  };

  const cancelEditing = (code: string) => {
    setEditingType(null);
    setEventTypesList(prev =>
      prev.map(t => (t.code === code ? { ...t, isEditing: false } : t))
    );
  };

  const saveEdit = async (type: EventType) => {
    try {
      const eventTypesRef = collection(db, 'event_types');
      await setDoc(doc(eventTypesRef, type.code), {
        ...type,
        updated_at: new Date(),
      });

      setStatus({
        type: 'success',
        message: 'Type d\'événement mis à jour avec succès.',
      });
      await loadEventTypes();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setStatus({
        type: 'error',
        message: 'Erreur lors de la mise à jour du type d\'événement.',
      });
    }
  };

  const deleteEventType = async (code: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type d\'événement ?')) return;

    try {
      const eventTypesRef = collection(db, 'event_types');
      await deleteDoc(doc(eventTypesRef, code));

      setStatus({
        type: 'success',
        message: 'Type d\'événement supprimé avec succès.',
      });
      await loadEventTypes();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setStatus({
        type: 'error',
        message: 'Erreur lors de la suppression du type d\'événement.',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Gestion des types d'événements</h1>
        <p className="text-gray-600">
          Gérez les types d'événements disponibles dans l'application.
        </p>
      </div>

      <div className="space-y-6">
        {/* Bouton d'import */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium mb-2">Import initial</h2>
              <p className="text-sm text-gray-500">
                Importez les types d'événements prédéfinis dans la base de données.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={importEventTypes}
              disabled={isLoading}
            >
              {isLoading ? 'Importation...' : 'Importer les types d\'événements'}
            </Button>
          </div>
        </Card>

        {/* Tableau des types d'événements */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Types d'événements</h2>
            {status.type && (
              <div
                className={`text-sm mt-2 ${status.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {status.message}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Code</th>
                  <th className="text-left py-3 px-4">Label</th>
                  <th className="text-left py-3 px-4">Icône</th>
                  <th className="text-left py-3 px-4">Couleur</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {eventTypesList.map((type) => (
                  <tr key={type.code} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {type.isEditing ? (
                        <Input
                          value={editingType?.code || ''}
                          onChange={(e) =>
                            setEditingType(prev => ({ ...prev!, code: e.target.value }))
                          }
                          className="w-full"
                        />
                      ) : (
                        type.code
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {type.isEditing ? (
                        <Input
                          value={editingType?.label || ''}
                          onChange={(e) =>
                            setEditingType(prev => ({ ...prev!, label: e.target.value }))
                          }
                          className="w-full"
                        />
                      ) : (
                        type.label
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {type.isEditing ? (
                        <Input
                          value={editingType?.icon || ''}
                          onChange={(e) =>
                            setEditingType(prev => ({ ...prev!, icon: e.target.value }))
                          }
                          className="w-full"
                        />
                      ) : (
                        type.icon
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {type.isEditing ? (
                        <Input
                          type="color"
                          value={editingType?.color || '#000000'}
                          onChange={(e) =>
                            setEditingType(prev => ({ ...prev!, color: e.target.value }))
                          }
                          className="w-20 h-8 p-1"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          <span>{type.color}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {type.isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => saveEdit(editingType!)}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelEditing(type.code)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(type)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEventType(type.code)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
} 
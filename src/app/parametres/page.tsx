'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Layout } from '@/components/LayoutLogged';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';

interface UserProfile {
  displayName: string;
  email: string;
  createdAt: string;
  lastLogin: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Profil
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gérez vos informations personnelles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
            <CardDescription>
              Vos informations personnelles et préférences
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nom d&apos;affichage
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {profile?.displayName || 'Non défini'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Compte créé le
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('fr-FR')
                      : 'Non disponible'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Dernière connexion
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {profile?.lastLogin
                      ? new Date(profile.lastLogin).toLocaleDateString('fr-FR')
                      : 'Non disponible'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 
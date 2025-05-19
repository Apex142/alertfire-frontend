import { useState } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type KeyInfoStepProps = {
  control: Control<any>;
  errors: FieldErrors;
  setValue: (name: string, value: any) => void;
  getValues: (name: string) => any;
};

const SUGGESTED_LANGUAGES = [
  "Français", "Anglais", "Espagnol", "Allemand", "Italien", "Portugais", "Chinois", "Arabe"
];

const SUGGESTED_LICENSES = [
  "Permis A", "Permis B", "Permis C", "Permis D", "CACES", "Carte professionnelle", "Habilitation électrique"
];

const SUGGESTED_DIET = [
  "Végétarien", "Vegan", "Sans gluten", "Sans lactose", "Halal", "Casher", "Sans porc", "Allergie arachide"
];

export default function KeyInfoStep({ control, errors, setValue, getValues }: KeyInfoStepProps) {
  const [languageInput, setLanguageInput] = useState("");
  const [licenseInput, setLicenseInput] = useState("");
  const [dietInput, setDietInput] = useState("");

  const languages = getValues('languages') || [];
  const licenses = getValues('licenses') || [];
  const dietTags = getValues('dietaryRestrictions') || [];

  const filteredLanguages = SUGGESTED_LANGUAGES.filter(
    (lang) =>
      lang.toLowerCase().includes(languageInput.toLowerCase()) &&
      !languages.includes(lang)
  );

  const filteredLicenses = SUGGESTED_LICENSES.filter(
    (lic) =>
      lic.toLowerCase().includes(licenseInput.toLowerCase()) &&
      !licenses.includes(lic)
  );

  const filteredDiet = SUGGESTED_DIET.filter(
    (d) =>
      d.toLowerCase().includes(dietInput.toLowerCase()) &&
      !dietTags.includes(d)
  );

  const handleTagInput = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: 'languages' | 'licenses' | 'dietaryRestrictions',
    input: string,
    setInput: (value: string) => void,
    suggestions: string[]
  ) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      const newTag = input.trim();
      const currentTags = getValues(type) || [];
      if (!currentTags.includes(newTag)) {
        setValue(type, [...currentTags, newTag]);
        setInput('');
      }
    }
  };

  const removeTag = (tag: string, type: 'languages' | 'licenses' | 'dietaryRestrictions') => {
    const currentTags = getValues(type) || [];
    setValue(type, currentTags.filter((t: string) => t !== tag));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📖 Informations complémentaires</h2>

      {/* Langues parlées */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Langues parlées
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {languages.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <Button
                type="button"
                onClick={() => removeTag(tag, 'languages')}
                variant="ghost"
                size="sm"
                className="ml-2 p-0 h-auto hover:bg-transparent"
              >
                ×
              </Button>
            </span>
          ))}
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Appuyez sur Entrée pour ajouter"
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            onKeyDown={(e) => handleTagInput(e, 'languages', languageInput, setLanguageInput, SUGGESTED_LANGUAGES)}
          />
          {filteredLanguages.length > 0 && languageInput && (
            <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-10 max-h-40 overflow-auto">
              {filteredLanguages.map((lang) => (
                <li
                  key={lang}
                  className="px-4 py-2 cursor-pointer hover:bg-primary/10"
                  onClick={() => {
                    setValue('languages', [...languages, lang]);
                    setLanguageInput("");
                  }}
                >
                  {lang}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Licences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Permis
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {licenses.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <Button
                type="button"
                onClick={() => removeTag(tag, 'licenses')}
                variant="ghost"
                size="sm"
                className="ml-2 p-0 h-auto hover:bg-transparent"
              >
                ×
              </Button>
            </span>
          ))}
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Appuyez sur Entrée pour ajouter"
            value={licenseInput}
            onChange={(e) => setLicenseInput(e.target.value)}
            onKeyDown={(e) => handleTagInput(e, 'licenses', licenseInput, setLicenseInput, SUGGESTED_LICENSES)}
          />
          {filteredLicenses.length > 0 && licenseInput && (
            <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-10 max-h-40 overflow-auto">
              {filteredLicenses.map((lic) => (
                <li
                  key={lic}
                  className="px-4 py-2 cursor-pointer hover:bg-primary/10"
                  onClick={() => {
                    setValue('licenses', [...licenses, lic]);
                    setLicenseInput("");
                  }}
                >
                  {lic}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Restrictions alimentaires (optionnel) */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Restrictions alimentaires (optionnel)
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {dietTags.map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <Button
                type="button"
                onClick={() => removeTag(tag, 'dietaryRestrictions')}
                variant="ghost"
                size="sm"
                className="ml-2 p-0 h-auto hover:bg-transparent"
              >
                ×
              </Button>
            </span>
          ))}
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Appuyez sur Entrée pour ajouter"
            value={dietInput}
            onChange={(e) => setDietInput(e.target.value)}
            onKeyDown={(e) => handleTagInput(e, 'dietaryRestrictions', dietInput, setDietInput, SUGGESTED_DIET)}
          />
          {filteredDiet.length > 0 && dietInput && (
            <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-10 max-h-40 overflow-auto">
              {filteredDiet.map((d) => (
                <li
                  key={d}
                  className="px-4 py-2 cursor-pointer hover:bg-primary/10"
                  onClick={() => {
                    setValue('dietaryRestrictions', [...dietTags, d]);
                    setDietInput("");
                  }}
                >
                  {d}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 
import { useState, useRef, useEffect } from 'react';
import { Input } from './Input';
import { Search, ChevronDown, MapPin, Wrench, MessageSquare, BookOpen, Cpu, Volume2, Repeat, Video, Airplay, Radio, Monitor, Scissors, Trash2, Truck, Archive, Package, Star, GitBranch, Users, Handshake, Coffee, Utensils, Moon, ClipboardList, Sparkles, ArrowLeftCircle, HardDrive, Shield } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  icon?: string;
  color?: string;
}

interface SelectWithSearchProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Map des icônes Lucide
const iconMap: { [key: string]: React.ElementType } = {
  'map-pin': MapPin,
  'tool': Wrench,
  'message-square': MessageSquare,
  'book-open': BookOpen,
  'cpu': Cpu,
  'volume-2': Volume2,
  'repeat': Repeat,
  'video': Video,
  'airplay': Airplay,
  'broadcast': Radio,
  'monitor': Monitor,
  'wrench': Wrench,
  'scissors': Scissors,
  'trash-2': Trash2,
  'truck': Truck,
  'archive': Archive,
  'package': Package,
  'star': Star,
  'git-branch': GitBranch,
  'users': Users,
  'handshake': Handshake,
  'coffee': Coffee,
  'utensils': Utensils,
  'moon': Moon,
  'clipboard-list': ClipboardList,
  'broom': Sparkles,
  'arrow-left-circle': ArrowLeftCircle,
  'hard-drive': HardDrive,
  'shield': Shield
};

export default function SelectWithSearch({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  className = '',
  disabled = false,
}: SelectWithSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filtrer les options en fonction de la recherche
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  // Gérer la sélection d'une option
  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
    setSearch('');
  };

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mettre à jour l'option sélectionnée quand la valeur change
  useEffect(() => {
    const option = options.find(opt => opt.value === value);
    setSelectedOption(option || null);
  }, [value, options]);

  // Rendu de l'icône
  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {/* Input de sélection */}
      <div
        className={`flex items-center justify-between w-full px-3 py-2 border rounded-md cursor-pointer
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
          ${isOpen ? 'border-primary ring-1 ring-primary' : 'border-gray-300'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedOption ? (
          <div className="flex items-center gap-2">
            {selectedOption.icon && (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: selectedOption.color }}
              >
                {renderIcon(selectedOption.icon)}
              </div>
            )}
            <span>{selectedOption.label}</span>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''
            }`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Barre de recherche */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="pl-8"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Liste des options */}
          <div className="max-h-[160px] overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100
                    ${option.value === value ? 'bg-primary/10' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  {option.icon && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: option.color }}
                    >
                      {renderIcon(option.icon)}
                    </div>
                  )}
                  <span>{option.label}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">
                Aucun résultat trouvé
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
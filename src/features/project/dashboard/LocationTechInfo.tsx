interface LocationTechInfoProps {
  info: string;
}

export const LocationTechInfo = ({ info }: LocationTechInfoProps) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="font-semibold mb-2">Infos techniques du lieu</div>
    <div className="text-sm text-gray-700 whitespace-pre-line">{info}</div>
  </div>
); 
interface AppointmentBlockProps {
  date: Date;
  locationName: string;
  mapUrl: string; // Google Maps embed URL
}

export const AppointmentBlock = ({ date, locationName, mapUrl }: AppointmentBlockProps) => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
    <div className="font-semibold">{locationName}</div>
    <div className="text-sm text-gray-500">{date.toLocaleString('fr-FR')}</div>
    <iframe
      src={mapUrl}
      width="100%"
      height="180"
      className="rounded"
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
    />
  </div>
); 
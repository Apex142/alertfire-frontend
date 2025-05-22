import { CalendarClock, MapPin } from "lucide-react";

interface AppointmentBlockProps {
  date: Date;
  locationName: string;
  mapUrl: string; // Google Maps embed URL
}

interface AppointmentBlockProps {
  date: Date;
  locationName: string;
  mapUrl: string; // Google Maps embed URL
}

export const AppointmentBlock = ({
  date,
  locationName,
  mapUrl,
}: AppointmentBlockProps) => (
  <div className="bg-white rounded-xl shadow border border-slate-100 p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 w-full max-w-full">
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-primary/90 flex-shrink-0" />
      <span className="font-semibold text-gray-900 truncate text-sm sm:text-base">
        {locationName}
      </span>
    </div>
    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
      <CalendarClock className="w-4 h-4 text-primary/70 flex-shrink-0" />
      <span className="truncate">
        {date.toLocaleString("fr-FR", {
          dateStyle: "full",
          timeStyle: "short",
        })}
      </span>
    </div>
    <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <iframe
        src={mapUrl}
        width="100%"
        height="160"
        className="w-full aspect-[16/9] sm:aspect-[16/6] min-h-[120px] max-h-[220px]"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 0 }}
      />
    </div>
  </div>
);

import { AnimatePresence, motion } from "framer-motion";

interface DaySelectorProps {
  days: Date[];
  selected: Date;
  onDateChange: (date: Date) => void;
}

export const DaySelector = ({
  days,
  selected,
  onDateChange,
}: DaySelectorProps) => (
  <div
    className="flex gap-2 overflow-x-auto scrollbar-hide w-full py-4 px-1 jusify-center items-center"
    style={{ WebkitOverflowScrolling: "touch" }}
  >
    {days.map((day) => {
      const isSelected = selected.toDateString() === day.toDateString();
      return (
        <motion.button
          key={day.toISOString()}
          onClick={() => onDateChange(day)}
          className={
            "relative font-semibold outline-none border transition-all duration-150 flex-shrink-0 " +
            (isSelected
              ? "bg-primary-600 text-white border-primary-600 shadow-md"
              : "bg-gray-50 text-gray-800 hover:bg-primary-50 border-gray-200") +
            " px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base " +
            "min-w-[54px] sm:min-w-[92px] max-w-[62px] sm:max-w-none scroll-snap-align-center"
          }
          style={{
            width: "auto",
            whiteSpace: "nowrap",
            // fontSize un poil réduit sur mobile pour + de place
          }}
          whileTap={{ scale: 0.97 }}
          whileHover={
            isSelected
              ? undefined
              : { y: -1, boxShadow: "0 2px 10px 0 #468df012" }
          }
          tabIndex={0}
        >
          <span className="capitalize">
            {day.toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            })}
          </span>
          <AnimatePresence>
            {isSelected && (
              <motion.span
                layoutId="daySelectorActive"
                className="absolute inset-0 rounded-full ring-2 ring-primary-400 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              />
            )}
          </AnimatePresence>
        </motion.button>
      );
    })}
  </div>
);

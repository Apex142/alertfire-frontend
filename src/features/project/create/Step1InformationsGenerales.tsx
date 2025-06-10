"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { InputDate } from "@/components/ui/InputDate";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronRight,
  Paintbrush,
  TextCursorInput,
  Type,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateProjectStore } from "./useCreateProjectStore";

const COLORS = [
  "#AD1457",
  "#D50000",
  "#F4511E",
  "#E67C73",
  "#F6BF26",
  "#33B679",
  "#0B8043",
  "#039BE5",
  "#3F51B5",
  "#7986CB",
  "#8E24AA",
  "#616161",
];

const schema = z.object({
  projectName: z.string().min(2, "Le nom du project est requis"),
  acronym: z.string().optional(),
  status: z.enum(["Confirmé", "Optionnel"]),
  shortDescription: z.string().max(100, "Max 100 caractères").optional(),
  color: z.string().min(1, "Choisissez une couleur"),
  startDate: z.date({ required_error: "Date de début requise" }),
  endDate: z.date({ required_error: "Date de fin requise" }),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onNext: (data: FormValues) => void;
  initialDate?: Date;
}

export default function Step1InformationsGenerales({
  onNext,
  initialDate,
}: Props) {
  const { data, setData } = useCreateProjectStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
      status: "Confirmé",
      color: data.color || COLORS[0],
      startDate: initialDate
        ? new Date(initialDate)
        : data.startDate
        ? new Date(data.startDate)
        : undefined,
      endDate: initialDate
        ? new Date(initialDate)
        : data.endDate
        ? new Date(data.endDate)
        : undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setData({
      ...values,
      startDate: values.startDate,
      endDate: values.endDate,
    });
    onNext(values);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl px-6"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1 font-medium mb-1">
              <Type className="w-4 h-4" /> Titre du project *
            </label>
            <Input
              {...register("projectName")}
              autoFocus
              size="lg"
              error={errors.projectName?.message}
              placeholder="Ex: Tour de France"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 font-medium mb-1">
              <TextCursorInput className="w-4 h-4" /> Acronyme
            </label>
            <Input
              {...register("acronym")}
              placeholder="ex: TDF25"
              size="lg"
              error={errors.acronym?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1 font-medium mb-1">
              <CalendarDays className="w-4 h-4" /> Début
            </label>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <InputDate
                  value={field.value}
                  onChange={field.onChange}
                  initialValue={initialDate}
                  error={errors.startDate?.message}
                />
              )}
            />
          </div>
          <div>
            <label className="flex items-center gap-1 font-medium mb-1">
              <CalendarDays className="w-4 h-4" /> Fin
            </label>
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <InputDate
                  value={field.value}
                  onChange={field.onChange}
                  initialValue={initialDate}
                  error={errors.endDate?.message}
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1 font-medium mb-1">
              <Paintbrush className="w-4 h-4" /> Couleur *
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <label key={color} className="cursor-pointer">
                  <input
                    type="radio"
                    value={color}
                    {...register("color")}
                    className="hidden"
                  />
                  <span
                    className={`w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-1 ${
                      color === watch("color") ? "ring-2 ring-primary" : ""
                    }`}
                    style={{ background: color }}
                  />
                </label>
              ))}
            </div>
            {errors.color && (
              <div className="text-red-500 text-xs mt-1">
                {errors.color.message}
              </div>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">Statut *</label>
            <div className="flex gap-2">
              {(["Confirmé", "Optionnel"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`flex-1 px-3 py-2 rounded font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    watch("status") === status
                      ? status === "Confirmé"
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-yellow-400 text-white border-yellow-400"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => setValue("status", status)}
                >
                  {status}
                </button>
              ))}
            </div>
            {errors.status && (
              <div className="text-red-500 text-xs mt-1">
                {errors.status.message}
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            className="flex items-center gap-2"
          >
            Continuer <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

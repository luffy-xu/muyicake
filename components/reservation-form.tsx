"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import type { Product } from "@/lib/products";
import {
  reservationCreateSchema,
  type Reservation,
  type ReservationCreateFormValues,
  type ReservationCreateInput,
} from "@/lib/validations";
import { SuccessModal } from "@/components/success-modal";

export function ReservationForm({
  mode,
  selectedProduct,
}: {
  mode: "qixi" | "custom";
  selectedProduct: Product;
}) {
  const [success, setSuccess] = useState<Reservation | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReservationCreateFormValues, unknown, ReservationCreateInput>({
    resolver: zodResolver(reservationCreateSchema),
    defaultValues: {
      sourcePage: mode,
      reservationCategory:
        mode === "qixi"
          ? "qixi"
          : selectedProduct.category === "birthday"
            ? "birthday"
            : "custom",
      productCode: selectedProduct.code,
      productName: selectedProduct.name,
      basePrice: selectedProduct.basePrice,
      currency: "SGD",
      isInterestedInMembership: false,
      website: "",
      whatsapp: "",
      customerName: "",
      deliveryDate: "",
      deliveryArea: "",
      deliveryAddress: "",
      confirmedDeliverySlot: "",
      cakeMessage: "",
      recipientName: "",
      age: "",
      flavourPreference: "",
      preferredColor: "",
      stylePreference: "",
      budgetRange: "",
      photoService: "",
      referenceImageUrl: "",
      allergyNote: "",
      notes: "",
    },
  });

  async function onSubmit(input: ReservationCreateInput) {
    setServerError(null);
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = (await response.json()) as
      | { reservation: Reservation }
      | { error: string };

    if (!response.ok || !("reservation" in payload)) {
      setServerError("We could not save the reservation. Please check the form.");
      return;
    }

    setSuccess(payload.reservation);
    reset();
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-[2rem] border border-[#FFE8DC] bg-[#FFFCF7] p-5 shadow-lg shadow-[#E97796]/10 md:p-7"
      >
        <input type="hidden" {...register("sourcePage")} />
        <input type="hidden" {...register("reservationCategory")} />
        <input type="hidden" {...register("productCode")} />
        <input type="hidden" {...register("productName")} />
        <input type="hidden" {...register("basePrice", { valueAsNumber: true })} />
        <input type="hidden" {...register("currency")} />
        <input className="hidden" tabIndex={-1} autoComplete="off" {...register("website")} />

        <div className="mb-5 rounded-2xl bg-[#FFF7EC] p-4">
          <p className="text-sm font-semibold text-[#D8A95D]">Selected cake</p>
          <p className="mt-1 text-lg font-semibold">{selectedProduct.name}</p>
          <p className="text-[#E97796]">{selectedProduct.priceLabel}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="WhatsApp number" error={errors.whatsapp?.message}>
            <input
              {...register("whatsapp")}
              placeholder="+65 9123 4567"
              className="input"
              inputMode="tel"
            />
          </Field>
          <Field label="Your name" error={errors.customerName?.message}>
            <input {...register("customerName")} placeholder="Name" className="input" />
          </Field>
          <Field label="Delivery date" error={errors.deliveryDate?.message}>
            <input {...register("deliveryDate")} type="date" className="input" />
          </Field>
          <Field label="Delivery area" error={errors.deliveryArea?.message}>
            <input
              {...register("deliveryArea")}
              placeholder="Tampines, Orchard, Jurong..."
              className="input"
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Cake message">
            <input {...register("cakeMessage")} placeholder="Happy Birthday" className="input" />
          </Field>
          <Field label="Flavour preference">
            <input {...register("flavourPreference")} placeholder="Less sweet, strawberry..." className="input" />
          </Field>
          <Field label="Preferred color">
            <input {...register("preferredColor")} placeholder="Blush pink, cream..." className="input" />
          </Field>
          <Field label="Budget range">
            <input {...register("budgetRange")} placeholder="S$100-S$150" className="input" />
          </Field>
        </div>

        <Field label="Notes" className="mt-4">
          <textarea
            {...register("notes")}
            rows={4}
            placeholder="Tell us the occasion, style, delivery details, or allergies."
            className="input resize-none"
          />
        </Field>

        <label className="mt-4 flex items-center gap-3 text-sm text-[#7A6258]">
          <input type="checkbox" {...register("isInterestedInMembership")} />
          I am interested in future member updates.
        </label>

        {serverError ? <p className="mt-4 text-sm text-red-600">{serverError}</p> : null}

        <button
          disabled={isSubmitting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#E97796] px-5 py-3 font-semibold text-white shadow-md shadow-[#E97796]/20 disabled:opacity-60"
        >
          <Send size={18} />
          {isSubmitting ? "Submitting..." : "Submit reservation"}
        </button>
        <p className="mt-3 text-center text-xs text-[#7A6258]">
          Reservation only. No payment or cart is created.
        </p>
      </form>
      {success ? (
        <SuccessModal reservation={success} onClose={() => setSuccess(null)} />
      ) : null}
    </>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

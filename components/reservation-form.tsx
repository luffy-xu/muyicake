"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import type { Locale, getDictionary } from "@/lib/i18n";
import type { Product } from "@/lib/products";
import {
  reservationCreateSchema,
  type Reservation,
  type ReservationCreateFormValues,
  type ReservationCreateInput,
} from "@/lib/validations";
import { SuccessModal } from "@/components/success-modal";

export function ReservationForm({
  locale,
  dictionary,
  mode,
  selectedProduct,
}: {
  locale: Locale;
  dictionary: ReturnType<typeof getDictionary>;
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
    setValue,
  } = useForm<ReservationCreateFormValues, unknown, ReservationCreateInput>({
    resolver: zodResolver(reservationCreateSchema),
    defaultValues: {
      locale,
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
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      referrer: "",
      landingPath: "",
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setValue("utmSource", params.get("utm_source") ?? "");
    setValue("utmMedium", params.get("utm_medium") ?? "");
    setValue("utmCampaign", params.get("utm_campaign") ?? "");
    setValue("referrer", document.referrer);
    setValue("landingPath", `${window.location.pathname}${window.location.search}`);
  }, [setValue]);

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
      setServerError(dictionary.reservation.form.serverError);
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
        <input type="hidden" {...register("locale")} />
        <input type="hidden" {...register("reservationCategory")} />
        <input type="hidden" {...register("productCode")} />
        <input type="hidden" {...register("productName")} />
        <input type="hidden" {...register("basePrice", { valueAsNumber: true })} />
        <input type="hidden" {...register("currency")} />
        <input type="hidden" {...register("utmSource")} />
        <input type="hidden" {...register("utmMedium")} />
        <input type="hidden" {...register("utmCampaign")} />
        <input type="hidden" {...register("referrer")} />
        <input type="hidden" {...register("landingPath")} />
        <input className="hidden" tabIndex={-1} autoComplete="off" {...register("website")} />

        <div className="mb-5 rounded-2xl bg-[#FFF7EC] p-4">
          <p className="text-sm font-semibold text-[#D8A95D]">{dictionary.reservation.form.selectedCake}</p>
          <p className="mt-1 text-lg font-semibold">{dictionary.products[selectedProduct.code].name}</p>
          <p className="text-[#E97796]">{selectedProduct.priceLabel}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={dictionary.reservation.form.whatsapp} error={formatError(errors.whatsapp?.message, dictionary)}>
            <input
              {...register("whatsapp")}
              placeholder="+65 9123 4567"
              className="input"
              inputMode="tel"
            />
          </Field>
          <Field label={dictionary.reservation.form.name} error={formatError(errors.customerName?.message, dictionary)}>
            <input {...register("customerName")} placeholder={dictionary.reservation.form.namePlaceholder} className="input" />
          </Field>
          <Field label={dictionary.reservation.form.deliveryDate} error={formatError(errors.deliveryDate?.message, dictionary)}>
            <input {...register("deliveryDate")} type="date" className="input" />
          </Field>
          <Field label={dictionary.reservation.form.deliveryArea} error={formatError(errors.deliveryArea?.message, dictionary)}>
            <input
              {...register("deliveryArea")}
              placeholder={dictionary.reservation.form.deliveryAreaPlaceholder}
              className="input"
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label={dictionary.reservation.form.cakeMessage}>
            <input {...register("cakeMessage")} placeholder={dictionary.reservation.form.cakeMessagePlaceholder} className="input" />
          </Field>
          <Field label={dictionary.reservation.form.flavour}>
            <input {...register("flavourPreference")} placeholder={dictionary.reservation.form.flavourPlaceholder} className="input" />
          </Field>
          <Field label={dictionary.reservation.form.color}>
            <input {...register("preferredColor")} placeholder={dictionary.reservation.form.colorPlaceholder} className="input" />
          </Field>
          <Field label={dictionary.reservation.form.budget}>
            <input {...register("budgetRange")} placeholder="S$100-S$150" className="input" />
          </Field>
        </div>

        <Field label={dictionary.reservation.form.notes} className="mt-4">
          <textarea
            {...register("notes")}
            rows={4}
            placeholder={dictionary.reservation.form.notesPlaceholder}
            className="input resize-none"
          />
        </Field>

        <label className="mt-4 flex items-center gap-3 text-sm text-[#7A6258]">
          <input type="checkbox" {...register("isInterestedInMembership")} />
          {dictionary.reservation.form.membership}
        </label>

        {serverError ? <p className="mt-4 text-sm text-red-600">{serverError}</p> : null}

        <button
          disabled={isSubmitting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#E97796] px-5 py-3 font-semibold text-white shadow-md shadow-[#E97796]/20 disabled:opacity-60"
        >
          <Send size={18} />
          {isSubmitting ? dictionary.reservation.form.submitting : dictionary.reservation.form.submit}
        </button>
        <p className="mt-3 text-center text-xs text-[#7A6258]">
          {dictionary.reservation.form.noPayment}
        </p>
      </form>
      {success ? (
        <SuccessModal reservation={success} dictionary={dictionary} locale={locale} onClose={() => setSuccess(null)} />
      ) : null}
    </>
  );
}

function formatError(message: string | undefined, dictionary: ReturnType<typeof getDictionary>) {
  return message ? dictionary.reservation.form.validationError : undefined;
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

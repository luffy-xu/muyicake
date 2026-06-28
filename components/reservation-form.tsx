"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SelectedCakeStyle } from "@/components/cake-style-drawer";
import type { Locale, getDictionary } from "@/lib/i18n";
import type { Product } from "@/lib/products";
import {
  extractSingaporePostalCode,
  getMinimumDeliveryDate,
  reservationCreateSchema,
  type Reservation,
  type ReservationCreateFormValues,
  type ReservationCreateInput,
} from "@/lib/validations";
import { SuccessModal } from "@/components/success-modal";

const phoneCountryCodes = [
  { value: "65", label: "SG +65" },
  { value: "60", label: "MY +60" },
  { value: "62", label: "ID +62" },
  { value: "66", label: "TH +66" },
  { value: "84", label: "VN +84" },
  { value: "63", label: "PH +63" },
  { value: "86", label: "CN +86" },
  { value: "custom", label: "Custom" },
] as const;

export function ReservationForm({
  locale,
  dictionary,
  mode,
  selectedProduct,
  selectedCakeStyle,
  onChangeCakeStyle,
}: {
  locale: Locale;
  dictionary: ReturnType<typeof getDictionary>;
  mode: "qixi" | "custom";
  selectedProduct: Product;
  selectedCakeStyle?: SelectedCakeStyle | null;
  onChangeCakeStyle?: () => void;
}) {
  const [success, setSuccess] = useState<Reservation | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [phoneCountryCode, setPhoneCountryCode] = useState("65");
  const [customPhoneCountryCode, setCustomPhoneCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [minimumDeliveryDate] = useState(() => getMinimumDeliveryDate());
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
      selectedCollectionId: selectedCakeStyle?.selectedCollectionId ?? "",
      selectedStyleId: selectedCakeStyle?.selectedStyleId ?? "",
      selectedStyleName: selectedCakeStyle?.selectedStyleName ?? "",
      selectedSizeOptionId: selectedCakeStyle?.selectedSizeOptionId ?? "",
      selectedSizeLabel: selectedCakeStyle?.selectedSizeLabel ?? "",
      selectedPrice: selectedCakeStyle?.selectedPrice,
      isInterestedInMembership: false,
      website: "",
      whatsapp: "65",
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
    setValue("selectedCollectionId", selectedCakeStyle?.selectedCollectionId ?? "");
    setValue("selectedStyleId", selectedCakeStyle?.selectedStyleId ?? "");
    setValue("selectedStyleName", selectedCakeStyle?.selectedStyleName ?? "");
    setValue("selectedSizeOptionId", selectedCakeStyle?.selectedSizeOptionId ?? "");
    setValue("selectedSizeLabel", selectedCakeStyle?.selectedSizeLabel ?? "");
    setValue("selectedPrice", selectedCakeStyle?.selectedPrice);
  }, [selectedCakeStyle, setValue]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setValue("utmSource", params.get("utm_source") ?? "");
    setValue("utmMedium", params.get("utm_medium") ?? "");
    setValue("utmCampaign", params.get("utm_campaign") ?? "");
    setValue("referrer", document.referrer);
    setValue("landingPath", `${window.location.pathname}${window.location.search}`);
  }, [setValue]);

  // Pre-fill WhatsApp from localStorage and fetch name/address from last reservation
  useEffect(() => {
    let savedCc: string | null = null;
    let savedNum: string | null = null;
    try {
      savedCc = localStorage.getItem("muyi_wa_cc");
      savedNum = localStorage.getItem("muyi_wa_num");
    } catch {}

    if (!savedCc || !savedNum) return;

    const knownCodes = ["65", "60", "62", "66", "84", "63", "86"];
    if (knownCodes.includes(savedCc)) {
      setPhoneCountryCode(savedCc);
    } else {
      setPhoneCountryCode("custom");
      setCustomPhoneCountryCode(savedCc);
    }
    setPhoneNumber(savedNum);

    const fullWa = `${savedCc} ${savedNum}`;
    fetch(`/api/reservations/prefill?whatsapp=${encodeURIComponent(fullWa)}`)
      .then((r) => r.json() as Promise<{ prefill: { customerName: string; deliveryAddress: string | null } | null }>)
      .then((data) => {
        if (data.prefill?.customerName) setValue("customerName", data.prefill.customerName);
        if (data.prefill?.deliveryAddress) setValue("deliveryAddress", data.prefill.deliveryAddress);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const countryCode =
      phoneCountryCode === "custom"
        ? customPhoneCountryCode.replace(/\D/g, "")
        : phoneCountryCode;
    setValue("whatsapp", `${countryCode} ${phoneNumber}`.trim(), { shouldValidate: true });
  }, [customPhoneCountryCode, phoneCountryCode, phoneNumber, setValue]);

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

    try {
      const ccToSave = phoneCountryCode === "custom" ? customPhoneCountryCode.replace(/\D/g, "") : phoneCountryCode;
      localStorage.setItem("muyi_wa_cc", ccToSave);
      localStorage.setItem("muyi_wa_num", phoneNumber);
    } catch {}

    setSuccess(payload.reservation);
    reset();
    setPhoneCountryCode("65");
    setCustomPhoneCountryCode("");
    setPhoneNumber("");
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
        <input type="hidden" {...register("selectedCollectionId")} />
        <input type="hidden" {...register("selectedStyleId")} />
        <input type="hidden" {...register("selectedStyleName")} />
        <input type="hidden" {...register("selectedSizeOptionId")} />
        <input type="hidden" {...register("selectedSizeLabel")} />
        <input type="hidden" {...register("selectedPrice")} />
        <input type="hidden" {...register("utmSource")} />
        <input type="hidden" {...register("utmMedium")} />
        <input type="hidden" {...register("utmCampaign")} />
        <input type="hidden" {...register("referrer")} />
        <input type="hidden" {...register("landingPath")} />
        <input type="hidden" {...register("whatsapp")} />
        <input type="hidden" {...register("deliveryArea")} />
        <input className="hidden" tabIndex={-1} autoComplete="off" {...register("website")} />

        <div className="mb-5 overflow-hidden rounded-2xl border border-[#FFE8DC]">
          <div className="flex items-center justify-between bg-[#FFE8DC]/50 px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#D8A95D]">
              {dictionary.reservation.form.selectedCake}
            </p>
            {onChangeCakeStyle ? (
              <button
                type="button"
                onClick={onChangeCakeStyle}
                className="rounded-full bg-[#FFFCF7] px-3 py-1 text-xs font-semibold text-[#6B3F2A] shadow-sm hover:bg-white"
              >
                {dictionary.catalog.changeSelection}
              </button>
            ) : null}
          </div>
          <div className="bg-[#FFF7EC] p-4">
            <p className="font-semibold text-[#2B1E1A]">{dictionary.products[selectedProduct.code].name}</p>
            <p className="font-semibold text-[#E97796]">{selectedProduct.priceLabel}</p>
            {selectedCakeStyle ? (
              <div className="mt-3 rounded-xl bg-[#FFFCF7] p-3 text-sm leading-6">
                <p>
                  <span className="font-semibold text-[#6B3F2A]">{dictionary.catalog.selectedStyle}: </span>
                  {selectedCakeStyle.selectedStyleName}
                </p>
                <p>
                  <span className="font-semibold text-[#6B3F2A]">{dictionary.catalog.selectedSize}: </span>
                  {selectedCakeStyle.selectedSizeLabel}
                </p>
                <p>
                  <span className="font-semibold text-[#6B3F2A]">{dictionary.catalog.selectedPrice}: </span>
                  S${selectedCakeStyle.selectedPrice}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={dictionary.reservation.form.whatsapp} required error={formatError(errors.whatsapp?.message, dictionary)}>
            <div className="flex gap-2">
              <select
                value={phoneCountryCode}
                onChange={(event) => setPhoneCountryCode(event.target.value)}
                className="input w-32 shrink-0"
                aria-label={dictionary.reservation.form.whatsappCountryCode}
              >
                {phoneCountryCodes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {phoneCountryCode === "custom" ? (
                <input
                  value={customPhoneCountryCode}
                  onChange={(event) => setCustomPhoneCountryCode(event.target.value.replace(/\D/g, ""))}
                  placeholder="65"
                  className="input w-20 shrink-0"
                  inputMode="numeric"
                  aria-label={dictionary.reservation.form.whatsappCustomCountryCode}
                />
              ) : null}
              <input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="9123 4567"
                className="input min-w-0 flex-1"
                inputMode="tel"
              />
            </div>
          </Field>
          <Field label={dictionary.reservation.form.name} required error={formatError(errors.customerName?.message, dictionary)}>
            <input {...register("customerName")} placeholder={dictionary.reservation.form.namePlaceholder} className="input" />
          </Field>
          <Field label={dictionary.reservation.form.deliveryDate} required error={formatError(errors.deliveryDate?.message, dictionary)}>
            <input {...register("deliveryDate")} type="date" min={minimumDeliveryDate} className="input" />
          </Field>
          <Field label={dictionary.reservation.form.deliveryAddress} required error={formatError(errors.deliveryAddress?.message, dictionary)}>
            <textarea
              {...register("deliveryAddress", {
                onChange: (event) => {
                  setValue("deliveryArea", extractSingaporePostalCode(event.target.value) ?? "");
                },
              })}
              rows={3}
              placeholder={dictionary.reservation.form.deliveryAddressPlaceholder}
              className="input resize-none"
            />
          </Field>
        </div>

        {/* Optional fields divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "rgba(247,182,200,0.32)" }} />
          <span className="text-[11px] text-[#9C8A82]">{dictionary.reservation.form.optionalDivider}</span>
          <div className="h-px flex-1" style={{ background: "rgba(247,182,200,0.32)" }} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label={dictionary.reservation.form.cakeMessage}>
            <input {...register("cakeMessage")} placeholder={dictionary.reservation.form.cakeMessagePlaceholder} className="input" />
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

        {serverError ? <p className="mt-4 text-sm text-red-600">{serverError}</p> : null}

        <button
          disabled={isSubmitting}
          className="mt-6 w-full rounded-full font-semibold text-white disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg,#E97796,#C85A77)",
            padding: "17px 24px",
            fontSize: "17px",
            boxShadow: "0 8px 26px rgba(233,119,150,0.46)",
          }}
        >
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
  required,
  error,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[12.5px] font-semibold text-[#2B1E1A]">
        {label}
        {required && <span className="ml-0.5 text-[#E97796]"> *</span>}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

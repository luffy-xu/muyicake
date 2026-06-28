import type { Metadata } from "next";
import { ReservationPage } from "@/components/reservation-page";
import { getDictionary } from "@/lib/i18n";
import { customProducts } from "@/lib/products";

const dictionary = getDictionary("en");

export const metadata: Metadata = {
  title: dictionary.seo.customTitle,
  description: dictionary.seo.customDescription,
  alternates: {
    canonical: "/en/custom",
    languages: {
      zh: "/custom",
      en: "/en/custom",
    },
  },
};

export default function EnglishCustomPage() {
  return (
    <ReservationPage
      locale="en"
      mode="custom"
      dictionary={dictionary}
      products={customProducts}
    />
  );
}

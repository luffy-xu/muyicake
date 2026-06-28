import type { Metadata } from "next";
import { ReservationPage } from "@/components/reservation-page";
import { getDictionary } from "@/lib/i18n";
import { customProducts } from "@/lib/products";

const dictionary = getDictionary("zh");

export const metadata: Metadata = {
  title: dictionary.seo.customTitle,
  description: dictionary.seo.customDescription,
  alternates: {
    canonical: "/custom",
    languages: {
      zh: "/custom",
      en: "/en/custom",
    },
  },
};

export default function CustomPage() {
  return (
    <ReservationPage
      locale="zh"
      mode="custom"
      dictionary={dictionary}
      products={customProducts}
    />
  );
}

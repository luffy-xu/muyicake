import type { Metadata } from "next";
import { ReservationPage } from "@/components/reservation-page";
import { getDictionary } from "@/lib/i18n";
import { qixiProducts } from "@/lib/products";

const dictionary = getDictionary("en");

export const metadata: Metadata = {
  title: dictionary.seo.qixiTitle,
  description: dictionary.seo.qixiDescription,
  alternates: {
    canonical: "/en/qixi",
    languages: {
      zh: "/qixi",
      en: "/en/qixi",
    },
  },
};

export default function EnglishQixiPage() {
  return (
    <ReservationPage
      locale="en"
      mode="qixi"
      dictionary={dictionary}
      products={qixiProducts}
    />
  );
}

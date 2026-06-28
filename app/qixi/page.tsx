import type { Metadata } from "next";
import { ReservationPage } from "@/components/reservation-page";
import { getDictionary } from "@/lib/i18n";
import { qixiProducts } from "@/lib/products";

const dictionary = getDictionary("zh");

export const metadata: Metadata = {
  title: dictionary.seo.qixiTitle,
  description: dictionary.seo.qixiDescription,
  alternates: {
    canonical: "/qixi",
    languages: {
      zh: "/qixi",
      en: "/en/qixi",
    },
  },
};

export default function QixiPage() {
  return (
    <ReservationPage
      locale="zh"
      mode="qixi"
      dictionary={dictionary}
      products={qixiProducts}
    />
  );
}

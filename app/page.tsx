import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { getDictionary } from "@/lib/i18n";

const dictionary = getDictionary("zh");

export const metadata: Metadata = {
  title: dictionary.seo.homeTitle,
  description: dictionary.seo.homeDescription,
  alternates: {
    canonical: "/",
    languages: {
      zh: "/",
      en: "/en",
    },
  },
};

export default function Home() {
  return <HomePage locale="zh" dictionary={dictionary} />;
}

import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { getDictionary } from "@/lib/i18n";

const dictionary = getDictionary("en");

export const metadata: Metadata = {
  title: dictionary.seo.homeTitle,
  description: dictionary.seo.homeDescription,
  alternates: {
    canonical: "/en",
    languages: {
      zh: "/",
      en: "/en",
    },
  },
};

export default function EnglishHome() {
  return <HomePage locale="en" dictionary={dictionary} />;
}

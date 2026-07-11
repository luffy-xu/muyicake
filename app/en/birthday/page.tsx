import type { Metadata } from "next";
import { BirthdayStorybookPage } from "@/components/birthday-storybook-page";
import { getDictionary } from "@/lib/i18n";
import { loadStorybookChapters } from "@/lib/storybook-server";

const dictionary = getDictionary("en");

export const metadata: Metadata = {
  title: dictionary.seo.storybookTitle,
  description: dictionary.seo.storybookDescription,
  alternates: {
    canonical: "/en/birthday",
    languages: {
      zh: "/birthday",
      en: "/en/birthday",
    },
  },
};

export default async function BirthdayPageEn() {
  const [boyChapters, girlChapters] = await Promise.all([
    loadStorybookChapters("en", "birthday-boy"),
    loadStorybookChapters("en", "birthday-girl"),
  ]);

  return (
    <BirthdayStorybookPage
      locale="en"
      dictionary={dictionary}
      boyChapters={boyChapters}
      girlChapters={girlChapters}
    />
  );
}

import type { Metadata } from "next";
import { BirthdayStorybookPage } from "@/components/birthday-storybook-page";
import { getDictionary } from "@/lib/i18n";
import { loadStorybookChapters } from "@/lib/storybook-server";

const dictionary = getDictionary("zh");

export const metadata: Metadata = {
  title: dictionary.seo.storybookTitle,
  description: dictionary.seo.storybookDescription,
  alternates: {
    canonical: "/birthday",
    languages: {
      zh: "/birthday",
      en: "/en/birthday",
    },
  },
};

export default async function BirthdayPage() {
  const [boyChapters, girlChapters] = await Promise.all([
    loadStorybookChapters("zh", "birthday-boy"),
    loadStorybookChapters("zh", "birthday-girl"),
  ]);

  return (
    <BirthdayStorybookPage
      locale="zh"
      dictionary={dictionary}
      boyChapters={boyChapters}
      girlChapters={girlChapters}
    />
  );
}

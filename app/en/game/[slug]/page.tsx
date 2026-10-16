import type { Metadata } from "next";
import { WildlifeGame } from "@/components/game/wildlife-game";
import { getDictionary } from "@/lib/i18n";

const dictionary = getDictionary("en");

type Props = { params: Promise<{ slug: string }> };

function roomName(slug: string) {
  try {
    return decodeURIComponent(slug).slice(0, 40);
  } catch {
    return slug.slice(0, 40);
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const room = roomName((await params).slug);
  return {
    title: dictionary.game.seoTitle,
    description: dictionary.game.seoDescription,
    robots: { index: false },
    alternates: {
      canonical: `/en/game/${room}`,
      languages: { zh: `/game/${room}`, en: `/en/game/${room}` },
    },
  };
}

export default async function GamePageEn({ params }: Props) {
  const room = roomName((await params).slug);
  return <WildlifeGame locale="en" dictionary={dictionary} room={room} />;
}

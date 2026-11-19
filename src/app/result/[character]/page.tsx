import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { editorialCharacters, editorialCopy, isEditorialCharacter } from "@/data/editorial";
import { ResultReading } from "./ResultReading";

type ResultPageProps = { params: Promise<{ character: string }> };

export function generateStaticParams() {
  return Object.keys(editorialCharacters).map((character) => ({ character }));
}

export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { character } = await params;
  if (!isEditorialCharacter(character)) notFound();

  const { name, frontLine } = editorialCharacters[character];
  return {
    title: `${name} · ${editorialCopy.homeTitle}`,
    description: frontLine,
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { character } = await params;
  if (!isEditorialCharacter(character)) notFound();

  return <ResultReading characterId={character} />;
}

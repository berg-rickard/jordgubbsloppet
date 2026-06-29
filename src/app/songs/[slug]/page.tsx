import type { Metadata } from 'next';
import { getSong, getSongSlugs } from '@/lib/songs';
import { ChordSheet } from '@/components/ChordSheet';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getSongSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const song = getSong(slug);
  return { title: song.title };
}

export default async function SongPage({ params }: Props) {
  const { slug } = await params;
  const song = getSong(slug);

  return (
    <ChordSheet
      title={song.title}
      artist={song.artist}
      originalKey={song.key}
      lines={song.lines}
    />
  );
}

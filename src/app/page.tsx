import Link from 'next/link';
import { getAllSongs } from '@/lib/songs';

export default function IndexPage() {
  const songs = getAllSongs();

  return (
    <main className="index-main">
      <header className="index-header">
        <h1 className="index-title">Jordgubbsloppet</h1>
        <p className="index-count">
          {songs.length} {songs.length === 1 ? 'song' : 'songs'}
        </p>
      </header>

      <ul className="index-list">
        {songs.map((song) => (
          <li key={song.slug}>
            <Link href={`/songs/${song.slug}`} className="index-row">
              <span className="index-row-left">
                <span className="index-row-title">{song.title}</span>
                <span className="index-row-artist">{song.artist}</span>
              </span>
              <span className="index-key-badge">{song.key}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

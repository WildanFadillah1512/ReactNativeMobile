export type Film = {
  id: string;
  title: string;
  original_title: string;
  description: string;
  director: string;
  producer: string;
  release_date: string;
  running_time: string;
  rt_score: string; // <-- (DIKEMBALIKAN) menjadi string
  image?: string;
  movie_banner?: string;
};

// (DIKEMBALIKAN) ke API lama
export async function getFilms(): Promise<Film[]> {
  try {
    const res = await fetch('https://ghibliapi.vercel.app/films');
    if (!res.ok) throw new Error(`Failed to fetch films: ${res.statusText}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching films:', error);
    // (Pesan error ini yang Anda lihat di screenshot)
    throw new Error('Unable to load films. Please try again later.');
  }
}

// (DIKEMBALIKAN) ke API lama
export async function getFilmById(id: string): Promise<Film> {
  try {
    const res = await fetch(`https://ghibliapi.vercel.app/films/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch film with ID ${id}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`❌ Error fetching film ${id}:`, error);
    throw new Error('Unable to load film details.');
  }
}

// (DIKEMBALIKAN) ke tipe Song lama
export type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
  preview: string; // <-- (DIKEMBALIKAN) ke preview
  cover: string;
};

// (DIKEMBALIKAN) ke getSongs lama
export async function getSongs(): Promise<Song[]> {
  try {
    const res = await fetch('https://api.lyrics.ovh/suggest/eminem');
    if (!res.ok) throw new Error(`Failed to fetch songs: ${res.statusText}`);

    const json = await res.json();

    return json.data.map((item: any) => ({
      id: item.id,
      title: item.title,
      artist: item.artist?.name ?? 'Unknown Artist',
      album: item.album?.title ?? 'Unknown Album',
      preview: item.preview ?? '',
      cover: item.album?.cover_medium ?? '',
    }));
  } catch (error) {
    console.error('❌ Error fetching songs:', error);
    throw new Error('Unable to load songs. Please try again later.');
  }
}


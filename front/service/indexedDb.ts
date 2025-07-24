import { openDB } from 'idb';

const DB_NAME = 'music-db';
const SONGS_STORE = 'songs';
const USER_META_STORE = 'userPermissionsAndSongs';

export async function getDb() {
  return await openDB(DB_NAME, 2, {
    upgrade(db) {
      // Store de músicas completas
      if (!db.objectStoreNames.contains(SONGS_STORE)) {
        const store = db.createObjectStore(SONGS_STORE, { keyPath: 'songId' });
        store.createIndex('songId', 'songId', { unique: true });
      }

      // Novo store para lista + permissões
      if (!db.objectStoreNames.contains(USER_META_STORE)) {
        db.createObjectStore(USER_META_STORE, { keyPath: 'key' });
      }
    }
  });
}

// ---------------------------
// SONGS: músicas completas
// ---------------------------

export async function saveSongOffline(song: any) {
  const db = await getDb();
  await db.put(SONGS_STORE, song);
}

export async function getOfflineSongs(): Promise<any[]> {
  const db = await getDb();
  return await db.getAll(SONGS_STORE);
}

export async function getOfflineSong(songId: number): Promise<any | undefined> {
  const db = await getDb();
  return await db.getFromIndex(SONGS_STORE, 'songId', songId);
}

export async function deleteOfflineSong(songId: number) {
  const db = await getDb();
  await db.delete(SONGS_STORE, songId);
}

// ---------------------------
// USER + SONG LIST SIMPLES
// ---------------------------

export async function saveUserPermissionsAndSongs(data: {
  songs: any[];
  isAdmin: boolean;
  canAddSong: boolean;
  canSyncCifra: boolean;
}) {
  const db = await getDb();
  await db.put(USER_META_STORE, { key: 'main', ...data });
}

type UserPermissionsAndSongs = {
  songs: any[];
  isAdmin: boolean;
  canAddSong: boolean;
  canSyncCifra: boolean;
};

export async function getUserPermissionsAndSongs(): Promise<UserPermissionsAndSongs | undefined> {
  const db = await getDb();
  return await db.get('userPermissionsAndSongs', 'main');
}

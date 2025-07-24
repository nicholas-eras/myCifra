type SongSummary = {
  id: number;
  name: string;
  artist: string;
  createdByUser: boolean;
};

type AllSongResponse = {
  isAdmin: boolean;
  songs: SongSummary[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const songService = {
  async createSong(payload: any): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/song`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.log('Failed to create song');
      }

      const data: any = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating song:', error);
      throw error;
    }
  },

  async updateSong(id: number, payload: any): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/song/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.log('Failed to create song');
      }

      const data: any = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating song:', error);
      throw error;
    }
  },

  async getAllSong(): Promise<AllSongResponse | null> {
    try {
      const response = await fetch(`${API_URL}/song`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorJson = await response.json();
        console.warn("Erro ao buscar músicas:", errorJson);
        return null; 
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Falha no getAllSong:', error);
      return null;
    }
  },

  async getSongById(id: number): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/song/${id}`, { credentials: 'include' });
      if (!response.ok) {
        console.log(`Failed to fetch song with ID ${id}`);
        return null;
      }

      const data: any = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching song with ID ${id}:`, error);
      return null;
    }
  },

  async updateSongChords(id: number, payload: any): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/song/${id}/chords`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.log(`Failed to update song with ID ${id}`);
      }

      const data: any = await response.json();
      return data;
    } catch (error) {
      console.error(`Error updating song with ID ${id}:`, error);
      throw error;
    }
  },

  async deleteSong(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/song/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.log(`Failed to delete song with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error deleting song with ID ${id}:`, error);
      throw error;
    }
  },
};

export default songService;
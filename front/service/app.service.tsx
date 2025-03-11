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
        throw new Error('Failed to create song');
      }

      const data: any = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating song:', error);
      throw error;
    }
  },

  async getAllSong(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/song`);

      if (!response.ok) {
        throw new Error('Failed to fetch all song');
      }

      const data: any[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all song:', error);
      throw error;
    }
  },

  async getSongById(id: number): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/song/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch song with ID ${id}`);
      }

      const data: any = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching song with ID ${id}:`, error);
      throw error;
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
        throw new Error(`Failed to update song with ID ${id}`);
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
        throw new Error(`Failed to delete song with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error deleting song with ID ${id}:`, error);
      throw error;
    }
  },
};

export default songService;
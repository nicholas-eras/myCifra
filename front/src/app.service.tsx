const API_URL = 'http://localhost:3000/music';

const musicService = {
  async createMusic(payload: any): Promise<any> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create music');
      }

      const data: any = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating music:', error);
      throw error;
    }
  },

  async getAllMusic(): Promise<any[]> {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Failed to fetch all music');
      }

      const data: any[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all music:', error);
      throw error;
    }
  },

  async getMusicById(id: number): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch music with ID ${id}`);
      }

      const data: any = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching music with ID ${id}:`, error);
      throw error;
    }
  },

  async updateMusic(id: number, payload: any): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update music with ID ${id}`);
      }

      const data: any = await response.json();
      return data;
    } catch (error) {
      console.error(`Error updating music with ID ${id}:`, error);
      throw error;
    }
  },

  async deleteMusic(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete music with ID ${id}`);
      }
    } catch (error) {
      console.error(`Error deleting music with ID ${id}:`, error);
      throw error;
    }
  },
};

export default musicService;
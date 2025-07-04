const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const usersService = {
  async getAllUsers(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/users`, {
        credentials: "include",
      });

      if (!response.ok) {
        console.log("Failed to fetch users");
      }

      const data: any[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async updateUserPermissions(
    userId: string,
    payload: Partial<{
      isAdmin: boolean;
      canAddSong: boolean;
      canSyncCifra: boolean;
    }>
  ): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.log(`Failed to update user ${userId}`);
      }

      const data: any = await response.json();
      return data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

  async getMe(): Promise<any> {
    const res = await fetch(`${API_URL}/users/me`, {
      credentials: "include",
    });
    if (!res.ok) console.log("Não autenticado");
    return res.json();
  },

};

export default usersService;

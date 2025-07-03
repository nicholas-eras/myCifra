import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import usersService from "../../../service/users.service";
import styles from "../../../styles/admin-users.module.css";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersService.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar usuários");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCheckboxChange = (
    userId: string,
    field: string,
    value: boolean
  ) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, [field]: value } : u
      )
    );
  };

  const saveAllChanges = async () => {
    try {
      setSaving(true);
      await Promise.all(
        users.map((user) =>
          usersService.updateUserPermissions(user.id, {
            isAdmin: user.isAdmin,
            canAddSong: user.canAddSong,
            canSyncCifra: user.canSyncCifra,
          })
        )
      );
      alert("Permissões salvas com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar permissões");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className={styles.adminContainer}>
      <h2 className={styles.adminTitle}>Gerenciar Usuários</h2>
      <table className={styles.adminTable}>
        <thead>
          <tr>
            <th className={styles.adminTh}>Email</th>
            <th className={styles.adminTh}>Nome</th>
            <th className={styles.adminTh}>Admin</th>
            <th className={styles.adminTh}>Adicionar Música</th>
            <th className={styles.adminTh}>Sincronizar CifraClub</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={styles.adminTr}>
              <td className={styles.adminTd}>{user.email}</td>
              <td className={styles.adminTd}>{user.name ?? "-"}</td>
              <td className={styles.adminTd}>
                <input
                  type="checkbox"
                  checked={user.isAdmin}
                  className={styles.adminCheckbox}
                  onChange={(e) =>
                    handleCheckboxChange(user.id, "isAdmin", e.target.checked)
                  }
                />
              </td>
              <td className={styles.adminTd}>
                <input
                  type="checkbox"
                  checked={user.canAddSong}
                  className={styles.adminCheckbox}
                  onChange={(e) =>
                    handleCheckboxChange(user.id, "canAddSong", e.target.checked)
                  }
                />
              </td>
              <td className={styles.adminTd}>
                <input
                  type="checkbox"
                  checked={user.canSyncCifra}
                  className={styles.adminCheckbox}
                  onChange={(e) =>
                    handleCheckboxChange(user.id, "canSyncCifra", e.target.checked)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
          className={styles.backButton}
          onClick={() => router.push("/")}
        >
          Voltar
        </button>
        <button
          className={styles.backButton}
          disabled={saving}
          onClick={saveAllChanges}
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}


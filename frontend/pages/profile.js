import useProfile from '../hooks/useProfile';

export default function ProfilePage() {
  const { profile, loading } = useProfile();

  if (loading) return <p>Cargando...</p>;
  if (!profile) return <p>No hay sesión activa</p>;

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">Perfil</h1>
      <p>Email: {profile.email}</p>
      <p>ID: {profile.id}</p>
    </div>
  );
}

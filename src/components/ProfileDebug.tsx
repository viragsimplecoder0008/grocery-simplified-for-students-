import { useAuth } from "../hooks/useAuth";

export const ProfileDebug = () => {
  const { profile } = useAuth();
  
  if (!profile) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '1px solid #ccc',
      padding: '10px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <strong>Profile Debug:</strong><br />
      <div>ID: {profile.id}</div>
      <div>Name: {profile.full_name || 'Not set'}</div>
      <div>Birthday: {profile.birth_month && profile.birth_day ? `${profile.birth_month}/${profile.birth_day}` : 'Not set'}</div>
      <div>Cake: {profile.favorite_cake || 'Not set'}</div>
      <div>Snacks: {profile.favorite_snacks || 'Not set'}</div>
      <div>Hobbies: {profile.hobbies || 'Not set'}</div>
      <div>Updated: {new Date(profile.updated_at).toLocaleTimeString()}</div>
    </div>
  );
};

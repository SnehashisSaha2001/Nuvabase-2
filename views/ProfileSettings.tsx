import React from 'react';
import { User } from '../types.ts';

interface ProfileSettingsProps {
  user: User | null;
  onUpdate: (user: User) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
      <div className="text-[#8b949e]">Manage personal account details for {user?.email}.</div>
    </div>
  );
};

export default ProfileSettings;
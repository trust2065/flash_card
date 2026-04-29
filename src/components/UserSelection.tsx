import React from 'react';

export interface User {
  id: string;
  name: string;
  avatar: string;
}

export const USERS: User[] = [
  { id: 'bamboo', name: '筍筍', avatar: '👶' },
  { id: 'daddy', name: '把鼻', avatar: '👨' },
];

interface UserSelectionProps {
  onSelect: (user: User) => void;
}

export const UserSelection: React.FC<UserSelectionProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0f172a] text-white">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold text-slate-200">你是？</h1>
        <div className="flex gap-6">
          {USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:border-primary/50 cursor-pointer"
            >
              <div className="text-6xl">{user.avatar}</div>
              <div className="text-2xl font-medium">{user.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

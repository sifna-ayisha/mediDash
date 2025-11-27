import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Shield, Stethoscope, Beaker, Pill, Hospital, Crown, Mail, Lock, LogIn } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: UserRole, email: string) => void;
}

const roleConfig = {
  [UserRole.Owner]: {
    title: 'Owner',
    Icon: Crown,
    defaultEmail: 'owner@medidash.com',
  },
  [UserRole.Admin]: {
    title: 'Admin',
    Icon: Shield,
    defaultEmail: 'admin@medidash.com',
  },
  [UserRole.Doctor]: {
    title: "Doctor",
    Icon: Stethoscope,
    defaultEmail: 'doctor@medidash.com',
  },
  [UserRole.Lab]: {
    title: 'Lab',
    Icon: Beaker,
    defaultEmail: 'lab@medidash.com',
  },
  [UserRole.Pharmacy]: {
    title: 'Pharma',
    Icon: Pill,
    defaultEmail: 'pharmacist@medidash.com',
  },
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.Owner);
  const [email, setEmail] = useState(roleConfig[UserRole.Owner].defaultEmail);
  const [password, setPassword] = useState('password123');

  useEffect(() => {
    setEmail(roleConfig[role].defaultEmail);
  }, [role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && role) {
      onLogin(role, email);
    }
  };

  const roles = Object.keys(roleConfig) as UserRole[];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-fade-in-down">
        <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
                <Hospital className="h-8 w-8 text-blue-600" />
                <h1 className="font-heading text-3xl font-bold text-slate-800">MediDash</h1>
            </div>
            <p className="text-slate-500">Sign in to your account</p>
        </div>

        {/* Segmented Control */}
        <div className="relative flex w-full rounded-full bg-slate-100 p-1.5">
          <div
            className="absolute top-1.5 h-10 rounded-full bg-white shadow-md transition-all duration-300 ease-in-out"
            style={{ 
              width: `calc(100% / ${roles.length})`,
              left: `${(100 / roles.length) * roles.indexOf(role)}%`
            }}
          ></div>
          {roles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`relative z-10 flex-1 py-2.5 text-center text-sm font-semibold transition-colors duration-300 ${
                role === r ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {roleConfig[r].title}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="sr-only" htmlFor="email">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="sr-only" htmlFor="password">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2 transform transition-transform duration-200 hover:-translate-y-0.5"
          >
            <LogIn size={20} />
            <span>Sign In</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
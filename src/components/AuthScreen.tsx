/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scissors, Mail, Lock, User as UserIcon, LogIn, ArrowRight, Phone } from 'lucide-react';
import { User } from '../types';
import { useT } from '../i18n';
import * as api from '../api';
import SettingsToggle from './SettingsToggle';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  allUsers: User[];
  onRegister: (name: string, email: string, phone: string, password: string, role: 'client' | 'admin') => void;
}

export default function AuthScreen({ onLogin, allUsers, onRegister }: AuthScreenProps) {
  const t = useT();
  const [loginRole, setLoginRole] = useState<'admin' | 'client'>('client');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      try {
        setBusy(true);
        const user = await api.loginUser(email, password);
        setBusy(false);
        if (user.role !== loginRole) {
          setError(user.role === 'admin'
            ? t('This account is an admin. Please switch to Admin login.')
            : t('This account is a client. Please switch to Client login.'));
          return;
        }
        onLogin(user);
      } catch (err: any) {
        setBusy(false);
        setError(t('Invalid credentials. Check your email and password.'));
      }
    } else {
      if (!name || !email || !phone || !password) {
        setError(t('Please fill in all details.'));
        return;
      }
      const existing = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        setError(t('A user with this email already exists.'));
        return;
      }
      onRegister(name, email, phone, password, 'client');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SettingsToggle className="absolute top-3 right-3 z-20" />
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-amber-800/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-xl shadow-amber-950/20 mb-4 ring-4 ring-amber-500/10">
            <Scissors className="h-8 w-8 text-slate-950 stroke-[2.5]" id="scissors-logo-btn" />
          </div>
          <h2 className="text-3xl font-extrabold font-sans tracking-tight text-slate-100">
            {t('The Executive Parlor')}
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-sans">
            {t('Premium Salon & Barberhouse Admin Portal')}
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl space-y-6">
          {/* Role switch (login only) */}
          {isLogin && (
            <div className="flex items-center gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setLoginRole('client')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold font-sans transition-all border-none cursor-pointer ${loginRole === 'client' ? 'bg-amber-500 text-slate-950' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}
              >
                {t('Client')}
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('admin')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold font-sans transition-all border-none cursor-pointer ${loginRole === 'admin' ? 'bg-amber-500 text-slate-950' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}
              >
                {t('Admin')}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 text-xs bg-red-50 border border-red-300 text-red-600 rounded-xl font-sans dark:bg-red-950/40 dark:border-red-500/30 dark:text-red-400">
                {error}
              </div>
            )}

            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-sans">
                    {t('Full Name')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <UserIcon className="h-5 w-5" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('E.g., Jack Pierce')}
                      className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 text-slate-200 placeholder-slate-600 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-sans">
                    {t('Phone Number')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <Phone className="h-5 w-5" />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('E.g., +216 12 345 678')}
                      className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 text-slate-200 placeholder-slate-600 text-sm transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-sans">
                {t('Email Address')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('name@example.com')}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 text-slate-200 placeholder-slate-600 text-sm transition-all animate-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-sans">
                  {t('Password')}
                </label>
                {isLogin && (
                  <span className="text-xs text-slate-500 cursor-not-allowed">
                    {t('Forgot password?')}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 text-slate-200 placeholder-slate-600 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold font-sans rounded-xl text-sm shadow-lg shadow-amber-950/20 hover:shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer border-none transition-all mt-6 disabled:opacity-60"
            >
              {isLogin ? (
                <>
                  <LogIn className="h-4 w-4 stroke-[2.5]" />
                  <span>{t('Log Into Portal')}</span>
                </>
              ) : (
                <>
                  <span>{t('Create Account')}</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => {
                setError('');
                setIsLogin(!isLogin);
              }}
              className="text-xs text-amber-500 hover:text-amber-400 hover:underline font-sans tracking-wide bg-transparent border-none cursor-pointer"
            >
              {isLogin ? t("Need a portal account? Create a profile") : t("Already registered? Click here to Log In")}
            </button>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-600 font-sans">
          {t('Protected Secure Environment. Authorized Personnel Only.')}
        </div>
      </motion.div>
    </div>
  );
}

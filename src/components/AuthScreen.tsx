/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scissors, Mail, Lock, User as UserIcon, LogIn, ArrowRight, Sun, Moon, Languages } from 'lucide-react';
import { User } from '../types';
import { useT, useSettings } from '../i18n';
import * as api from '../api';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  allUsers: User[];
  onRegister: (name: string, email: string, password: string, role: 'client' | 'admin') => void;
}

function AuthSettingsToggle() {
  const { theme, lang, toggleTheme, setLang } = useSettings();
  return (
    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur border border-slate-800 rounded-full p-1 shadow-lg">
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        className="h-8 w-8 rounded-full flex items-center justify-center text-amber-500 hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <button
        onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
        title="Language"
        className="h-8 px-2.5 rounded-full flex items-center gap-1 text-xs font-bold text-amber-500 hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
      >
        <Languages className="h-4 w-4" />
        {lang === 'en' ? 'EN' : 'FR'}
      </button>
    </div>
  );
}

export default function AuthScreen({ onLogin, allUsers, onRegister }: AuthScreenProps) {
  const t = useT();
  const [loginRole, setLoginRole] = useState<'admin' | 'client'>('client');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
      if (!name || !email || !password) {
        setError(t('Please fill in all details.'));
        return;
      }
      const existing = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        setError(t('A user with this email already exists.'));
        return;
      }
      onRegister(name, email, password, 'client');
    }
  };

  const handleQuickLogin = (roleType: 'client' | 'admin') => {
    const targetEmail = roleType === 'client'
      ? 'taherayadi1990@gmail.com'
      : 'admin@barbershop.com';
    const found = allUsers.find(u => u.email === targetEmail);
    if (found) {
      onLogin(found);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <AuthSettingsToggle />
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
              <div className="p-3.5 text-xs bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl font-sans">
                {error}
              </div>
            )}

            {!isLogin && (
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

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-sans font-bold tracking-wider uppercase">
              {t('Instant Quick-Login')}
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="p-4 rounded-2xl bg-[#0d121c] border border-slate-800 hover:border-amber-500/30 flex flex-col items-center justify-center text-center group cursor-pointer transition-all w-full max-w-xs"
              id="admin-quick-login-btn"
            >
              <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <UserIcon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-slate-250 font-sans">
                {t('Barberhouse Admin')}
              </span>
              <span className="text-[10.5px] text-amber-500 font-mono mt-0.5 font-bold">
                {t('Executive Portal')}
              </span>
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

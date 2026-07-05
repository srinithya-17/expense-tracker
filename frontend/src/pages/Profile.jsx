import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaCamera, FaLock, FaSave } from 'react-icons/fa';
import * as userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getInitials } from '../utils/format';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
const LANGUAGES = [{ code: 'en', label: 'English' }, { code: 'hi', label: 'Hindi' }, { code: 'es', label: 'Spanish' }, { code: 'fr', label: 'French' }];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [avatarUploading, setAvatarUploading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { isSubmitting: savingProfile },
  } = useForm({
    defaultValues: {
      name: user?.name,
      currency: user?.currency || 'INR',
      language: user?.language || 'en',
      monthlyBudget: user?.monthlyBudget || 0,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors, isSubmitting: savingPassword },
  } = useForm();
  const newPassword = watch('newPassword');

  const onProfileSubmit = async (data) => {
    try {
      const updated = await userService.updateProfile(data);
      updateUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await userService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const updated = await userService.updateAvatar(file);
      updateUser(updated);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleThemeChange = async (value) => {
    setTheme(value);
    try {
      const updated = await userService.updateProfile({ theme: value });
      updateUser(updated);
    } catch {}
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h2 className="page-title">Profile & Settings</h2>
        <p className="page-subtitle">Manage your account, preferences, and security.</p>
      </div>

      {/* Avatar + basic info */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-mint-500 text-xl font-bold text-white">
                {getInitials(user?.name)}
              </div>
            )}
            <label className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white dark:bg-ink-800 shadow-md border border-ink-100 dark:border-ink-700 text-ink-500 hover:text-primary-500">
              <FaCamera size={12} />
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} disabled={avatarUploading} />
            </label>
          </div>
          <div>
            <p className="text-lg font-semibold text-ink-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-ink-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="glass-card space-y-4 p-6">
        <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Personal Details</h3>
        <div>
          <label className="label-text">Full name</label>
          <input className="input-field" {...registerProfile('name', { required: true })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Currency</label>
            <select className="input-field" {...registerProfile('currency')}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Language</label>
            <select className="input-field" {...registerProfile('language')}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label-text">Default monthly budget</label>
          <input type="number" step="0.01" className="input-field" {...registerProfile('monthlyBudget', { valueAsNumber: true })} />
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={savingProfile} className="btn-primary">
            <FaSave size={12} /> {savingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>

      {/* Theme preference */}
      <div className="glass-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-ink-800 dark:text-ink-100">Appearance</h3>
        <div className="flex gap-3">
          {['light', 'dark'].map((t) => (
            <button
              key={t}
              onClick={() => handleThemeChange(t)}
              className={`flex-1 rounded-xl border-2 p-4 text-center capitalize transition-all ${
                theme === t ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600' : 'border-ink-200 dark:border-ink-700 text-ink-500'
              }`}
            >
              {t} mode
            </button>
          ))}
        </div>
      </div>

      {/* Change password */}
      <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="glass-card space-y-4 p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100">
          <FaLock size={12} /> Change Password
        </h3>
        <div>
          <label className="label-text">Current password</label>
          <input type="password" className="input-field" {...registerPassword('currentPassword', { required: 'Required' })} />
          {passwordErrors.currentPassword && <p className="mt-1 text-xs text-coral-500">{passwordErrors.currentPassword.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">New password</label>
            <input type="password" className="input-field" {...registerPassword('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} />
            {passwordErrors.newPassword && <p className="mt-1 text-xs text-coral-500">{passwordErrors.newPassword.message}</p>}
          </div>
          <div>
            <label className="label-text">Confirm new password</label>
            <input type="password" className="input-field" {...registerPassword('confirmPassword', { validate: (v) => v === newPassword || 'Passwords do not match' })} />
            {passwordErrors.confirmPassword && <p className="mt-1 text-xs text-coral-500">{passwordErrors.confirmPassword.message}</p>}
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  );
}

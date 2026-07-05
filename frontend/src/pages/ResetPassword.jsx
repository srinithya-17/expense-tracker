import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaLock, FaCoins } from 'react-icons/fa';
import * as authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { resetToken } = useParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.resetPassword(resetToken, data.password);
      login(res);
      toast.success('Password reset successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-ink-50 dark:bg-ink-950 bg-mesh-light dark:bg-mesh-dark px-4">
      <div className="glass-card w-full max-w-md p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-mint-500 text-white shadow-glow">
            <FaCoins size={20} />
          </div>
          <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Set a new password</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">New password</label>
            <div className="relative">
              <FaLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" size={14} />
              <input
                type="password"
                placeholder="At least 6 characters"
                className="input-field pl-10"
                {...register('password', { required: true, minLength: 6 })}
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-coral-500">Minimum 6 characters required</p>}
          </div>
          <div>
            <label className="label-text">Confirm password</label>
            <div className="relative">
              <FaLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" size={14} />
              <input
                type="password"
                placeholder="Re-enter new password"
                className="input-field pl-10"
                {...register('confirmPassword', { validate: (v) => v === password || 'Passwords do not match' })}
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-coral-500">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <Link to="/login" className="mt-6 block text-center text-sm font-medium text-ink-400 hover:text-ink-600">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

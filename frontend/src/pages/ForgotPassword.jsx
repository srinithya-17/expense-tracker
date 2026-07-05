import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaEnvelope, FaCoins, FaArrowLeft } from 'react-icons/fa';
import * as authService from '../services/authService';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
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
          <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Reset your password</h1>
          <p className="mt-1 text-sm text-ink-400">We'll email you a link to reset it</p>
        </div>

        {sent ? (
          <div className="rounded-xl bg-mint-500/10 border border-mint-500/20 p-4 text-center text-sm text-mint-600 dark:text-mint-400">
            If that email exists in our system, a reset link is on its way. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label-text">Email</label>
              <div className="relative">
                <FaEnvelope className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" size={14} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-coral-500">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-ink-400 hover:text-ink-600">
          <FaArrowLeft size={12} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}

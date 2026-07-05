import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaCoins } from 'react-icons/fa';
import { motion } from 'framer-motion';
import * as authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.register(data);
      login(res);
      toast.success('Account created! Welcome to Pulse.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-50 dark:bg-ink-950 bg-mesh-light dark:bg-mesh-dark px-4 py-10">
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-mint-500/20 blur-3xl animate-float" />
      <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl animate-float-delayed" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card relative w-full max-w-md p-8"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-mint-500 text-white shadow-glow">
            <FaCoins size={20} />
          </div>
          <h1 className="text-2xl font-bold text-ink-900 dark:text-white">Create your account</h1>
          <p className="mt-1 text-sm text-ink-400">Start tracking your money in minutes</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Full name</label>
            <div className="relative">
              <FaUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" size={14} />
              <input
                placeholder="Jane Doe"
                className="input-field pl-10"
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-coral-500">{errors.name.message}</p>}
          </div>

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

          <div>
            <label className="label-text">Password</label>
            <div className="relative">
              <FaLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" size={14} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                className="input-field pl-10 pr-10"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-coral-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label-text">Confirm password</label>
            <div className="relative">
              <FaLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" size={14} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                className="input-field pl-10"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === password || 'Passwords do not match',
                })}
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-coral-500">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Zap,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'
interface SignUpProps {
  onSignInClick?: () => void;
}
import { auth, googleProvider } from '../services/firebase'
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'

export default function SignUp({ onSignInClick }: SignUpProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    // If user edits the password field, re-validate against confirmPassword
    if (id === 'password' && formData.confirmPassword) {
      setPasswordError(value !== formData.confirmPassword ? 'Passwords do not match' : '')
    }
  };

  const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, confirmPassword: value }))
    setPasswordError(value && value !== formData.password ? 'Passwords do not match' : '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('')

    if (passwordError || formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await updateProfile(userCredential.user, {
        displayName: formData.fullName
      });
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists')
      } else if (error.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters')
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') return
      setError('Google sign up failed. Please try again.')
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 selection:bg-primary/30 selection:text-white">
      <div className="w-full max-w-[440px]">
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="bg-primary/20 p-3 rounded-2xl mb-4 border border-primary/30 shadow-lg shadow-primary/10">
            <Zap className="text-primary w-10 h-10 fill-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">FocusFlow</h1>
          <p className="text-slate-400 mt-2 text-center font-medium">Unleash your peak productivity</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card-dark rounded-3xl shadow-2xl border border-border-dark overflow-hidden"
        >
          <div className="p-8 sm:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create account</h2>
              <p className="text-slate-400 text-sm">Join FocusFlow and start your journey.</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1" htmlFor="fullName">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input 
                    className="w-full bg-slate-900/50 border border-border-dark rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                    id="fullName" 
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input 
                    className="w-full bg-slate-900/50 border border-border-dark rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                    id="email" 
                    type="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1" htmlFor="password">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input 
                    className="w-full bg-slate-900/50 border border-border-dark rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 ml-1" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input 
                    className={`w-full bg-slate-900/50 border ${
                      passwordError ? 'border-red-500' : 'border-border-dark'
                    } rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none`}
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleConfirmPassword}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {passwordError}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
              >
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-dark"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card-dark px-4 text-slate-500 font-bold tracking-widest">Or sign up with</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <button 
              onClick={handleGoogleSignUp}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-slate-800/50 border border-border-dark py-3.5 rounded-2xl hover:bg-slate-800 transition-all text-slate-200 font-bold shadow-sm active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Google
            </button>
          </div>

          {/* Footer Link */}
          <div className="bg-slate-900/30 p-6 text-center border-t border-border-dark">
            <p className="text-sm text-slate-400 font-medium">
              Already have an account? 
              <button 
                onClick={() => navigate('/signin')}
                className="text-primary font-bold hover:underline ml-1.5 outline-none"
              >
                Sign in
              </button>
            </p>
          </div>
        </motion.div>

        {/* System Status / Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs text-slate-500 font-semibold"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Systems Operational
          </div>
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
        </motion.div>
      </div>
    </div>
  );
}
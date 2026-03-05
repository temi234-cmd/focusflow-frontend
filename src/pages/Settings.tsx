import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  Camera,
  Lock,
  Trash2,
  Menu,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLayout } from '../layouts/DashboardLayout';
import { auth } from '../services/firebase';
import {
  updateProfile,
  updateEmail,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { saveNotificationPrefs, getNotificationPrefs, subscribeToPush, unsubscribeFromPush } from '../services/notificationService';

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
      checked ? 'bg-primary' : 'bg-slate-700'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-1'
      }`}
    />
  </button>
);

const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 40 }}
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-semibold ${
      type === 'success'
        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        : 'bg-red-500/10 border-red-500/30 text-red-400'
    }`}
  >
    {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
    {message}
  </motion.div>
);

export default function Settings() {
  const { openMenu } = useLayout();
  // const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    aiDigest: false,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFullName(user.displayName || '');
      setEmail(user.email || '');
      const photo = user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'user'}`;
      setPhotoURL(photo);
      setAvatarPreview(photo);
    }
  }, []);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const prefs = await getNotificationPrefs();
        setNotifications({
          email: prefs.email,
          push: prefs.push,
          aiDigest: prefs.aiDigest,
        });
      } catch (error) {
        console.error('Failed to load notification prefs:', error);
      }
    };
    loadPrefs();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleNotification = async (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    setNotifSaving(true);

    try {
      if (key === 'push' && updated.push) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          showToast('Please allow notifications in your browser settings.', 'error');
          setNotifications(prev => ({ ...prev, push: false }));
          setNotifSaving(false);
          return;
        }
        await subscribeToPush();
      }

      if (key === 'push' && !updated.push) {
        await unsubscribeFromPush();
      }

      await saveNotificationPrefs(updated);
      showToast('Notification preferences saved!', 'success');
    } catch (error) {
      showToast('Failed to save preferences.', 'error');
    } finally {
      setNotifSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      showToast('Image must be under 800KB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile(user, {
        displayName: fullName,
        photoURL: avatarPreview !== photoURL ? avatarPreview : user.photoURL,
      });
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        showToast('Please sign out and sign back in to change your email.', 'error');
      } else if (error.code === 'auth/email-already-in-use') {
        showToast('That email is already in use.', 'error');
      } else {
        showToast('Failed to save changes. Please try again.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const user = auth.currentUser;
    if (user) {
      setFullName(user.displayName || '');
      setEmail(user.email || '');
      setAvatarPreview(user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'user'}`);
    }
  };

  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    setPasswordSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      showToast('Password changed successfully!', 'success');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect.');
      } else {
        setPasswordError('Something went wrong. Please try again.');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;
    setDeleteError('');
    setDeleteLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setDeleteError('Incorrect password.');
      } else {
        setDeleteError('Something went wrong. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      <div className="h-16 border-b border-white/5 px-4 lg:px-8 flex items-center justify-between bg-[#0f111a]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center">
          <button onClick={openMenu} className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg mr-2">
            <Menu size={20} />
          </button>
          <h2 className="text-base lg:text-lg font-bold">Settings</h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full">
        <header className="mb-10">
          <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Settings
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-sm sm:text-base text-slate-400 mt-2">
            Manage your account settings and preferences.
          </motion.p>
        </header>

        <div className="space-y-12">
          {/* Profile */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg font-semibold">Profile</h3>
              <p className="text-sm text-slate-400 mt-1">This information will be displayed publicly.</p>
            </div>
            <div className="md:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative group">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-primary/20 bg-slate-800 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('${avatarPreview}')` }} />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                    <Camera size={24} />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/jpg,image/jpeg,image/gif,image/png" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div>
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-primary/20">
                    Upload New Avatar
                  </button>
                  <p className="text-xs text-slate-500 mt-2 italic">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-400">Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-400">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-800"></div>

          {/* Appearance */}
          {/* <section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg font-semibold">Appearance</h3>
              <p className="text-sm text-slate-400 mt-1">Customize how FocusFlow looks on your device.</p>
            </div>
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setTheme('light')} className={`p-4 border-2 rounded-xl transition-all text-left ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-slate-800 hover:border-slate-700'}`}>
                  <div className="h-20 bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-2xl">☀️</span>
                  </div>
                  <span className={`text-sm font-medium block text-center ${theme === 'light' ? 'text-primary' : ''}`}>Light Mode</span>
                </button>
                <button onClick={() => setTheme('dark')} className={`p-4 border-2 rounded-xl transition-all text-left ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-slate-800 hover:border-slate-700'}`}>
                  <div className="h-20 bg-slate-900 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-2xl">🌙</span>
                  </div>
                  <span className={`text-sm font-medium block text-center ${theme === 'dark' ? 'text-primary' : ''}`}>Dark Mode</span>
                </button>
              </div>
            </div>
          </section> */}

          <div className="h-px bg-slate-800"></div>

          {/* Notifications */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="text-sm text-slate-400 mt-1">Choose what you want to be notified about.</p>
            </div>
            <div className="md:col-span-2 space-y-4">
              {[
                { key: 'email', title: 'Email Notifications', desc: 'Receive streak reminders and weekly AI digest via email.', recommended: false },
                { key: 'push', title: 'Push Notifications', desc: 'Stay updated on your mobile and desktop devices.', recommended: true },
                { key: 'aiDigest', title: 'Weekly AI Digest', desc: 'AI-powered insights about your productivity flow.', recommended: false },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <div className="pr-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{item.title}</p>
                      {item.recommended && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={() => toggleNotification(item.key as keyof typeof notifications)}
                  />
                </div>
              ))}

              {/* Email warning banner */}
              {notifications.email && (
                <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <span className="text-lg">📧</span>
                  <p className="text-xs text-amber-400 leading-relaxed">
                    Email notifications may land in your <span className="font-bold">spam/junk folder</span>. Please check there and mark FocusFlow emails as "Not Spam" to ensure you receive them.
                  </p>
                </div>
              )}

              {notifSaving && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> Saving preferences...
                </p>
              )}
            </div>
          </section>

          <div className="h-px bg-slate-800"></div>

          {/* Account */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg font-semibold">Account</h3>
              <p className="text-sm text-slate-400 mt-1">Manage security and account deletion.</p>
            </div>
            <div className="md:col-span-2 space-y-4">
              <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-primary transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-slate-400 group-hover:text-primary" />
                  <span className="text-sm font-semibold">Change Password</span>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
              <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <Trash2 size={18} className="text-red-500" />
                  <span className="text-sm font-semibold text-red-500">Delete Account</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Irreversible</span>
              </button>
            </div>
          </section>

          {/* Save / Cancel */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button onClick={handleCancel} className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-lg transition-all">
              Cancel Changes
            </button>
            <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowPasswordModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-[#161b27] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
              <h3 className="text-lg font-bold">Change Password</h3>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-400">Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-400">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="••••••••" />
              </div>
              {passwordError && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={13} /> {passwordError}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-lg transition-all">Cancel</button>
                <button onClick={handleChangePassword} disabled={passwordSaving} className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                  {passwordSaving && <Loader2 size={14} className="animate-spin" />}
                  {passwordSaving ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-[#161b27] border border-red-500/20 rounded-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg"><Trash2 size={20} className="text-red-500" /></div>
                <h3 className="text-lg font-bold">Delete Account</h3>
              </div>
              <p className="text-sm text-slate-400">This will permanently delete your account and all associated data. This action <span className="text-red-400 font-semibold">cannot be undone</span>.</p>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-400">Confirm your password</label>
                <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500" placeholder="••••••••" />
              </div>
              {deleteError && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={13} /> {deleteError}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-lg transition-all">Cancel</button>
                <button onClick={handleDeleteAccount} disabled={deleteLoading} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2">
                  {deleteLoading && <Loader2 size={14} className="animate-spin" />}
                  {deleteLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
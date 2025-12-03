// Login.jsx — Tailwind UI (logique intacte)
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Erreur de connexion');
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-neutral-50">
      {/* Pane gauche — Brand */}
      <div className="hidden lg:flex relative overflow-hidden items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        {/* Blobs animés */}
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-white/10 blur-2xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-80 rounded-full bg-white/10 blur-2xl animate-[pulse_2.5s_ease-in-out_infinite]" />

        <div className="relative z-10 max-w-lg px-8">
          <div className="size-14 grid place-items-center rounded-2xl bg-white/15 shadow-inner mb-4">
            <span className="text-3xl">🏢</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion Commerciale</h1>
          <p className="mt-2 text-white/90">
            Système complet de gestion pour votre entreprise. Gérez vos clients, produits
            et factures en toute simplicité.
          </p>

          {/* Badges / points clés */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm">Clients</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm">Produits</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm">Factures</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm">Commandes</span>
          </div>
        </div>
      </div>

      {/* Pane droite — Form */}
      <div className="flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md">
          <div className="sticky top-0 -mt-8 mb-6 lg:hidden">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-neutral-200">
              <span className="text-2xl">🏢</span>
              <div>
                <p className="text-sm font-semibold">Gestion Commerciale</p>
                <p className="text-xs text-neutral-500 -mt-0.5">Accédez à votre espace</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight">Connexion</h2>
              <p className="text-sm text-neutral-500 -mt-0.5">
                Accédez à votre espace personnel
              </p>
            </div>

            {error && (
              <div
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs text-neutral-600">Email</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/30">
                  <span className="text-neutral-400">✉️</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrez votre email"
                    required
                    disabled={loading}
                    className="w-full bg-transparent outline-none placeholder:text-neutral-400 text-sm"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="text-xs text-neutral-600">Mot de passe</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/30">
                  <span className="text-neutral-400">🔒</span>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    required
                    disabled={loading}
                    className="w-full bg-transparent outline-none placeholder:text-neutral-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="text-xs text-neutral-500 hover:text-neutral-700 transition"
                    tabIndex={-1}
                  >
                    {showPwd ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-700 active:scale-[.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading && (
                  <span className="size-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                )}
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-neutral-600">
                Pas de compte ?{' '}
                <Link to="/register" className="font-medium text-indigo-600 hover:underline">
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>

          {/* Footer léger */}
          <div className="mt-6 text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} Votre Société — Tous droits réservés
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

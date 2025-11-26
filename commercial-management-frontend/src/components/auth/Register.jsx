// Register.jsx — Tailwind UI (logique intacte)
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const strength = (() => {
    const v = formData.password;
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[a-z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return Math.min(s, 4); // 0..4
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Compte créé avec succès! Vous pouvez maintenant vous connecter.');
        navigate('/login');
      } else {
        setError(data.message || 'Erreur lors de la création du compte');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-neutral-50">
      {/* Pane gauche — Brand */}
      <div className="hidden lg:flex relative overflow-hidden items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
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
                <p className="text-xs text-neutral-500 -mt-0.5">Créer un compte</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight">Créer un compte</h2>
              <p className="text-sm text-neutral-500 -mt-0.5">Rejoignez notre plateforme</p>
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
              {/* Ligne prénom/nom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-600">Prénom</label>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/30">
                    <span className="text-neutral-400">🙂</span>
                    <input
                      name="prenom"
                      type="text"
                      value={formData.prenom}
                      onChange={handleChange}
                      placeholder="Votre prénom"
                      required
                      disabled={loading}
                      className="w-full bg-transparent outline-none placeholder:text-neutral-400 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-neutral-600">Nom</label>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/30">
                    <span className="text-neutral-400">🧑</span>
                    <input
                      name="nom"
                      type="text"
                      value={formData.nom}
                      onChange={handleChange}
                      placeholder="Votre nom"
                      required
                      disabled={loading}
                      className="w-full bg-transparent outline-none placeholder:text-neutral-400 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs text-neutral-600">Email</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/30">
                  <span className="text-neutral-400">✉️</span>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    required
                    disabled={loading}
                    className="w-full bg-transparent outline-none placeholder:text-neutral-400 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs text-neutral-600">Mot de passe</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/30">
                  <span className="text-neutral-400">🔒</span>
                  <input
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Créez un mot de passe"
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

                {/* Barre de force */}
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-neutral-200">
                    <div
                      className={[
                        'h-1.5 rounded-full transition-all',
                        strength <= 1
                          ? 'bg-red-500 w-1/4'
                          : strength === 2
                          ? 'bg-amber-500 w-2/4'
                          : strength === 3
                          ? 'bg-lime-500 w-3/4'
                          : 'bg-emerald-600 w-full'
                      ].join(' ')}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {strength <= 1
                      ? 'Faible'
                      : strength === 2
                      ? 'Moyen'
                      : strength === 3
                      ? 'Bon'
                      : 'Fort'}
                  </p>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-xs text-neutral-600">Confirmer le mot de passe</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/30">
                  <span className="text-neutral-400">✅</span>
                  <input
                    name="confirmPassword"
                    type={showPwd2 ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmez votre mot de passe"
                    required
                    disabled={loading}
                    className="w-full bg-transparent outline-none placeholder:text-neutral-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd2((v) => !v)}
                    className="text-xs text-neutral-500 hover:text-neutral-700 transition"
                    tabIndex={-1}
                  >
                    {showPwd2 ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas</p>
                )}
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
                {loading ? 'Création…' : 'Créer mon compte'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-neutral-600">
                Déjà un compte ?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} Votre Société — Tous droits réservés
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

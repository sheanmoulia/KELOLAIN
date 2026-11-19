import { Head, Link, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import PasskeyVerify from '@/components/passkey-verify';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import type { TeamInvitationContext } from '@/types';
import '../../../css/kelolain.css';

type Mode = 'login' | 'register' | 'forgot' | 'reset';
type AuthProps = {
    mode: Mode;
    email?: string;
    token?: string;
    canResetPassword?: boolean;
    status?: string;
    passwordMin?: number;
    teamInvitation?: TeamInvitationContext | null;
};

const text = {
    login: {
        title: 'Selamat datang kembali',
        description:
            'Masuk untuk memantau stok dan mencegah pemborosan bahan makananmu.',
        action: 'Masuk',
        url: '/login',
    },
    register: {
        title: 'Mulai kelola dapurmu lebih cerdas',
        description:
            'Buat akun gratis dan pantau bahan makananmu agar tidak ada yang terbuang sia-sia.',
        action: 'Buat akun',
        url: '/register',
    },
    forgot: {
        title: 'Lupa kata sandi?',
        description:
            'Masukkan email akunmu untuk menerima tautan pengaturan ulang kata sandi.',
        action: 'Kirim tautan',
        url: '/forgot-password',
    },
    reset: {
        title: 'Atur ulang kata sandi',
        description: 'Buat kata sandi baru untuk masuk kembali ke KELOLAIN.',
        action: 'Simpan kata sandi',
        url: '/reset-password',
    },
};

export default function Auth({
    mode,
    email = '',
    token = '',
    canResetPassword,
    passwordMin = 8,
    status,
    teamInvitation,
}: AuthProps) {
    const form = useForm({
        name: '',
        email,
        password: '',
        password_confirmation: '',
        token,
        remember: false,
    });
    const guest = useForm({});
    const [visible, setVisible] = useState(false);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const registering = mode === 'register';
    const confirming = registering || mode === 'reset';
    const current = text[mode];

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(current.url, {
            onError: () => form.reset('password', 'password_confirmation'),
        });
    }

    return (
        <main className="auth-layout kelolain-ui">
            <Head title={current.action} />
            <aside className="auth-hero">
                <Link className="brand auth-brand" href="/">
                    <span className="brand-mark">K</span>KELOLAIN
                </Link>
                <p>
                    {registering
                        ? 'Kurangi pemborosan, hemat lebih banyak setiap bulan.'
                        : 'Pantau stok, kurangi waste, hemat lebih banyak tiap bulan.'}
                </p>
            </aside>
            <section className="auth-panel">
                <div className="auth-content">
                    <Link className="brand auth-mobile-brand" href="/">
                        <span className="brand-mark">K</span>KELOLAIN
                    </Link>
                    <h1>{current.title}</h1>
                    <p className="auth-description">{current.description}</p>
                    {status && (
                        <p className="auth-status" role="status">
                            {status}
                        </p>
                    )}
                    {teamInvitation && (
                        <div className="auth-invitation">
                            <TeamInvitationAlert
                                invitation={teamInvitation}
                                action="Log in"
                            />
                        </div>
                    )}
                    <form className="auth-form" onSubmit={submit}>
                        {registering && (
                            <label>
                                Nama lengkap
                                <input
                                    required
                                    autoComplete="name"
                                    maxLength={255}
                                    placeholder="Nama lengkap"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                />
                                {form.errors.name && (
                                    <span className="field-error">
                                        {form.errors.name}
                                    </span>
                                )}
                            </label>
                        )}
                        <label>
                            Email
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                maxLength={255}
                                placeholder="nama@email.com"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                            />
                            {form.errors.email && (
                                <span className="field-error">
                                    {form.errors.email}
                                </span>
                            )}
                        </label>
                        {mode !== 'forgot' && (
                            <PasswordField
                                label="Kata sandi"
                                placeholder="Masukkan kata sandi"
                                visible={visible}
                                toggle={() => setVisible(!visible)}
                                value={form.data.password}
                                minLength={confirming ? passwordMin : undefined}
                                onChange={(value) =>
                                    form.setData('password', value)
                                }
                                error={form.errors.password}
                            />
                        )}
                        {mode === 'login' && canResetPassword && (
                            <Link
                                className="auth-forgot"
                                href="/forgot-password"
                            >
                                Lupa kata sandi?
                            </Link>
                        )}
                        {confirming && (
                            <PasswordField
                                label="Konfirmasi kata sandi"
                                placeholder="Ulangi kata sandi"
                                visible={confirmationVisible}
                                toggle={() =>
                                    setConfirmationVisible(!confirmationVisible)
                                }
                                value={form.data.password_confirmation}
                                minLength={passwordMin}
                                onChange={(value) =>
                                    form.setData('password_confirmation', value)
                                }
                                error={form.errors.password_confirmation}
                            />
                        )}
                        {confirming && passwordMin === 12 && (
                            <small className="auth-password-hint">
                                Gunakan minimal 12 karakter, dengan huruf besar,
                                huruf kecil, angka, dan simbol.
                            </small>
                        )}
                        {mode === 'login' && (
                            <label className="remember-option">
                                <input
                                    type="checkbox"
                                    checked={form.data.remember}
                                    onChange={(event) =>
                                        form.setData(
                                            'remember',
                                            event.target.checked,
                                        )
                                    }
                                />
                                Ingat saya
                            </label>
                        )}
                        {form.errors.token && (
                            <span className="field-error" role="alert">
                                {form.errors.token}
                            </span>
                        )}
                        <button
                            className="primary w-full"
                            type="submit"
                            disabled={form.processing}
                        >
                            {current.action}
                        </button>
                    </form>
                    {mode === 'login' && (
                        <details className="auth-passkey">
                            <summary>Masuk dengan passkey</summary>
                            <PasskeyVerify
                                label="Gunakan passkey"
                                loadingLabel="Memverifikasi…"
                                separator="atau masuk dengan email"
                            />
                        </details>
                    )}
                    <div className="auth-links">
                        {mode === 'login' ? (
                            <p>
                                Belum memiliki akun?{' '}
                                <Link href="/register">Daftar</Link>
                            </p>
                        ) : registering ? (
                            <p>
                                Sudah memiliki akun?{' '}
                                <Link href="/login">Masuk</Link>
                            </p>
                        ) : (
                            <p>
                                <Link href="/login">
                                    Kembali ke halaman masuk
                                </Link>
                            </p>
                        )}
                        {(mode === 'login' || registering) && (
                            <button
                                className="auth-guest"
                                type="button"
                                disabled={guest.processing}
                                onClick={() => guest.post('/guest')}
                            >
                                Lanjut sebagai tamu
                            </button>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

type PasswordFieldProps = {
    label: string;
    placeholder: string;
    visible: boolean;
    toggle: () => void;
    value: string;
    onChange: (value: string) => void;
    minLength?: number;
    error?: string;
};

function PasswordField({
    label,
    placeholder,
    visible,
    toggle,
    value,
    onChange,
    minLength,
    error,
}: PasswordFieldProps) {
    return (
        <div className="auth-password-field">
            <label>
                {label}
                <input
                    type={visible ? 'text' : 'password'}
                    required
                    minLength={minLength}
                    maxLength={minLength ? 72 : undefined}
                    autoComplete={
                        minLength ? 'new-password' : 'current-password'
                    }
                    placeholder={placeholder}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </label>
            <button
                className="show-password"
                type="button"
                onClick={toggle}
                aria-label={
                    visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
                }
                aria-pressed={visible}
            >
                <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    aria-hidden="true"
                >
                    <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="2.5" />
                    {visible && <path d="m4 4 16 16" />}
                </svg>
            </button>
            {error && <span className="field-error">{error}</span>}
        </div>
    );
}

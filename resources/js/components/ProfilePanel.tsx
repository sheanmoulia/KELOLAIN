import { Link, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { dateLabel, type Owner } from '../workspace';

export default function ProfilePanel({
    owner,
    emailEnabled,
}: {
    owner: Owner;
    emailEnabled: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const form = useForm({
        name: owner.name,
        email: owner.email ?? '',
        emailReminders: owner.emailReminders,
        current_password: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.patch('/profil', {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
            onFinish: () => form.reset('current_password'),
        });
    }

    function leave() {
        if (
            owner.isGuest &&
            !window.confirm('Keluar dan hapus data sesi tamu ini?')
        )
            return;

        const options = {
            onStart: () => setLeaving(true),
            onFinish: () => setLeaving(false),
        };
        if (owner.isGuest) {
            router.delete('/guest', options);
        } else {
            router.post('/logout', {}, options);
        }
    }

    return (
        <>
            <div className="page-heading">
                <div>
                    <div className="eyebrow">ACCOUNT SETTINGS</div>
                    <h1>Profil Pengguna</h1>
                    <p>Informasi dan pengaturan akunmu.</p>
                </div>
            </div>
            <section className="panel profile-panel">
                <div className="profile-cover" />
                <div className="profile-details">
                    <div className="avatar profile-avatar">
                        {owner.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                        <h2>{owner.name}</h2>
                        <p>
                            {owner.isGuest ? 'Pengguna Tamu' : 'Akun KELOLAIN'}
                        </p>
                    </div>
                    {owner.isGuest && <span className="demo-tag">TAMU</span>}
                </div>
                {editing ? (
                    <form className="profile-edit" onSubmit={submit}>
                        <div className="form-grid">
                            <label>
                                Nama Lengkap
                                <input
                                    required
                                    maxLength={100}
                                    autoComplete="name"
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
                            <label>
                                Email
                                <input
                                    required
                                    type="email"
                                    maxLength={255}
                                    autoComplete="email"
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                />
                                {form.errors.email && (
                                    <span className="field-error">
                                        {form.errors.email}
                                    </span>
                                )}
                            </label>
                            {form.data.email.trim().toLowerCase() !==
                                owner.email && (
                                <label className="full">
                                    Kata Sandi Saat Ini
                                    <input
                                        required
                                        type="password"
                                        autoComplete="current-password"
                                        value={form.data.current_password}
                                        onChange={(event) =>
                                            form.setData(
                                                'current_password',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    {form.errors.current_password && (
                                        <span className="field-error">
                                            {form.errors.current_password}
                                        </span>
                                    )}
                                </label>
                            )}
                        </div>
                        {emailEnabled && (
                            <label className="reminder-option">
                                <input
                                    type="checkbox"
                                    checked={form.data.emailReminders}
                                    onChange={(event) =>
                                        form.setData(
                                            'emailReminders',
                                            event.target.checked,
                                        )
                                    }
                                />
                                Terima pengingat masa simpan via email
                            </label>
                        )}
                        <div className="profile-actions">
                            <button
                                className="primary"
                                type="submit"
                                disabled={form.processing}
                            >
                                Simpan perubahan
                            </button>
                            <button
                                className="outline"
                                type="button"
                                disabled={form.processing}
                                onClick={() => setEditing(false)}
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="profile-fields">
                            <div>
                                <small>Nama Lengkap</small>
                                <b>{owner.name}</b>
                            </div>
                            <div>
                                <small>Email</small>
                                <b>{owner.email ?? '—'}</b>
                            </div>
                            <div>
                                <small>Tipe Pengguna</small>
                                <b>
                                    {owner.isGuest
                                        ? 'Tamu'
                                        : 'Personal / Rumah Tangga'}
                                </b>
                            </div>
                            <div>
                                <small>
                                    {owner.isGuest
                                        ? 'Sesi dimulai'
                                        : 'Bergabung Sejak'}
                                </small>
                                <b>{dateLabel(owner.joinedAt)}</b>
                            </div>
                        </div>
                        {owner.isGuest && (
                            <p className="profile-note">
                                Data contoh dan perubahanmu hanya berlaku selama
                                sesi tamu ini.
                            </p>
                        )}
                        <div className="profile-actions profile-actions-inset">
                            {!owner.isGuest && (
                                <button
                                    className="primary"
                                    type="button"
                                    onClick={() => {
                                        form.setData({
                                            name: owner.name,
                                            email: owner.email ?? '',
                                            emailReminders:
                                                owner.emailReminders,
                                            current_password: '',
                                        });
                                        form.clearErrors();
                                        setEditing(true);
                                    }}
                                >
                                    Edit Profil
                                </button>
                            )}
                            <button
                                className="outline"
                                type="button"
                                onClick={leave}
                                disabled={leaving}
                            >
                                {owner.isGuest ? 'Akhiri sesi tamu' : 'Keluar'}
                            </button>
                            {!owner.isGuest && (
                                <>
                                    <Link
                                        href="/settings/security"
                                        className="text-link"
                                    >
                                        Keamanan akun
                                    </Link>
                                    <Link
                                        href="/settings/teams"
                                        className="text-link"
                                    >
                                        Kelola tim
                                    </Link>
                                </>
                            )}
                        </div>
                    </>
                )}
            </section>
        </>
    );
}

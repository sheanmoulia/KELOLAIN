import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        post('/register');
    };

    return (
        <>
            <Head title="Create Account" />

            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                    {/* Logo and Heading */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-green-700">
                            KELOLAIN
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Manage your food, reduce your waste.
                        </p>

                        <h2 className="mt-8 text-2xl font-semibold text-gray-900">
                            Create an account
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Start managing your food inventory today.
                        </p>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Full Name
                            </label>

                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Enter your name"
                                required
                                autoComplete="name"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            />

                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email Address
                            </label>

                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                placeholder="email@example.com"
                                required
                                autoComplete="email"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            />

                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Password
                            </label>

                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                placeholder="Create a password"
                                required
                                autoComplete="new-password"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            />

                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                placeholder="Confirm your password"
                                required
                                autoComplete="new-password"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                            />

                            {errors.password_confirmation && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing
                                ? 'Creating account...'
                                : 'Create Account'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="font-semibold text-green-700 hover:text-green-800"
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}

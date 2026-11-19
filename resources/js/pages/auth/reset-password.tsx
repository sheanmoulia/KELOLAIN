import KelolainAuth from './KelolainAuth';

export default function ResetPassword({
    token,
    email,
    passwordMin,
}: {
    token: string;
    email: string;
    passwordMin: number;
}) {
    return (
        <KelolainAuth
            mode="reset"
            token={token}
            email={email}
            passwordMin={passwordMin}
        />
    );
}

import KelolainAuth from './KelolainAuth';

export default function Register({ passwordMin }: { passwordMin: number }) {
    return <KelolainAuth mode="register" passwordMin={passwordMin} />;
}

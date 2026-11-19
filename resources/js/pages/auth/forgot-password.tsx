import KelolainAuth from './KelolainAuth';

export default function ForgotPassword({ status }: { status?: string }) {
    return <KelolainAuth mode="forgot" status={status} />;
}

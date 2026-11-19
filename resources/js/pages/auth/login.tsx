import type { TeamInvitationContext } from '@/types';
import KelolainAuth from './KelolainAuth';

type Props = {
    canResetPassword: boolean;
    status?: string;
    teamInvitation?: TeamInvitationContext | null;
};

export default function Login(props: Props) {
    return <KelolainAuth mode="login" {...props} />;
}

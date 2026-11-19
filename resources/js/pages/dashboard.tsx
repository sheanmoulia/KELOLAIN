import { useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import type { DashboardInvitation } from '@/types';
import Workspace, { type WorkspaceProps } from './Workspace';

type Props = WorkspaceProps & { pendingInvitations?: DashboardInvitation[] };

export default function Dashboard({
    pendingInvitations = [],
    ...workspace
}: Props) {
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );

    return (
        <>
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />
            <Workspace {...workspace} />
        </>
    );
}

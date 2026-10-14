import { LogIn } from 'lucide-react';
import { LoginForm } from '@/components/student/login-form';
import { Panel } from '@/components/student/panel';

export function ApplicantLoginPanel() {
    return (
        <Panel title="Applicant Login" icon={LogIn}>
            <LoginForm idPrefix="home-login" />
        </Panel>
    );
}

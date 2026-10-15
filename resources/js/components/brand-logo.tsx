import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

/** Official Health & Family Welfare Department, Tripura emblem. */
export function BrandLogo({ className }: { className?: string }) {
    return <img src={logo} alt="Health & Family Welfare Department, Government of Tripura" className={cn('object-contain', className)} />;
}

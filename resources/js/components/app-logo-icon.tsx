import type { ImgHTMLAttributes } from 'react';
import { BrandLogo } from '@/components/brand-logo';

export default function AppLogoIcon({ className }: ImgHTMLAttributes<HTMLImageElement>) {
    return <BrandLogo className={className} />;
}

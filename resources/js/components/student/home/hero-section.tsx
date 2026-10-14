import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-primary text-white">
            <div className="relative mx-auto max-w-none px-4 py-10 sm:py-16 sm:px-8 lg:px-16 xl:px-24">
                <div className="max-w-3xl">
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                        Recruitment for Health Services, Tripura
                    </h1>
                    <p className="mt-4 text-base text-cyan-50 sm:text-lg">
                        Apply online for posts in the Health &amp; Family Welfare
                        Department, track your application and download admit cards.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Button asChild size="lg" className="h-12 flex-1 rounded-full bg-white px-7 sm:flex-none font-medium text-primary-deep shadow-lg hover:bg-cyan-50">
                            <a href="#recruitments">View Active Recruitments</a>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-12 flex-1 rounded-full border-white/60 bg-white/10 px-7 sm:flex-none font-medium text-white backdrop-blur hover:bg-white/20 hover:text-white">
                            <Link href="/register">New Registration</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

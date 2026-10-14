import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/animate-ui/components/radix/accordion';
import { SectionHeading } from '@/components/student/section-heading';
import type { Faq } from '@/types/student';

export function FaqSection({ faqs }: { faqs: Faq[] }) {
    const half = Math.ceil(faqs.length / 2);
    const columns = [faqs.slice(0, half), faqs.slice(half)];

    return (
        <section id="faq" aria-labelledby="faq-heading" className="mx-auto max-w-none sm:px-8 lg:px-16 xl:px-24 scroll-mt-16 px-4 py-10">
            <SectionHeading id="faq-heading" title="Frequently Asked Questions" />
            <div className="grid gap-x-8 lg:grid-cols-2">
                {columns.map((column, i) => (
                    <Accordion key={i} type="single" collapsible className="rounded-lg border bg-card px-4 self-start">
                        {column.map((faq) => (
                            <AccordionItem key={faq.id} value={faq.id}>
                                <AccordionTrigger className="min-h-11">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ))}
            </div>
        </section>
    );
}

import { ImagePlus } from 'lucide-react';
import { FileField, Section } from '@/components/student/profile/fields';
import type { StepProps } from '@/components/student/profile/types';
import type { UploadsData } from '@/lib/profile';

export function UploadsStep({ data, set, err, rules }: StepProps<UploadsData>) {
    return (
        <div className="grid gap-8">
            <Section title="Upload Photo & Signature" icon={ImagePlus}>
                <FileField id="u-photo" label="Upload Photo" required image field="photo" rule={rules.photo} value={data.photo} onChange={(v) => set({ photo: v })} error={err('photo') ?? err('photo.path')} />
                <FileField id="u-signature" label="Upload Signature" required image field="signature" rule={rules.signature} value={data.signature} onChange={(v) => set({ signature: v })} error={err('signature') ?? err('signature.path')} />
            </Section>
            <div role="note" className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Note:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>Photo: size between 30KB – 200KB, passport size approx 413×531 px, aspect ratio (width ÷ height) 0.75 – 1.5.</li>
                    <li>Signature: size between 30KB – 100KB, wide &amp; short approx 270×90 px, aspect ratio (width ÷ height) 2 – 5.</li>
                    <li>Allowed file formats: .jpg, .jpeg, .png only.</li>
                </ul>
            </div>
        </div>
    );
}

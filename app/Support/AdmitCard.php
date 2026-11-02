<?php

namespace App\Support;

use App\Models\Student\Application;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as DomPdf;
use chillerlan\QRCode\Common\EccLevel;
use chillerlan\QRCode\Output\QRGdImagePNG;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Support\Facades\Storage;

class AdmitCard
{
    public static function pdf(Application $application): DomPdf
    {
        $application->loadMissing(['student.profile', 'recruitment', 'post', 'examCentre', 'exam']);
        $uploads = (array) $application->student->profile?->uploads;

        return Pdf::loadView('pdf.admit-card', [
            'application' => $application,
            'student' => $application->student,
            'recruitment' => $application->recruitment,
            'post' => $application->post,
            'details' => ExamProgress::details($application),
            'photo' => self::embed($uploads['photo']['path'] ?? null),
            'signature' => self::embed($uploads['signature']['path'] ?? null),
            'logo' => self::logo(),
            'qr' => self::qr($application),
        ])->setPaper('a4');
    }

    /** Verification QR: lets the invigilator match the roll number against the candidate list. */
    private static function qr(Application $application): string
    {
        $payload = implode('|', [
            $application->recruitment->advt_no,
            $application->roll_no,
            $application->application_no,
            $application->student->registration_no,
        ]);

        return (new QRCode(new QROptions([
            'outputInterface' => QRGdImagePNG::class,
            'outputBase64' => true,
            'eccLevel' => EccLevel::M,
            'scale' => 6,
            'quietzoneSize' => 1,
        ])))->render($payload);
    }

    private static function logo(): ?string
    {
        $path = resource_path('js/assets/logo.png');

        return is_file($path) ? 'data:image/png;base64,'.base64_encode((string) file_get_contents($path)) : null;
    }

    private static function embed(?string $path): ?string
    {
        $disk = Storage::disk('local');

        if (! $path || str_contains($path, '..') || ! $disk->exists($path)) {
            return null;
        }

        return 'data:'.$disk->mimeType($path).';base64,'.base64_encode($disk->get($path));
    }
}

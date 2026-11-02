@php
    $d = fn ($x) => $x ? \Illuminate\Support\Carbon::parse($x)->format('d.m.Y') : '–';
    $centre = $details['centre'];
    $lines = preg_split('/\r\n|\r|\n/', (string) $details['instructions'], -1, PREG_SPLIT_NO_EMPTY);
@endphp
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Admit Card {{ $details['rollNo'] }}</title>
<style>
    @page { margin: 22px; }
    body { font-family: 'Times-Roman', 'Times New Roman', serif; font-size: 11px; color: #000; margin: 0; padding: 0; }
    .border { position: fixed; top: 0; left: 0; right: 0; bottom: 0; border: 1px solid #222; }
    .page { padding: 26px 34px 0; }
    .center { text-align: center; }
    .org { font-size: 15px; font-weight: bold; margin: 6px 0 0; }
    .addr { font-size: 11px; margin: 2px 0 8px; }
    .cert { font-size: 15px; font-weight: bold; text-decoration: underline; margin: 0 0 8px; }
    .exam { font-size: 13px; font-weight: bold; text-decoration: underline; line-height: 1.3; margin: 0 6px 14px; }
    table { width: 100%; border-collapse: collapse; }
    table.info td { padding: 2.5px 0; vertical-align: top; font-size: 12px; }
    table.info td.k { width: 120px; }
    table.info td.c { width: 12px; }
    .photo { width: 108px; height: 128px; border: 1px solid #aaa; text-align: center; font-size: 10px; color: #666; }
    .photo img { width: 108px; height: 128px; }
    table.sched { margin-top: 14px; }
    table.sched th, table.sched td { border: 1.5px solid #000; padding: 4px 6px; text-align: center; font-size: 11px; }
    h2 { font-size: 12px; font-weight: bold; text-decoration: underline; margin: 12px 0 4px; }
    ol { margin: 0; padding-left: 18px; font-size: 10.5px; }
    li { margin-bottom: 3px; text-align: justify; }
    table.sign { margin-top: 38px; }
    table.sign td { width: 33%; text-align: center; font-size: 11px; vertical-align: bottom; }
    table.sign img { height: 34px; }
    .notes { border: 1px solid #000; padding: 6px 8px; margin-top: 8px; font-size: 10.5px; text-align: justify; }
    .notes p { margin: 0 0 6px; }
</style>
</head>
<body>
<div class="border"></div>
<div class="page">
    <table>
        <tr>
            <td style="width: 90px;"></td>
            <td class="center">@if ($logo)<img src="{{ $logo }}" alt="" style="height: 62px;">@endif</td>
            <td style="width: 90px; text-align: right;"><img src="{{ $qr }}" alt="QR" style="width: 78px; height: 78px;"></td>
        </tr>
    </table>
    <div class="center org">Health &amp; Family Welfare Department</div>
    <div class="center addr">Government of Tripura, Agartala, West Tripura</div>
    <div class="center cert">Provisional Admission Certificate</div>
    <div class="center exam">Written Examination for recruitment to the post of {{ $post->name }} under {{ $recruitment->title }} vide Advt. No. {{ $recruitment->advt_no }}</div>

    <table>
        <tr>
            <td>
                <table class="info">
                    <tr><td class="k">Candidate's Name</td><td class="c">:</td><td>{{ strtoupper($student->full_name) }}</td></tr>
                    <tr><td class="k">Roll Number</td><td class="c">:</td><td><strong>{{ $details['rollNo'] }}</strong></td></tr>
                    <tr><td class="k">Application No.</td><td class="c">:</td><td>{{ $application->application_no }}</td></tr>
                    <tr><td class="k">Registration No.</td><td class="c">:</td><td>{{ $student->registration_no }}</td></tr>
                    <tr><td class="k">Date of Birth</td><td class="c">:</td><td>{{ $student->dob?->format('d.m.Y') }}</td></tr>
                    <tr><td class="k">Category</td><td class="c">:</td><td>{{ $application->category }}</td></tr>
                    <tr><td class="k">Post Applied For</td><td class="c">:</td><td>{{ $post->name }}</td></tr>
                    <tr><td class="k">Examination Centre</td><td class="c">:</td><td>{{ $centre['city'] ?? $centre['name'] ?? '–' }}</td></tr>
                </table>
            </td>
            <td style="width: 112px; vertical-align: top;"><div class="photo">@if ($photo)<img src="{{ $photo }}" alt="Photo">@else Photograph @endif</div></td>
        </tr>
    </table>

    <table class="sched">
        <tr><th style="width: 15%;">Date of Exam</th><th style="width: 40%;">Name of the Venue</th><th style="width: 17%;">Reporting Time</th><th>Timing</th></tr>
        <tr>
            <td>{{ $d($details['examDate']) }}</td>
            <td>{{ $centre['name'] ?? '–' }}@if (! empty($centre['address'])), {{ $centre['address'] }}@endif</td>
            <td>{{ $details['reportingTime'] ?? '–' }}</td>
            <td>{{ $details['startTime'] ?? '–' }} to {{ $details['endTime'] ?? '–' }}</td>
        </tr>
    </table>

    <h2>Instructions to Candidate:</h2>
    <ol>
        <li>The candidate is instructed to carry any one of the valid Photo Identity Card such as PAN Card, Voter ID Card, Driving License, Passport etc. along with Provisional Admission Certificate for presenting to Invigilator as proof of identity as and when demanded.</li>
        <li>The Candidates are to report at the Examination venue by the reporting time mentioned above. No candidate shall be allowed to enter the Examination venue after the Examination has commenced. No functionary has any discretion in this regard.</li>
        <li>If a candidate appears/reports at a centre/venue other than the one indicated in the Admission Certificate, he/she will not be allowed to appear in the examination and his/her candidature is liable to be cancelled.</li>
        <li>Candidate should also note that issue of the Provisional Admission Certificate does not confer the right to claim eligibility. If he/she is found ineligible/unfit on any ground, his/her candidature is liable to be rejected at any stage even after selection/appointment.</li>
        <li>If a candidate does not write his/her Roll No. at the stipulated space of the Answer Script(s), the Answer Script(s) will not be evaluated.</li>
        @foreach ($lines as $line)
            <li>{{ $line }}</li>
        @endforeach
    </ol>

    <table class="sign">
        <tr>
            <td>@if ($signature)<img src="{{ $signature }}" alt=""><br>@endif Signature of Candidate</td>
            <td>Signature of Invigilator</td>
            <td>Controller of Examinations</td>
        </tr>
    </table>

    <div class="notes">
        <p>i. Mobile Phone/Electronic Gadgets etc. are banned in the campus of the Examination Premises. Any Phone/Electronic Gadgets found in possession of any candidate in the Examination Premises shall be confiscated forthwith and he/she may be debarred from appearing at the Examination and also for the Examination(s) to be conducted in future. Violation of such instruction will be dealt as per Law.</p>
        <p style="margin: 0;">ii. Entry in the Examination hall with Face Mask, Jacket, Coat, Cap, Muffler, Scarf, Pull over &amp; this type of garments will not be allowed.</p>
    </div>
</div>
</body>
</html>

@php
    $p = $profile['personal'] ?? [];
    $addr = $profile['address'] ?? [];
    $other = $profile['other_details'] ?? [];
    $exp = $profile['experience'] ?? [];
    $quals = $profile['qualifications'] ?? [];
    $d = fn ($x) => $x ? \Illuminate\Support\Carbon::parse($x)->format('d M Y') : '–';
    $v = fn ($x) => filled($x) ? $x : '–';
    $yn = fn ($x) => $x === 'yes' ? 'Yes' : ($x === 'no' ? 'No' : '–');
    $feeLabel = ['not_required' => 'Not required', 'pending' => 'Pending', 'paid' => 'Paid'];
    $block = fn ($a) => collect([$a['house'] ?? null, $a['street'] ?? null, $a['locality'] ?? null, $a['po'] ?? null, $a['city'] ?? null, $a['district'] ?? null, $a['state'] ?? null])->filter()->implode(', ');
    $experience = ($exp['has_experience'] ?? null) === 'yes' ? ($exp['entries'] ?? []) : [];
@endphp
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Application {{ $application->application_no }}</title>
<style>
    @page { margin: 28px 30px; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 9px; color: #111; }
    h1 { font-size: 13px; text-align: center; margin: 0; }
    h2 { font-size: 9.5px; background: #e5e7eb; margin: 10px 0 0; padding: 3px 5px; border: 1px solid #555; border-bottom: 0; text-transform: uppercase; }
    .sub { text-align: center; margin: 2px 0 8px; }
    table { width: 100%; border-collapse: collapse; }
    td, th { border: 1px solid #555; padding: 3px 5px; vertical-align: top; text-align: left; }
    th { background: #f3f4f6; }
    td.k { width: 22%; font-weight: bold; text-transform: uppercase; }
    td.photo { width: 95px; text-align: center; }
    .photo img { width: 85px; height: 105px; }
    .sig img { width: 110px; height: 36px; }
    .decl { border: 1px solid #555; padding: 5px; text-align: justify; }
    table.foot { margin-top: 14px; }
    table.foot td { border: 0; }
</style>
</head>
<body>
<h1>HEALTH &amp; FAMILY WELFARE DEPARTMENT, GOVERNMENT OF TRIPURA</h1>
<div class="sub">
    <strong>{{ $recruitment->title }}</strong><br>
    Advertisement No. {{ $recruitment->advt_no }}
</div>
<div class="sub"><strong>APPLICATION FORM / ACKNOWLEDGEMENT</strong></div>

<table>
    <tr>
        <td class="k">Application No.</td><td>{{ $application->application_no }}</td>
        <td class="photo" rowspan="6">
            @if ($photo)<img src="{{ $photo }}" alt="Photo"><br>@endif Photo
        </td>
    </tr>
    <tr><td class="k">Registration No.</td><td>{{ $student->registration_no }}</td></tr>
    <tr><td class="k">Post applied for</td><td>{{ $post->name }}@if ($post->code) ({{ $post->code }})@endif</td></tr>
    <tr><td class="k">Applied on</td><td>{{ $application->submitted_at?->format('d M Y, h:i A') }}</td></tr>
    <tr><td class="k">Status</td><td>{{ ucfirst($application->status) }}</td></tr>
    <tr><td class="k">Category applied under</td><td>{{ $application->category }}</td></tr>
</table>

<h2>Post details</h2>
<table>
    <tr><td class="k">Post</td><td>{{ $post->name }}</td><td class="k">Vacancies</td><td>{{ $v($post->total_vacancies) }}</td></tr>
    <tr><td class="k">Monthly salary</td><td>{{ $post->monthly_salary ? '₹ '.$post->monthly_salary : '–' }}</td>
        <td class="k">Engagement</td><td>{{ $post->is_contractual ? 'Contractual'.($post->contract_duration ? ", {$post->contract_duration} {$post->contract_unit}(s)" : '') : 'Regular' }}</td></tr>
    <tr><td class="k">Minimum qualification</td><td colspan="3">{{ $v($post->minimum_qualification) }}</td></tr>
    @if ($post->preferable_qualification)
        <tr><td class="k">Preferable qualification</td><td colspan="3">{{ $post->preferable_qualification }}</td></tr>
    @endif
    <tr><td class="k">Experience required</td><td colspan="3">{{ $post->experience_years ? $post->experience_years.' year(s)' : 'None specified' }}@if ($post->experience_criteria) — {{ $post->experience_criteria }}@endif</td></tr>
</table>

<h2>Personal details</h2>
<table>
    <tr><td class="k">Name</td><td>{{ trim(($p['title'] ?? '').' '.$student->full_name) }}</td><td class="k">Gender</td><td>{{ $v($p['gender'] ?? $student->gender) }}</td></tr>
    <tr><td class="k">Father's name</td><td>{{ $v($p['father_name'] ?? null) }}</td><td class="k">Mother's name</td><td>{{ $v($p['mother_name'] ?? null) }}</td></tr>
    <tr><td class="k">Date of birth</td><td>{{ $d($student->dob) }}</td><td class="k">Marital status</td><td>{{ $v($p['marital_status'] ?? null) }}</td></tr>
    <tr><td class="k">Nationality</td><td>{{ $v($p['nationality'] ?? null) }}</td><td class="k">Mother tongue</td><td>{{ $v($p['mother_tongue'] ?? null) }}</td></tr>
    <tr><td class="k">Mobile</td><td>{{ $student->mobile }}</td><td class="k">Email</td><td>{{ $student->email }}</td></tr>
    <tr><td class="k">Aadhaar no.</td><td>{{ $v($p['aadhaar_no'] ?? null) }}</td><td class="k">Name on Aadhaar</td><td>{{ $v($p['aadhaar_name'] ?? null) }}</td></tr>
    <tr><td class="k">Category</td><td>{{ $v($p['category'] ?? $student->category) }}</td><td class="k">Category certificate</td>
        <td>@if (! empty($p['cert_number'])){{ $p['cert_number'] }}, {{ $v($p['cert_district'] ?? null) }}, {{ $d($p['cert_date'] ?? null) }}@else – @endif</td></tr>
    <tr><td class="k">Tripura resident</td><td>{{ $yn($p['is_tripura_resident'] ?? null) }}</td><td class="k">PRTC</td>
        <td>@if (! empty($p['prtc_number'])){{ $p['prtc_number'] }}, {{ $v($p['prtc_district'] ?? null) }}, {{ $d($p['prtc_issue_date'] ?? null) }}@else – @endif</td></tr>
    <tr><td class="k">Person with disability</td><td>{{ $yn($p['is_pwd'] ?? null) }}@if (! empty($p['ph_percentage'])) ({{ $p['ph_percentage'] }}%)@endif</td>
        <td class="k">BPL</td><td>{{ $yn($other['is_bpl'] ?? null) }}@if (! empty($other['bpl_number'])) — {{ $other['bpl_number'] }}@endif</td></tr>
    <tr><td class="k">Govt. employee</td><td>{{ $yn($other['is_govt_employee'] ?? null) }}</td><td class="k">Ex-serviceman</td><td>{{ $yn($other['is_ex_serviceman'] ?? null) }}</td></tr>
</table>

<h2>Address details</h2>
<table>
    <tr><th style="width:50%">Permanent address</th><th>Correspondence address</th></tr>
    <tr><td>{{ $v($block($addr['permanent'] ?? [])) }}<br>PS: {{ $v($addr['permanent']['ps'] ?? null) }} &nbsp; PIN: {{ $v($addr['permanent']['pincode'] ?? null) }}</td>
        <td>{{ $v($block($addr['correspondence'] ?? [])) }}<br>PS: {{ $v($addr['correspondence']['ps'] ?? null) }} &nbsp; PIN: {{ $v($addr['correspondence']['pincode'] ?? null) }}</td></tr>
</table>

<h2>Educational qualifications</h2>
<table>
    <tr><th>Qualification</th><th>Stream / subject</th><th>Board / university</th><th>Year</th><th>Result</th><th>Marks</th></tr>
    @forelse ($quals as $q)
        <tr>
            <td>{{ $v($q['type'] ?? null) }}</td><td>{{ $v($q['stream'] ?? null) }}</td>
            <td>{{ $v($q['board'] ?? null) }}@if (! empty($q['state'])), {{ $q['state'] }}@endif</td>
            <td>{{ $v($q['year'] ?? null) }}</td><td>{{ $v($q['result_status'] ?? null) }}</td>
            <td>{{ isset($q['percentage']) ? $q['percentage'].'%' : '–' }}@if (! empty($q['out_of'])) ({{ $q['obtained'] }}/{{ $q['out_of'] }})@endif</td>
        </tr>
    @empty
        <tr><td colspan="6">–</td></tr>
    @endforelse
</table>

<h2>Work experience</h2>
<table>
    <tr><th>Employer</th><th>Designation</th><th>Sector</th><th>From</th><th>To</th></tr>
    @forelse ($experience as $e)
        <tr>
            <td>{{ $v($e['employer'] ?? null) }}</td><td>{{ $v($e['designation'] ?? null) }}</td><td>{{ $v($e['sector'] ?? null) }}</td>
            <td>{{ $d($e['from_date'] ?? null) }}</td><td>{{ ! empty($e['currently_working']) ? 'Present' : $d($e['to_date'] ?? null) }}</td>
        </tr>
    @empty
        <tr><td colspan="5">No experience declared.</td></tr>
    @endforelse
</table>

<h2>Payment details</h2>
<table>
    <tr><td class="k">Application fee</td><td>{{ $application->fee_amount > 0 ? '₹ '.number_format($application->fee_amount, 2) : 'No fee' }}</td>
        <td class="k">Fee status</td><td>{{ $feeLabel[$application->fee_status] ?? $application->fee_status }}</td></tr>
    @if ($recruitment->fee_last_date)
        <tr><td class="k">Last date for fee payment</td><td colspan="3">{{ $d($recruitment->fee_last_date) }}</td></tr>
    @endif
</table>

<h2>Important dates</h2>
<table>
    @foreach ($dates as $row)
        <tr><td class="k">{{ $row['label'] }}</td><td>{{ $d($row['date']) }}</td></tr>
    @endforeach
</table>

<h2>Declaration</h2>
<div class="decl">
    I declare that all the information in my profile is true and complete. I understand that my application will be rejected, or my selection cancelled, if any detail is found to be false.
</div>

<table class="foot">
    <tr>
        <td>Date: {{ $application->submitted_at?->format('d M Y') }}</td>
        <td class="sig" style="text-align:right">@if ($signature)<img src="{{ $signature }}" alt="Signature"><br>@endif Signature of the candidate</td>
    </tr>
</table>
<p style="text-align:center;color:#555">Computer-generated acknowledgement. Please retain it for future reference.</p>
</body>
</html>

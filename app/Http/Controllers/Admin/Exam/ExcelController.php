<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;

/**
 * Reads whatever spreadsheet the department sends. There is no fixed format, so this only returns
 * the header row and the rows beneath it; the admin picks which column means what.
 */
class ExcelController extends Controller
{
    private const MAX_ROWS = 5000;

    public function __invoke(Request $request): JsonResponse
    {
        $request->validate(['file' => ['required', 'file', 'mimes:xlsx,xls,csv,txt', 'max:5120']]);

        try {
            $reader = IOFactory::createReaderForFile($request->file('file')->getRealPath());
            $reader->setReadDataOnly(true);
            $sheet = $reader->load($request->file('file')->getRealPath())->getActiveSheet();
            $grid = $sheet->toArray(null, true, false, false);
        } catch (\Throwable) {
            return response()->json(['message' => 'This file could not be read. Upload an .xlsx, .xls or .csv file.'], 422);
        }

        $grid = array_values(array_filter(
            array_map(fn ($row) => array_map(fn ($v) => trim((string) $v), $row), $grid),
            fn ($row) => implode('', $row) !== '',
        ));

        if (count($grid) < 2) {
            return response()->json(['message' => 'The file needs a header row and at least one data row.'], 422);
        }

        $headers = collect($grid[0])->map(fn ($h, $i) => $h !== '' ? $h : 'Column '.($i + 1))->all();
        $width = count($headers);
        $rows = array_map(fn ($r) => array_pad(array_slice($r, 0, $width), $width, ''), array_slice($grid, 1, self::MAX_ROWS));

        return response()->json(['headers' => $headers, 'rows' => $rows]);
    }
}

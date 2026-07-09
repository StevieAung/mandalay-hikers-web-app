<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

abstract class Controller
{
    protected function imageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return str_starts_with($path, 'http') ? $path : Storage::url($path);
    }

    protected function storeImage(Request $request, string $field, string $directory): ?string
    {
        if (! $request->hasFile($field)) {
            return $request->input($field);
        }

        return $request->file($field)->store($directory, 'public');
    }
}

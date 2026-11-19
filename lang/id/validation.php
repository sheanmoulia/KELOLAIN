<?php

return [
    'before_or_equal' => ':Attribute tidak boleh setelah :date.',
    'boolean' => ':Attribute harus dipilih.',
    'confirmed' => 'Konfirmasi :attribute tidak cocok.',
    'current_password' => 'Kata sandi saat ini salah.',
    'date_format' => ':Attribute harus berupa tanggal yang valid.',
    'decimal' => ':Attribute maksimal dua angka desimal.',
    'email' => 'Masukkan alamat email yang valid.',
    'in' => 'Pilihan :attribute tidak valid.',
    'integer' => ':Attribute harus berupa bilangan bulat.',
    'max' => [
        'numeric' => ':Attribute maksimal :max.',
        'string' => ':Attribute maksimal :max karakter.',
    ],
    'min' => [
        'numeric' => ':Attribute minimal :min.',
        'string' => ':Attribute minimal :min karakter.',
    ],
    'numeric' => ':Attribute harus berupa angka.',
    'required' => ':Attribute wajib diisi.',
    'string' => ':Attribute harus berupa teks.',
    'unique' => ':Attribute sudah digunakan.',
    'attributes' => [
        'name' => 'nama', 'password' => 'kata sandi', 'qty' => 'jumlah', 'price' => 'harga',
        'category' => 'kategori', 'unit' => 'satuan', 'storage' => 'lokasi penyimpanan',
        'buyDate' => 'tanggal pembelian', 'reason' => 'alasan', 'date' => 'tanggal pembuangan',
    ],
    'values' => [
        'buyDate' => ['today' => 'hari ini'],
        'date' => ['today' => 'hari ini'],
    ],
];

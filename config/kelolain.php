<?php

return [
    'email_enabled' => (bool) env('EMAIL_ENABLED', false),
    'storage' => ['room_temperature' => 'Suhu ruang', 'refrigerator' => 'Kulkas', 'freezer' => 'Freezer'],
    'units' => ['kg', 'gr', 'buah', 'ikat', 'liter', 'ml', 'kotak', 'pack', 'botol'],
    'reasons' => ['Busuk', 'Kedaluwarsa', 'Terlalu matang', 'Bau tidak sedap', 'Kemasan rusak', 'Lainnya'],
    'icons' => [
        'Sayur' => '🥬', 'Buah' => '🍎', 'Daging' => '🍗', 'Seafood' => '🦐',
        'Susu' => '🥛', 'Telur' => '🥚', 'Bumbu' => '🧅', 'Lainnya' => '📦',
    ],
];

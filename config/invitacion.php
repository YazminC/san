<?php

return [
    'destinataria' => trim((string) env('INVITATION_NAME', 'Sandy')) ?: 'Sandy',
    'fechas_bloqueadas' => [
        '2026-12-17',
        '2026-12-18',
    ],

    'ciudades' => [
        'cdmx' => [
            'nombre' => 'Ciudad de México',
            'corto' => 'CDMX',
            'detalle' => 'Muchos rinconcitos bonitos para una cita.',
            'emoji' => '🌆',
            'lugares' => [
                'coyoacan' => [
                    'nombre' => 'Cafecito en Coyoacán',
                    'detalle' => 'Calles bonitas, algo dulce y plática sin prisa.',
                    'emoji' => '☕',
                ],
                'chapultepec' => [
                    'nombre' => 'Paseo por Chapultepec',
                    'detalle' => 'Un paseíto entre árboles, con helado incluido.',
                    'emoji' => '🌳',
                ],
                'roma' => [
                    'nombre' => 'Cena en la Roma',
                    'detalle' => 'Algo rico, luces bonitas y tiempo para nosotros.',
                    'emoji' => '🍝',
                ],
                'otro' => [
                    'nombre' => 'Otro lugar',
                    'detalle' => 'Escribe el lugar que tienes en mente.',
                    'emoji' => '✨',
                ],
            ],
        ],
        'toluca' => [
            'nombre' => 'Toluca',
            'corto' => 'Toluca',
            'detalle' => 'Un plan tranquilo y bonito cerca de casa.',
            'emoji' => '🏙️',
            'lugares' => [
                'cosmovitral' => [
                    'nombre' => 'Paseo por el Cosmovitral',
                    'detalle' => 'Colores preciosos, una caminata y cafecito.',
                    'emoji' => '🌷',
                ],
                'portales' => [
                    'nombre' => 'Cafecito en Los Portales',
                    'detalle' => 'Un antojito, buena plática y paseo por el centro.',
                    'emoji' => '☕',
                ],
                'matlatzincas' => [
                    'nombre' => 'Atardecer en El Calvario',
                    'detalle' => 'Un paseíto con vistas bonitas y algo rico después.',
                    'emoji' => '🌇',
                ],
                'otro' => [
                    'nombre' => 'Otro lugar',
                    'detalle' => 'Escribe el lugar que tienes en mente.',
                    'emoji' => '✨',
                ],
            ],
        ],
    ],
];

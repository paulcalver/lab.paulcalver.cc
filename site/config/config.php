<?php

return [
    'debug' => false,
    'panel' => [
        'install' => true,
        'slug' => 'panel'
    ],
    'templates' => [
        'vue' => false
    ],
    'routes' => [
        [
            'pattern' => '/',
            'action'  => function () {
                return new Kirby\Cms\Page([
                    'slug' => 'home',
                    'template' => 'site',
                    'model' => 'site'
                ]);
            }
        ]
    ]
];

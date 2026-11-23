<?php

/**
 * Extension Manager/Repository config file for ext "slub_web_kartenforum".
 */
$EM_CONF[$_EXTKEY] = [
    'title' => 'SLUB Kartenforum',
    'description' => '',
    'category' => 'templates',
    'constraints' => [
        'depends' => [
            'typo3' => '14.3.0-14.3.99'
        ],
        'conflicts' => [
        ],
    ],
    'autoload' => [
        'psr-4' => [
            'Slub\\SlubWebKartenforum\\' => 'Classes',
        ],
    ],
    'state' => 'stable',
    'uploadfolder' => 0,
    'createDirs' => '',
    'clearCacheOnLoad' => 1,
    'author' => 'Alexander Bigga',
    'author_email' => 'typo3@slub-dresden.de',
    'author_company' => 'SLUB Dresden',
    'version' => '3.0.0',
];

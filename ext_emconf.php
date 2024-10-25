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
            'typo3' => '10.4.0-12.4.15'
        ],
        'conflicts' => [
        ],
    ],
    'autoload' => [
        'psr-4' => [
            'SlubDresden\\SlubKartenforum\\' => 'Classes',
        ],
    ],
    'state' => 'stable',
    'uploadfolder' => 0,
    'createDirs' => '',
    'clearCacheOnLoad' => 1,
    'author' => 'Alexander Bigga',
    'author_email' => 'typo3@slub-dresden.de',
    'author_company' => 'SLUB Dresden',
    'version' => '2.4.0',
];

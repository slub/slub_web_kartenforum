<?php

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

defined('TYPO3_MODE') || die();

/***************
 * Configure backend tabs and palettes for the new content elements
 */
$contentElementConfig = [
    'showitem' => '
        --palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.general;general,
        pi_flexform,
        --div--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:tabs.access,
        --palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.visibility;visibility,
        --palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.access;access,
    '
];

/***************
 * Enhance available content elements
 */
$orgTca = $GLOBALS['TCA']['tt_content'];
$overrideTca = [
    'ctrl' => [
        'typeicon_classes' => [
            'slubwebkartenforum_signup' => 'VkfSignup',
            'slubwebkartenforum_map' => 'VkfMap',
            'slubwebkartenforum_apps' => 'VkfApps',
            'slubwebkartenforum_georeference' => 'VkfGeoref',
            'slubwebkartenforum_admin' => 'VkfAdmin',
            'slubwebkartenforum_mosaicmap' => 'VkfGeoref',
            'slubwebkartenforum_upload' => 'VkfGeoref',
        ],
    ],
    'types' => [
        'slubwebkartenforum_signup' => $contentElementConfig,
        'slubwebkartenforum_map' => $contentElementConfig,
        'slubwebkartenforum_apps' => $contentElementConfig,
        'slubwebkartenforum_georeference' => $contentElementConfig,
        'slubwebkartenforum_admin' => $contentElementConfig,
        'slubwebkartenforum_mosaicmap' => $contentElementConfig,
        'slubwebkartenforum_upload' => $contentElementConfig,
    ],
    'columns' => [
        'CType' => [
            'config' => [
                'items' => [
                    [
                        'SLUB Kartenforum',
                        '--div--'
                    ],
                    [
                        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.signup',
                        'slubwebkartenforum_signup',
                        'VkfSignup'
                    ],
                    [
                        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.map',
                        'slubwebkartenforum_map',
                        'VkfMap'
                    ],
                    [
                        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.apps',
                        'slubwebkartenforum_apps',
                        'VkfApps'
                    ],
                    [
                        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.admin',
                        'slubwebkartenforum_admin',
                        'VkfAdmin'
                    ],
                    [
                        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.georeference',
                        'slubwebkartenforum_georeference',
                        'VkfGeoref'
                    ],
                    [
                        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.mosaic-map',
                        'slubwebkartenforum_mosaicmap',
                        'VkfMosaicMap'
                    ],
                    [
                        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.upload',
                        'slubwebkartenforum_upload',
                        'VkfUpload'
                    ],
                ]
            ]
        ]
    ]
];
$GLOBALS['TCA']['tt_content'] = array_merge_recursive($orgTca, $overrideTca);


/***************
 * Add dedicated flexform setups for the new content elements
 */
ExtensionManagementUtility::addPiFlexFormValue('*', 'FILE:EXT:slub_web_kartenforum/Configuration/FlexForms/flexform_apps.xml', 'slubwebkartenforum_apps');
ExtensionManagementUtility::addPiFlexFormValue('*', 'FILE:EXT:slub_web_kartenforum/Configuration/FlexForms/flexform_georeference.xml', 'slubwebkartenforum_georeference');
ExtensionManagementUtility::addPiFlexFormValue('*', 'FILE:EXT:slub_web_kartenforum/Configuration/FlexForms/flexform_signup.xml', 'slubwebkartenforum_signup');

<?php

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

defined('TYPO3_MODE') || die();

/***************
 * Make new content elements selectable in TYPO3 backend
 */
$backupCTypeItems = $GLOBALS['TCA']['tt_content']['columns']['CType']['config']['items'];
$GLOBALS['TCA']['tt_content']['columns']['CType']['config']['items'] = [
    [
        'SLUB Kartenforum',
        '--div--'
    ],
    [
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.signup',
        'slubwebkartenforum_signup',
        'EXT:slub_web_kartenforum/Resources/Public/Icons/Backend/Signup.svg'
    ],
    [
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.map',
        'slubwebkartenforum_map',
        'EXT:slub_web_kartenforum/Resources/Public/Icons/Backend/Map.svg'
    ],
    [
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.apps',
        'slubwebkartenforum_apps',
        'EXT:slub_web_kartenforum/Resources/Public/Icons/Backend/Apps.svg'
    ],
    [
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.georeference',
        'slubwebkartenforum_georeference',
        'EXT:slub_web_kartenforum/Resources/Public/Icons/Backend/Georef.svg'
    ],
];
foreach ($backupCTypeItems as $key => $value) {
    $GLOBALS['TCA']['tt_content']['columns']['CType']['config']['items'][] = $value;
}
unset($key, $value, $backupCTypeItems);

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

$GLOBALS['TCA']['tt_content']['types']['slubwebkartenforum_signup'] = $contentElementConfig;
$GLOBALS['TCA']['tt_content']['types']['slubwebkartenforum_map'] = $contentElementConfig;
$GLOBALS['TCA']['tt_content']['types']['slubwebkartenforum_apps'] = $contentElementConfig;
$GLOBALS['TCA']['tt_content']['types']['slubwebkartenforum_georeference'] = $contentElementConfig;

/***************
 * Add dedicated flexform setups for the new content elements
 */
ExtensionManagementUtility::addPiFlexFormValue('*', 'FILE:EXT:slub_web_kartenforum/Configuration/FlexForms/flexform_apps.xml', 'slubwebkartenforum_apps');
ExtensionManagementUtility::addPiFlexFormValue('*', 'FILE:EXT:slub_web_kartenforum/Configuration/FlexForms/flexform_georeference.xml', 'slubwebkartenforum_georeference');
ExtensionManagementUtility::addPiFlexFormValue('*', 'FILE:EXT:slub_web_kartenforum/Configuration/FlexForms/flexform_signup.xml', 'slubwebkartenforum_signup');

<?php

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

defined('TYPO3') || die();

/*
 * Configure backend tabs and palettes for the new content elements.
 * The "Plugin Options" field (pi_flexform) is only shown for elements with a FlexForm.
 */
$showitem = static fn (bool $withFlexForm): string => '
    --palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.general;general,
    ' . ($withFlexForm ? 'pi_flexform,' : '') . '
    --div--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:tabs.access,
    --palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.visibility;visibility,
    --palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.access;access,
';

/*
 * Enhance available content elements: CType => [label key, icon identifier, FlexForm file or null]
 */
$contentElements = [
    'slubwebkartenforum_signup' => ['plugin.signup', 'VkfSignup', 'FILE:EXT:slub_web_kartenforum/Configuration/FlexForms/flexform_signup.xml'],
    'slubwebkartenforum_map' => ['plugin.map', 'VkfMap', null],
    'slubwebkartenforum_apps' => ['plugin.apps', 'VkfApps', 'FILE:EXT:slub_web_kartenforum/Configuration/FlexForms/flexform_apps.xml'],
    'slubwebkartenforum_admin' => ['plugin.admin', 'VkfAdmin', null],
    'slubwebkartenforum_georeference' => ['plugin.georeference', 'VkfGeoref', null],
    'slubwebkartenforum_mosaicmap' => ['plugin.mosaic-map', 'VkfMap', null],
    'slubwebkartenforum_upload' => ['plugin.upload', 'VkfMap', null],
];

/*
 * The group and items are also used by the "New content element" wizard
 */
ExtensionManagementUtility::addTcaSelectItemGroup(
    'tt_content',
    'CType',
    'slubwebkartenforum',
    'SLUB Kartenforum'
);

foreach ($contentElements as $cType => [$labelKey, $icon, $flexForm]) {
    ExtensionManagementUtility::addTcaSelectItem(
        'tt_content',
        'CType',
        [
            'label' => 'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:' . $labelKey,
            'value' => $cType,
            'icon' => $icon,
            'group' => 'slubwebkartenforum',
        ]
    );
    $GLOBALS['TCA']['tt_content']['ctrl']['typeicon_classes'][$cType] = $icon;
    $GLOBALS['TCA']['tt_content']['types'][$cType] = ['showitem' => $showitem($flexForm !== null)];
    if ($flexForm !== null) {
        $GLOBALS['TCA']['tt_content']['types'][$cType]['columnsOverrides']['pi_flexform']['config']['ds'] = $flexForm;
    }
}

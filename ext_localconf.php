<?php

use \TYPO3\CMS\Core\Utility\GeneralUtility;
use \TYPO3\CMS\Core\Imaging\IconRegistry;
use \TYPO3\CMS\Core\Imaging\IconProvider\SvgIconProvider;

defined('TYPO3_MODE') || die();

/***************
 * Add default RTE configuration
 */
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['slub_web_kartenforum'] = 'EXT:slub_web_kartenforum/Configuration/RTE/Default.yaml';

/***************
 * Register some icons to use them in the backend via IconIdentifiers
 */
$iconRegistry = GeneralUtility::makeInstance(IconRegistry::class);
$icons = ['Signup', 'Map', 'Apps', 'Georef'];
foreach ($icons as $icon) {
    $iconRegistry->registerIcon(
        'Vkf' . $icon,
        SvgIconProvider::class,
        ['source' => 'EXT:slub_web_kartenforum/Resources/Public/Icons/Backend/' . $icon . '.svg']
    );
}

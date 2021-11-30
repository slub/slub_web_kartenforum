<?php

use \TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
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

/***************
 * Pass some extension configuration variables to typoscript constants
 */
ExtensionManagementUtility::addTypoScriptConstants("plugin.tx_slubwebkartenforum.settings.urlNominatim= " . $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['slub_web_kartenforum']['urlNominatim']);
ExtensionManagementUtility::addTypoScriptConstants("plugin.tx_slubwebkartenforum.settings.urlOsmMaps= " . $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['slub_web_kartenforum']['urlOsmMaps']);
ExtensionManagementUtility::addTypoScriptConstants("plugin.tx_slubwebkartenforum.settings.urlSearch= " . $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['slub_web_kartenforum']['urlSearch']);

/***************
 * Enable direct extension access through ajax requests
 */
 \TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
 	'Slub.SlubWebKartenforum',
 	'signup',
 	[
 		'Auth' => 'login, signup, logout, loginError',
    ],
 	// non-cacheable actions
 	[
        'Auth' => 'login, signup, logout, loginError',
    ]
);

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
	'Slub.SlubWebKartenforum',
	'georeference',
	[
        'Georef' => 'getTransformationByMapId, getStatistics, getTransformationForValidation, getUserHistory, postJob, postTransformationByMapId, postTransformationTry',
    ],
	// non-cacheable actions
	[
        'Georef' => 'getTransformationByMapId, getStatistics, getTransformationForValidation, getUserHistory, postJob, postTransformationByMapId, postTransformationTry',
    ],
);


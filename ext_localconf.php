<?php

use Slub\SlubWebKartenforum\Controller\AuthController;
use Slub\SlubWebKartenforum\Controller\GeorefController;
use TYPO3\CMS\Core\Core\Environment;
use \TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use \TYPO3\CMS\Core\Utility\GeneralUtility;
use \TYPO3\CMS\Core\Imaging\IconRegistry;
use \TYPO3\CMS\Core\Imaging\IconProvider\SvgIconProvider;
use TYPO3\CMS\Extbase\Utility\ExtensionUtility;

defined('TYPO3_MODE') || die();

/***************
 * Add default RTE configuration
 */
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['slub_web_kartenforum'] = 'EXT:slub_web_kartenforum/Configuration/RTE/Default.yaml';
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['slub_web_kartenforum_minimal'] = 'EXT:slub_web_kartenforum/Configuration/RTE/Minimal.yaml';

/***************
 * Register some icons to use them in the backend via IconIdentifiers
 */
$iconRegistry = GeneralUtility::makeInstance(IconRegistry::class);
$icons = ['Signup', 'Map', 'Apps', 'Georef', 'Admin'];
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
ExtensionManagementUtility::addTypoScriptConstants("plugin.tx_slubwebkartenforum.settings.enableTilePreloading= " . $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['slub_web_kartenforum']['enableTilePreloading']);
ExtensionManagementUtility::addTypoScriptConstants("plugin.tx_slubwebkartenforum.settings.basemaps= " . $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['slub_web_kartenforum']['basemaps']);
ExtensionManagementUtility::addTypoScriptConstants("plugin.tx_slubwebkartenforum.settings.mapView= " . $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['slub_web_kartenforum']['mapView']);
ExtensionManagementUtility::addTypoScriptConstants("plugin.tx_slubwebkartenforum.settings.urlNominatim= " . $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['slub_web_kartenforum']['urlNominatim']);
ExtensionManagementUtility::addTypoScriptConstants("plugin.tx_slubwebkartenforum.settings.urlSearch= " . $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['slub_web_kartenforum']['urlSearch']);
ExtensionManagementUtility::addTypoScriptConstants("plugin.tx_slubwebkartenforum.settings.terrain= " . $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['slub_web_kartenforum']['terrain']);

/***************
 * Enable direct extension access through ajax requests
 */
ExtensionUtility::configurePlugin(
    'SlubWebKartenforum',
    'signup',
    [AuthController::class => 'signup, addUser'],
    [AuthController::class => '',],
    ExtensionUtility::PLUGIN_TYPE_CONTENT_ELEMENT
);

ExtensionUtility::configurePlugin(
    'SlubWebKartenforum',
    'georeference',
    [GeorefController::class => 'getStatistics, getTransformationForMapId, getTransformationForUserId, getTransformationForValidation, getUserHistory, postJob, postTransformationByMapId, getTest, postMapView, getMapView, getMosaicMaps, postMosaicMaps, postMosaicMap, refreshMosaicMap, deleteMosaicMap'],
    [GeorefController::class => 'getStatistics, getTransformationForMapId, getTransformationForUserId, getTransformationForValidation, getUserHistory, postJob, postTransformationByMapId, getTest, postMapView, getMapView, getMosaicMaps, postMosaicMaps, postMosaicMap, refreshMosaicMap, deleteMosaicMap'],
    ExtensionUtility::PLUGIN_TYPE_CONTENT_ELEMENT
);

/***************
 * Setup for Login Background and Backend Logo
 */
$applicationContext = Environment::getContext();
$loginFootnote = ($applicationContext->isProduction()) ? '...' : 'Development System ';
$GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['backend'] = [
    'loginBackgroundImage' => 'EXT:slub_web_kartenforum/Resources/Public/Images/loginbg.jpg',
    'loginLogo' => 'EXT:slub_web_kartenforum/Resources/Public/Icons/VkfLogoLogin.svg',
    'loginHighlightColor' => '#ff3333',
    'loginFootnote' => $loginFootnote . 'by PIKOBYTES GmbH',
    'backendLogo' => 'EXT:slub_web_kartenforum/Resources/Public/Icons/VkfLogoBackend.svg',
];

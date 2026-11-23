<?php

use Slub\SlubWebKartenforum\Controller\AuthController;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Extbase\Utility\ExtensionUtility;

defined('TYPO3') || die();

/*
 * Add default RTE configuration
 */
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['slub_web_kartenforum'] = 'EXT:slub_web_kartenforum/Configuration/RTE/Default.yaml';
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['slub_web_kartenforum_minimal'] = 'EXT:slub_web_kartenforum/Configuration/RTE/Minimal.yaml';

/*
 * Enable direct extension access through ajax requests
 */
ExtensionUtility::configurePlugin(
    'SlubWebKartenforum',
    'signup',
    [AuthController::class => 'signup, addUser'],
    [
        AuthController::class => '',
    ]
);

/*
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

/*
 * The apps read these query parameters in the browser (permalinks, georeferencer
 * links), so they must not cause a cHash error where its validation is enforced
 */
$GLOBALS['TYPO3_CONF_VARS']['FE']['cacheHash']['excludedParameters'] = array_merge(
    $GLOBALS['TYPO3_CONF_VARS']['FE']['cacheHash']['excludedParameters'] ?? [],
    [
        // map
        'map_id', 'oid', 'b', 'v', 'c', 'z', 'be', 'p', 'fid', 'foid', 'map_view_id',
        // map, legacy camera parameters
        'r', 'd', 'u', 'ri',
        // georeferencer
        'transformation_id',
    ]
);

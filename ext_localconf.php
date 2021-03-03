<?php
defined('TYPO3_MODE') || die();

/***************
 * Add default RTE configuration
 */
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['slub_web_kartenforum'] = 'EXT:slub_web_kartenforum/Configuration/RTE/Default.yaml';

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
	'Slub.' . $_EXTKEY,
	'Signup',
	[
		'Auth' => 'login, signup, logout, loginError',
    ],
	// non-cacheable actions
	[
        'Auth' => 'login, signup, logout, loginError',
    ]
);

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
	'Slub.' . $_EXTKEY,
	'Georef',
	[
		'Georef' => 'ranking',
    ],
	// non-cacheable actions
	[
    ]
);

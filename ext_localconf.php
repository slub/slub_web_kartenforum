<?php
defined('TYPO3_MODE') || die();

/***************
 * Add default RTE configuration
 */
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['slub_web_kartenforum'] = 'EXT:slub_web_kartenforum/Configuration/RTE/Default.yaml';

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
	'Slub.SlubWebKartenforum',
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
	'Slub.SlubWebKartenforum',
	'ranking',
	[
		'Georef' => 'ranking',
    ],
	// non-cacheable actions
	[
    ]
);

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
	'Slub.SlubWebKartenforum',
	'history',
	[
		'Georef' => 'history',
    ],
	// non-cacheable actions
	[
    ]
);

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
	'Slub.SlubWebKartenforum',
	'mapprofile',
	[
		'Elasticsearch' => 'mapprofile',
    ],
	// non-cacheable actions
	[
		'Elasticsearch' => 'mapprofile',
    ]
);

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
	'Slub.SlubWebKartenforum',
	'choosepage',
	[
		'Elasticsearch' => 'choosepage',
    ],
	// non-cacheable actions
	[
    ]
);

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
	'Slub.SlubWebKartenforum',
	'map',
	[
		'App' => 'map',
    ],
	// non-cacheable actions
);

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
	'Slub.SlubWebKartenforum',
	'georeference',
	[
		'App' => 'georeference',
        'Georef' => 'getProcess, validateGeorefProcess',
    ],
	// non-cacheable actions
	[
        'Georef' => 'getProcess, validateGeorefProcess',
    ],
);

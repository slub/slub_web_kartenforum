<?php
defined('TYPO3') || die();

call_user_func(function () {
    /** Temporary variables */
    $extensionKey = 'slub_web_kartenforum';

    /** Default PageTS for SlubKartenforum */
    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::registerPageTSConfigFile(
        $extensionKey,
        'Configuration/TsConfig/Page/All.tsconfig',
        'SLUB Kartenforum'
    );
});

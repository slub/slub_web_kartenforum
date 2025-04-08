<?php
defined('TYPO3') || die();

call_user_func(function () {
    /** Temporary variables */
    $extensionKey = 'slub_web_kartenforum';

    /** Default TypoScript for SlubKartenforum */
    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile(
        $extensionKey,
        'Configuration/TypoScript',
        'SLUB Kartenforum'
    );
});

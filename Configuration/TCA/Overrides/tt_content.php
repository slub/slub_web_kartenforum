<?php
defined('TYPO3_MODE') || die();

call_user_func(function()
{
    \TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
        'Slub.SlubWebKartenforum',
        'Signup',
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.signup'
    );
});

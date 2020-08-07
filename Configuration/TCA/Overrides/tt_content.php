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

#
# Defines a flexform for the plugin search
#
$pluginSignatureSearch  = 'slubwebkartenforum_signup';
$GLOBALS['TCA']['tt_content']['types']['list']['subtypes_excludelist'][$pluginSignatureSearch] = 'layout,select_key,pages,recursive';
$GLOBALS['TCA']['tt_content']['types']['list']['subtypes_addlist'][$pluginSignatureSearch] = 'pi_flexform';
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPiFlexFormValue($pluginSignatureSearch, 'FILE:EXT:slub_web_kartenforum/Configuration/FlexForms/flexform_signup.xml');

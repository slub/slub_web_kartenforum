<?php
defined('TYPO3_MODE') || die();

call_user_func(function()
{
    \TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
        'Slub.SlubWebKartenforum',
        'Signup',
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.signup'
    );

    \TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
        'Slub.SlubWebKartenforum',
        'Georef',
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.georef'
    );
});

#
# Defines a flexform for the plugin signup
#
$pluginSignatureSearch  = 'slubwebkartenforum_signup';
$GLOBALS['TCA']['tt_content']['types']['list']['subtypes_excludelist'][$pluginSignatureSearch] = 'layout,select_key,pages,recursive';
$GLOBALS['TCA']['tt_content']['types']['list']['subtypes_addlist'][$pluginSignatureSearch] = 'pi_flexform';
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPiFlexFormValue($pluginSignatureSearch, 'FILE:EXT:slub_web_kartenforum/Configuration/FlexForms/flexform_signup.xml');

#
# Defines a flexform for the plugin georef
#
$pluginSignatureSearch  = 'slubwebkartenforum_georef';
$GLOBALS['TCA']['tt_content']['types']['list']['subtypes_excludelist'][$pluginSignatureSearch] = 'layout,select_key,pages,recursive';
$GLOBALS['TCA']['tt_content']['types']['list']['subtypes_addlist'][$pluginSignatureSearch] = 'pi_flexform';
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPiFlexFormValue($pluginSignatureSearch, 'FILE:EXT:slub_web_kartenforum/Configuration/FlexForms/flexform_georef.xml');

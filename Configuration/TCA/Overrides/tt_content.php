<?php
defined('TYPO3_MODE') || die();

call_user_func(function()
{
    \TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
        'Slub.SlubWebKartenforum',
        'Map',
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.map'
    );

    \TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
        'Slub.SlubWebKartenforum',
        'Signup',
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.signup'
    );

    \TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
        'Slub.SlubWebKartenforum',
        'Ranking',
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.georef'
    );

    \TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
        'Slub.SlubWebKartenforum',
        'History',
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.history'
    );

    \TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
        'Slub.SlubWebKartenforum',
        'Mapprofile',
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.mapprofile'
    );

    \TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
        'Slub.SlubWebKartenforum',
        'Choosepage',
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.choosepage'
    );

    \TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerPlugin(
        'Slub.SlubWebKartenforum',
        'Georeference',
        'LLL:EXT:slub_web_kartenforum/Resources/Private/Language/locallang.xlf:plugin.georeference'
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
$pluginSignatureSearch  = 'slubwebkartenforum_georeference';
$GLOBALS['TCA']['tt_content']['types']['list']['subtypes_excludelist'][$pluginSignatureSearch] = 'layout,select_key,pages,recursive';
$GLOBALS['TCA']['tt_content']['types']['list']['subtypes_addlist'][$pluginSignatureSearch] = 'pi_flexform';
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPiFlexFormValue($pluginSignatureSearch, 'FILE:EXT:slub_web_kartenforum/Configuration/FlexForms/flexform_georef.xml');

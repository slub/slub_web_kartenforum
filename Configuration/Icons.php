<?php

use TYPO3\CMS\Core\Imaging\IconProvider\SvgIconProvider;

/*
 * Icons used via IconIdentifiers in the backend
 */
$icons = [];
foreach (['Signup', 'Map', 'Apps', 'Georef', 'Admin'] as $icon) {
    $icons['Vkf' . $icon] = [
        'provider' => SvgIconProvider::class,
        'source' => 'EXT:slub_web_kartenforum/Resources/Public/Icons/Backend/' . $icon . '.svg',
    ];
}

return $icons;

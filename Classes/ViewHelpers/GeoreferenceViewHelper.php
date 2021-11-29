<?php

namespace Slub\SlubWebKartenforum\ViewHelpers;

/***************************************************************
 *  Copyright notice
 *
 *  (c) 2021 Thomas Jung <thomas@jung.digital>
 *  All rights reserved
 *
 *  This script is part of the TYPO3 project. The TYPO3 project is
 *  free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  The GNU General Public License can be found at
 *  http://www.gnu.org/copyleft/gpl.html.
 *
 *  This script is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  This copyright notice MUST APPEAR in all copies of the script!
 ***************************************************************/

use TYPO3\CMS\Core\Http\RequestFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\ViewHelper\AbstractViewHelper;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;

class GeoreferenceViewHelper extends AbstractViewHelper
{

    /**
     * Register the Argument (for the view helper in Fluid)
     */
    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('requestedValue', 'string', 'The variable which we ask for', true);
    }

    /**
     * The rendering function which calls the request and returns the value
     *
     * @param array $arguments
     * @param \Closure $renderChildrenClosure
     * @param RenderingContextInterface $renderingContext
     * @return mixed|string
     */
    public static function renderStatic(
        array                     $arguments,
        \Closure                  $renderChildrenClosure,
        RenderingContextInterface $renderingContext
    )
    {
        $response = self::doGET(
            'https://xkcd.com/1657/info.0.json', // For this example we just request the XKCD comic API
            '', // For this example we'll leave this empty
            '' // For this example we'll leave this empty
        );

        $data = json_decode($response->getBody()->getContents(), true);

        if ($arguments['requestedValue']) {
            $content = $data[$arguments['requestedValue']];
        }

        return $content;

    }

    /**
     * Performs http get request
     *
     * @return \Psr\Http\Message\ResponseInterface Response object (ResponseInterface)
     * @var RequestFactory $requestFactory
     * @var string | NULL
     */
    public static function doGET($url, $basicAuthUser, $basicAuthPassword)
    {
        $requestFactory = GeneralUtility::makeInstance(RequestFactory::class);
        $configuration = [
            'timeout' => 10,
            'headers' => ['Accept' => 'application/json']
        ];

        if (!is_null($basicAuthUser) && !is_null($basicAuthPassword)) {
            // Perform GET Request without basic auth
            $configuration['auth'] = [$basicAuthUser, $basicAuthPassword];
        }

        return $requestFactory->request($url, 'GET', $configuration);
    }

}

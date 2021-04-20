<?php
namespace Slub\SlubWebKartenforum\Controller;

/***************************************************************
 *
 *  Copyright notice
 *
 *  (c) 2021 Alexander Bigga <Alexander.Bigga@slub-dresden.de>, SLUB
 *
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
use TYPO3\CMS\Extbase\Domain\Repository\FrontendUserRepository;

/**
 * ElasticsearchController
 */
class ElasticsearchController extends \TYPO3\CMS\Extbase\Mvc\Controller\ActionController
{
	/**
	 * feUserRepository
	 *
	 * @var \TYPO3\CMS\Extbase\Domain\Repository\FrontendUserRepository
	 */
	protected $feUserRepository;

	/**
     * @param \TYPO3\CMS\Extbase\Domain\Repository\FrontendUserRepository $controller
     */
    public function injectfeUserRepository(FrontendUserRepository $feUserRepository)
    {
        $this->feUserRepository = $feUserRepository;
    }


    /**
     * mapprofileAction
     *
     * get the current to 20 ranking from georeference service
	 */
	public function mapprofileAction()
    {
        /** @var RequestFactory $requestFactory */
        $requestFactory = GeneralUtility::makeInstance(RequestFactory::class);
        $configuration = [
            'timeout' => 10,
            'headers' => [
                'Accept' => 'application/json'
            ],
            // necessary to avoid Guzzle exceptions on 404 response
            'exceptions' => false
        ];

        // get mapid from GET parameter objectid
        $mapid = GeneralUtility::_GP('objectid');
        $result = [];

        // no parameter found --> exit
        if ($mapid === null) {
            $result['found'] = false;
            $this->view->assign('map', $result);
            return;
        }

        // get URL from flexform or TypoScript
		$georefBackend = empty($this->settings['flexform']['elasticsearchNode']) ? $this->settings['elasticsearchNode'] : $this->settings['flexform']['elasticsearchNode'];

        $response = $requestFactory->request($georefBackend . '/map/' . $mapid, 'GET', $configuration);
        if ($response->getStatusCode() === 200) {
            $content  = $response->getBody()->getContents();
            $result = json_decode($content, true);
            if ($result) {
                // fix wrong permalinks
                // http://digital.slub-dresden.de/id335924891 --> http://www.deutschefotothek.de/list/freitext/ppn335924891
                // should be fixed in source elasticsearch instead!
                $plink;
                if (strpos($result['_source']['plink'], 'digital.slub-dresden.de/id') > 0) {
                    $plink = 'http://www.deutschefotothek.de/list/freitext/ppn' . substr($result['_source']['plink'], strrpos($result['_source']['plink'], '/id') + 3);
                    $result['_source']['plink'] = $plink;
                }
                if ($plink) {
                    // purl is used in metadata online-resoureced once more
                    foreach ($result['_source']['online-resources'] as $key => $onlineResource) {
                        if (strpos($onlineResource['url'], 'digital.slub-dresden.de/id') > 0) {
                            $result['_source']['online-resources'][$key]['url'] = $plink;
                        }
                    }
                }
                $this->view->assign('map', $result);
            }
        } else {
            $result['found'] = false;
            $result['_id'] = $mapid;
            $this->view->assign('map', $result);
        }
    }


    /**
     * choosepageAction
     *
     * get the content of the unreferenced maps
	 */
	public function choosepageAction()
    {
        /** @var RequestFactory $requestFactory */
        $requestFactory = GeneralUtility::makeInstance(RequestFactory::class);
        $configuration = [
            'timeout' => 20,
            'headers' => [
                'Accept' => 'application/json',
            ],
            // necessary to avoid Guzzle exceptions on 404 response
            'exceptions' => false,
            'debug' => false,
            'json' => [
                'query' => [
                    'filtered' => [
                        'filter' => [
                            'bool' => [
                                'should' => [
                                    [
                                        'term' => [
                                            'georeference' => 'false'
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],
                'sort' => [
                    'title' => ['order' => 'asc']
                ]
            ]
        ];

        // get URL from flexform or TypoScript
		$georefBackend = empty($this->settings['flexform']['elasticsearchNode']) ? $this->settings['elasticsearchNode'] : $this->settings['flexform']['elasticsearchNode'];

        $response = $requestFactory->request($georefBackend . '/_search?size=2000', 'POST', $configuration);
        if ($response->getStatusCode() === 200) {
            $content  = $response->getBody()->getContents();
            $result = json_decode($content, true);
            if ($result) {
                $this->view->assign('maps', $result);
            }
        } else {
            $result['found'] = false;
            $result['_id'] = $mapid;
            $this->view->assign('maps', $result);
        }
    }


    /**
	 * gets current logged in frontend user
	 *
	 * @return \TYPO3\CMS\Extbase\Domain\Model\FrontendUser
	 */
	public function getActualUser() {
		$user = $GLOBALS['TSFE']->fe_user->user;
		$feUserObj = $this->feUserRepository->findByUid($user['uid']);
		return $feUserObj;
	}

}

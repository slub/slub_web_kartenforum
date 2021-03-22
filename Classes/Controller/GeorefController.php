<?php
namespace Slub\SlubWebKartenforum\Controller;

/***************************************************************
 *
 *  Copyright notice
 *
 *  (c) 20212020 Alexander Bigga <Alexander.Bigga@slub-dresden.de>, SLUB
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
 * GeorefController
 */
class GeorefController extends \TYPO3\CMS\Extbase\Mvc\Controller\ActionController
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
     * rankingAction
     *
     * get the current to 20 ranking from georeference service
	 */
	public function rankingAction()
    {
        /** @var RequestFactory $requestFactory */
        $requestFactory = GeneralUtility::makeInstance(RequestFactory::class);
        $configuration = [
            'timeout' => 10,
            'headers' => [
                'Accept' => 'application/json'
            ],
        ];

        // get URL from flexform or TypoScript
		$georefBackend = empty($this->settings['flexform']['georefBackend']) ? $this->settings['georefBackend'] : $this->settings['flexform']['georefBackend'];

        $response = $requestFactory->request($georefBackend . '/user/information', 'GET', $configuration);
        $content  = $response->getBody()->getContents();
        $result = json_decode($content, true);
        if ($result) {
            $this->view->assign('ranking', $result);
        }
    }

   	/**
     * rankingAction
     *
     * get the georeferencing history of user
	 */
	public function historyAction()
    {
        /** @var RequestFactory $requestFactory */
        $requestFactory = GeneralUtility::makeInstance(RequestFactory::class);
        $configuration = [
            'timeout' => 10,
            'headers' => [
                'Accept' => 'application/json'
            ],
        ];

        // get URL from flexform or TypoScript
		$georefBackend = empty($this->settings['flexform']['georefBackend']) ? $this->settings['georefBackend'] : $this->settings['flexform']['georefBackend'];

        $feUserObj = $this->getActualUser();
        if ($feUserObj) {
            $userName = $feUserObj->getUsername();
        } else {
            // not logged in --> redirect to login page
            $uriBuilder = $this->uriBuilder;
            $targetUid = empty($this->settings['flexform']['loginPage']) ? $this->settings['loginPage'] : $this->settings['flexform']['loginPage'];
            $uri = $uriBuilder
              ->setTargetPageUid($targetUid)
              ->build();
            $this->redirectToURI($uri, $delay=0, $statusCode=303);
        }

        $response = $requestFactory->request($georefBackend . '/user/'.$userName.'/history', 'GET', $configuration);
        $content  = $response->getBody()->getContents();
        $result = json_decode($content, true);
        if ($result) {
            $this->view->assign('history', $result);
        }
        $this->view->assign('username',  $userName);
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

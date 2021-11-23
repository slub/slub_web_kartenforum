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
     * @param \TYPO3\CMS\Extbase\Domain\Repository\FrontendUserRepository $feUserRepository
     */
    public function injectfeUserRepository(FrontendUserRepository $feUserRepository)
    {
        $this->feUserRepository = $feUserRepository;
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

    /**
     * rankingAction
     *
     * get the current to 20 ranking from georeference service
	 */
	public function rankingAction()
    {
        $this->view->assign('ranking', 'test');
        return;
        //$this->view->assign('ranking', "test");
//         $this->view->assign('value', $this->settings['flexform.test']);
        /** @var RequestFactory $requestFactory */
//         $requestFactory = GeneralUtility::makeInstance(RequestFactory::class);
//         $configuration = [
//             'timeout' => 10,
//             'headers' => [
//                 'Accept' => 'application/json'
//             ],
//         ];

//         $this->view->assign('value', 'test');
        // get URL from flexform or TypoScript
// 		$georefBackend = empty($this->settings['flexform']['georefBackend']) ? $this->settings['georefBackend'] : $this->settings['flexform']['georefBackend'];
//
//         $response = $requestFactory->request($georefBackend . '/user/information', 'GET', $configuration);
//         $content  = $response->getBody()->getContents();
//         $result = json_decode($content, true);
//         if ($result) {
//             //$this->view->assign('ranking', $result);
//         }
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
     * This method is necessary for proper generation of json responses
     */
    public function initializeAction()
    {
        $this->defaultViewObjectName = \TYPO3\CMS\Extbase\Mvc\View\JsonView::class;
    }

    /**
     * Performs http get request
     * @var string
     * @var string | NULL
     * @var string | NULL
     * @return HTTP Response object (ResponseInterface)
     */
    public function doGET($url, $basicAuthUser, $basicAuthPassword) {
        /** @var RequestFactory $requestFactory */
        $requestFactory = GeneralUtility::makeInstance(RequestFactory::class);
        $configuration = [
            'timeout' => 10,
            'headers' => ['Accept' => 'application/json']
        ];

        if (!is_null($basicAuthUser)  && !is_null($basicAuthPassword)) {
            // Perform GET Request without basic auth
            $configuration['auth'] = [$basicAuthUser, $basicAuthPassword];
        }

        return $requestFactory->request($url, 'GET', $configuration);
    }

    /**
     * Performs http get request
     * @var string
     * @var any
     * @var string | NULL
     * @var string | NULL
     * @return HTTP Response object (ResponseInterface)
     */
    public function doPOST($url, $params, $basicAuthUser, $basicAuthPassword, $userId) {
        /** @var RequestFactory $requestFactory */
        $requestFactory = GeneralUtility::makeInstance(RequestFactory::class);
        $configuration = [
            'timeout' => 20,
            'headers' => ['Accept' => 'application/json'],
            'debug' => false,
            'json' => json_decode($params, true)
        ];

        if (!is_null($userId)) {
            // Attach a user_id to the request object
            $jsonRequest = json_decode($params, true);
            $jsonRequest['user_id'] = $userId;
            $configuration['json'] = $jsonRequest;
        }

        if (!is_null($basicAuthUser)  && !is_null($basicAuthPassword)) {
            // Perform GET Request without basic auth
            $configuration['auth'] = [$basicAuthUser, $basicAuthPassword];
        }

        return $requestFactory->request($url, 'POST', $configuration);
    }

    /**
     * Action for querying transformation processes for a given mapId
     */
    public function getTransformationByMapIdAction()
    {
        // get mapid from GET parameter objectid
        $mapId = GeneralUtility::_GP('map_id');

        // Extract settings for querying the georeference service
        $serviceUrl = empty($this->settings['api_georeference']) ? NULL : $this->settings['api_georeference'];
        $basicAuthUser = empty($this->settings['api_georeference_user']) ? NULL : $this->settings['api_georeference_user'];
        $basicAuthPassword = empty($this->settings['api_georeference_password']) ? NULL : $this->settings['api_georeference_password'];

        if (is_null($serviceUrl)) {
            throw new \UnexpectedValueException('Missing url for georeference service. Please contact an admin.');
        }

        // Build url and request service
        $response = $this->doGET(
            $serviceUrl . '/transformations/maps/' . $mapId,
            $basicAuthUser,
            $basicAuthPassword
        );

        if ($response) {
            $content  = $response->getBody()->getContents();
            $this->view->assign('value', json_decode($content, true));
        }
    }

    /**
     * Action for posting a new transformation processes for a given mapId
     */
    public function postTransformationByMapIdAction()
    {
        // get mapid from GET parameter objectid
        $mapId = GeneralUtility::_GP('map_id');
        $requestParams = GeneralUtility::_GP('req');

        // Extract settings for querying the georeference service
        $serviceUrl = empty($this->settings['api_georeference']) ? NULL : $this->settings['api_georeference'];
        $basicAuthUser = empty($this->settings['api_georeference_user']) ? NULL : $this->settings['api_georeference_user'];
        $basicAuthPassword = empty($this->settings['api_georeference_password']) ? NULL : $this->settings['api_georeference_password'];
        $feUserObj = $this->getActualUser();

        if (is_null($serviceUrl)) {
            throw new \UnexpectedValueException('Missing url for georeference service. Please contact an admin.');
        }

        // Build url and request service
        $response = $this->doPOST(
            $serviceUrl . '/transformations/maps/' . $mapId,
            $requestParams,
            $basicAuthUser,
            $basicAuthPassword,
            $feUserObj->getUsername()
        );

        if ($response) {
            $content  = $response->getBody()->getContents();
            $this->view->assign('value', json_decode($content, true));
        }
    }

		if (!is_null($validationRequest)) {

    /**
     * Action for querying rectified image for a given mapId and params
     */
    public function postTransformationTryAction() {
        $requestParams = GeneralUtility::_GP('req');

        // Extract settings for querying the georeference service
        $serviceUrl = empty($this->settings['api_georeference']) ? NULL : $this->settings['api_georeference'];
        $basicAuthUser = empty($this->settings['api_georeference_user']) ? NULL : $this->settings['api_georeference_user'];
        $basicAuthPassword = empty($this->settings['api_georeference_password']) ? NULL : $this->settings['api_georeference_password'];

        if (is_null($serviceUrl)) {
            throw new \UnexpectedValueException('Missing url for georeference service. Please contact an admin.');
        }
    }

        // Build url and request service
        $response = $this->doPOST(
            $serviceUrl . '/transformations/try',
            $requestParams,
            $basicAuthUser,
            $basicAuthPassword,
            NULL
        );

        if ($response) {
            $content  = $response->getBody()->getContents();
            $this->view->assign('value', json_decode($content, true));
        }
     }
}

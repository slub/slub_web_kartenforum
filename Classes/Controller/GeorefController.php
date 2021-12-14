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
     * Returns the global settings from the extension
     */
    private function getSettings() {
        return $settings = $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['slub_web_kartenforum'];
    }

    /**
     * This method is necessary for proper generation of json responses
     */
    public function initializeAction()
    {
        $this->defaultViewObjectName = \TYPO3\CMS\Extbase\Mvc\View\JsonView::class;
    }

    /**
     * Performs http get request to the georeference service
     * @var string
     * @return HTTP Response object (ResponseInterface)
     */
    public function doGET($path) {
        // Extract settings for querying the georeference service
        $settings = $this->getSettings();
        $serviceUrl = empty($settings['georefApi']) ? NULL : $settings['georefApi'];
        $basicAuthUser = empty($settings['georefAuthUser']) ? NULL : $settings['georefAuthUser'];
        $basicAuthPassword = empty($settings['georefAuthPassword']) ? NULL : $settings['georefAuthPassword'];

        if (is_null($serviceUrl)) {
            throw new \UnexpectedValueException('Missing url for georeference service. Please contact an admin.');
        }

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

        return $requestFactory->request($serviceUrl . $path, 'GET', $configuration);
    }

    /**
     * Performs http get request
     * @var string
     * @var any
     * @return HTTP Response object (ResponseInterface)
     */
    public function doPOST($path, $json_request) {
        // Extract settings for querying the georeference service
        $settings = $this->getSettings();
        $serviceUrl = empty($settings['georefApi']) ? NULL : $settings['georefApi'];
        $basicAuthUser = empty($settings['georefAuthUser']) ? NULL : $settings['georefAuthUser'];
        $basicAuthPassword = empty($settings['georefAuthPassword']) ? NULL : $settings['georefAuthPassword'];

        /** @var RequestFactory $requestFactory */
        $requestFactory = GeneralUtility::makeInstance(RequestFactory::class);
        $configuration = [
            'timeout' => 20,
            'headers' => ['Accept' => 'application/json'],
            'debug' => false,
            'json' => $json_request
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

        return $requestFactory->request($serviceUrl . $path, 'POST', $configuration);
    }

    /**
     * Action for querying statistics
     */
    public function getStatisticsAction()
    {
        // Build url and request service
        $response = $this->doGET('/statistics');

        if ($response) {
            $content  = $response->getBody()->getContents();
            $this->view->assign('value', json_decode($content, true));
        }
    }

    /**
     * Action for querying transformation processes for a given mapId includes also invalids
     */
    public function getTransformationForMapIdAction()
    {
        // get mapid from GET parameter
        $mapId = GeneralUtility::_GP('map_id');

        // Build url and request service
        $response = $this->doGET('/transformations/maps/' . $mapId . '?return_all=True');

        if ($response) {
            $content  = $response->getBody()->getContents();
            $this->view->assign('value', json_decode($content, true));
        }
    }

    /**
     * Action for querying transformation processes for a given userId
     */
    public function getTransformationForUserIdAction()
    {
        // get mapid from GET parameter
        $userId = GeneralUtility::_GP('user_id');

        // Build url and request service
        $response = $this->doGET('/transformations/users/' . $userId);

        if ($response) {
            $content  = $response->getBody()->getContents();
            $this->view->assign('value', json_decode($content, true));
        }
    }


    /**
     * Action for querying transformations by a validation input
     */
    public function getTransformationForValidationAction()
    {
        // get validation value from GET parameter
        $validation = GeneralUtility::_GP('value');

        // Build url and request service
        $response = $this->doGET('/transformations/validations/' . $validation);

        if ($response) {
            $content  = $response->getBody()->getContents();
            $this->view->assign('value', json_decode($content, true));
        }
    }

    /**
     * Action for querying the user history
     */
    public function getUserHistoryAction()
    {
        // get mapid from GET parameter objectid
        $mapId = GeneralUtility::_GP('map_id');

        // Extract settings for querying the georeference service
        $serviceUrl = empty($this->settings['api_georeference']) ? NULL : $this->settings['api_georeference'];
        $basicAuthUser = empty($this->settings['api_georeference_user']) ? NULL : $this->settings['api_georeference_user'];
        $basicAuthPassword = empty($this->settings['api_georeference_password']) ? NULL : $this->settings['api_georeference_password'];
        $feUserObj = $this->getActualUser();

        if (is_null($feUserObj->getUsername())) {
            throw new \UnexpectedValueException('Could not determine username.');
        }

        // Build url and response
        $response = $this->doGET('/user/' . $feUserObj->getUsername() . '/history');

        if ($response) {
            $content  = $response->getBody()->getContents();
            $this->view->assign('value', json_decode($content, true));
        }
    }

    /**
     * Action for posting new jobs to the georeference service
     */
    public function postJobAction()
    {
        // get mapid from GET parameter map_id and request params
        $requestParams = GeneralUtility::_GP('req');
        $feUserObj = $this->getActualUser();

        // Build json request
        if (!is_null($feUserObj->getUsername())) {
            // Attach a user_id to the request object
            $jsonRequest = json_decode($requestParams, true);
            $jsonRequest['user_id'] = $feUserObj->getUsername();

            // Build url and request service
            $response = $this->doPOST(
                '/jobs',
                $jsonRequest
            );

            if ($response) {
                $content  = $response->getBody()->getContents();
                $this->view->assign('value', json_decode($content, true));
            }
        } else {
            throw new \UnexpectedValueException('Could not determine username.');
        }
    }

    /**
     * Action for posting a new transformation processes for a given mapId
     */
    public function postTransformationByMapIdAction()
    {
        // get mapid from GET parameter map_id and request params
        $mapId = GeneralUtility::_GP('map_id');
        $requestParams = GeneralUtility::_GP('req');
        $feUserObj = $this->getActualUser();

        // Build json request
        if (!is_null($feUserObj->getUsername())) {
            // Attach a user_id to the request object
            $jsonRequest = json_decode($requestParams, true);
            $jsonRequest['user_id'] = $feUserObj->getUsername();

            // Build url and request service
            $response = $this->doPOST(
                '/transformations/maps/' . $mapId,
                $jsonRequest
            );

            if ($response) {
                $content  = $response->getBody()->getContents();
                $this->view->assign('value', json_decode($content, true));
            }
        } else {
            throw new \UnexpectedValueException('Could not determine username.');
        }
    }

    /**
     * Action for querying rectified image for a given mapId and params
     */
    public function postTransformationTryAction() {
        $requestParams = GeneralUtility::_GP('req');

        // Build url and request service
        $response = $this->doPOST(
            '/transformations/try',
            json_decode($requestParams, true)
        );

        if ($response) {
            $content  = $response->getBody()->getContents();
            $this->view->assign('value', json_decode($content, true));
        }
     }
}

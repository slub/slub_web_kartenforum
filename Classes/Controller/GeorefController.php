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
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use TYPO3\CMS\Extbase\Mvc\View\JsonView;

/**
 * GeorefController
 */
class GeorefController extends ActionController
{

    /**
     * feUserRepository
     *
     * @var FrontendUserRepository
     */
    protected $feUserRepository;

    /**
     * @param FrontendUserRepository $feUserRepository
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
    public function getActualUser()
    {
        $user = $GLOBALS['TSFE']->fe_user->user;
        $feUserObj = $this->feUserRepository->findByUid($user['uid']);
        return $feUserObj;
    }

    /**
     * Returns the global settings from the extension
     */
    private function getSettings()
    {
        return $settings = $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['slub_web_kartenforum'];
    }

    /**
     * Create JSON response
     * @var string
     */
    protected $defaultViewObjectName = JsonView::class;

    /**
     * Performs generic http request to the georeference service
     * @return \Psr\Http\Message\ResponseInterface Response object (ResponseInterface)
     * @var string
     */
    public function doREQUEST($path, $requestOperation)
    {
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

        if (!is_null($basicAuthUser) && !is_null($basicAuthPassword)) {
            // Perform GET Request without basic auth
            $configuration['auth'] = [$basicAuthUser, $basicAuthPassword];
        }

        return $requestFactory->request($serviceUrl . $path, $requestOperation, $configuration);
    }

    /**
     * Performs http get request to the georeference service
     * @return \Psr\Http\Message\ResponseInterface Response object (ResponseInterface)
     * @var string
     */
    public function doGET($path)
    {
       return $this->doREQUEST($path, 'GET');
    }

        /**
     * Performs http delete request to the georeference service
     * @return \Psr\Http\Message\ResponseInterface Response object (ResponseInterface)
     * @var string
     */
    public function doDELETE($path)
    {
       return $this->doREQUEST($path, 'DELETE');
    }

    /**
     * Performs http post request
     * @return \Psr\Http\Message\ResponseInterface Response object (ResponseInterface)
     * @var any
     * @var string
     */
    public function doPOST($path, $json_request)
    {
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

        if (!is_null($basicAuthUser) && !is_null($basicAuthPassword)) {
            // Perform GET Request without basic auth
            $configuration['auth'] = [$basicAuthUser, $basicAuthPassword];
        }

        try {
            $response = $requestFactory->request($serviceUrl . $path, 'POST', $configuration);
            if ($response->getStatusCode() < 300) {
                return $response->getBody()->getContents();
            }
        } catch (\Exception $e) {
            //debug($e);
            return json_encode([
                "error_code" => $e->getCode(),
                "error_message" => $e->getMessage()
            ]);
        }

        return json_encode([
            "error_code" => 500,
            "error_message" => "Something went wrong while trying to process a post request."
        ]);
    }

    /**
     * Action for querying statistics
     */
    public function getStatisticsAction()
    {
        // Build url and request service
        $response = $this->doGET('/statistics');

        if ($response) {
            $content = $response->getBody()->getContents();
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
        $additionalProperties = GeneralUtility::_GP('additional_properties');

        // Build url and request service
        $response = $this->doGET("/transformations?map_id={$mapId}&additional_properties={$additionalProperties}");

        if ($response) {
            $content = $response->getBody()->getContents();
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
        $response = $this->doGET("/transformations?user_id={$userId}");

        if ($response) {
            $content = $response->getBody()->getContents();
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
        $response = $this->doGET("/transformations?validation={$validation}");

        if ($response) {
            $content = $response->getBody()->getContents();
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
            $content = $response->getBody()->getContents();
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
        if (!is_null($feUserObj) && !is_null($feUserObj->getUsername())) {
            // Attach a user_id to the request object
            $jsonRequest = json_decode($requestParams, true);
            $jsonRequest['user_id'] = $feUserObj->getUsername();

            // Build url and request service
            $response = $this->doPOST(
                '/jobs',
                $jsonRequest
            );

            if ($response) {
                $this->view->assign('value', json_decode($response, true));
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
        $dryRun = GeneralUtility::_GP('dry_run');
        $requestParams = GeneralUtility::_GP('req');
        $feUserObj = $this->getActualUser();

        // Build json request
        if (!is_null($feUserObj) && !is_null($feUserObj->getUsername())) {
            // Attach a user_id to the request object
            $jsonRequest = json_decode($requestParams, true);
            $jsonRequest['user_id'] = $feUserObj->getUsername();

            // Build url and request service
            $response = $this->doPOST("/transformations?dry_run={$dryRun}", $jsonRequest);

            if ($response) {
                $this->view->assign('value', json_decode($response, true));
            }
        } else {
            throw new \UnexpectedValueException('Could not determine username.');
        }
    }

    /**
     * Action to post a new map_view
     */
    public function postMapViewAction()
    {
        $requestParams = GeneralUtility::_GP('req');
        // get mapid from GET parameter map_id and request params
        $feUserObj = $this->getActualUser();

        // Build json request
        if (!is_null($feUserObj) && !is_null($feUserObj->getUsername())) {
            // Attach a user_id to the request object
            $jsonRequest = json_decode(file_get_contents('php://input'), true);
            $jsonRequest['user_id'] = $feUserObj->getUsername();

            // Build url and request service
            $response = $this->doPOST(
                '/map_view/',
                $jsonRequest
            );

            if ($response) {
                $this->view->assign('value', json_decode($response, true));
            }
        } else {
            throw new \UnexpectedValueException('Could not determine username.');
        }
    }

    /**
     * Action to get a new map_view
     */
    public function getMapViewAction()
    {
        $mapViewId = GeneralUtility::_GP('map_view_id');

        // Build url and request service
        $response = $this->doGET('/map_view/' . $mapViewId);

        if ($response) {
            $content = $response->getBody()->getContents();
            $this->view->assign('value', json_decode($content, true));
        }
    }


    /**
     * Mosaic Map Section
     */

    public function getMosaicMapsAction()
    {
        $response = $this->doGET('/mosaic_maps');

        if ($response) {
            $content = $response->getBody()->getContents();
            $this->view->assign('value', json_decode($content, true));
        }
    }


    public function postMosaicMapsAction()
    {
        // get mapid from GET parameter map_id and request params
        $feUserObj = $this->getActualUser();

        // Build json request
        if (!is_null($feUserObj) && !is_null($feUserObj->getUsername())) {
            // Attach a user_id to the request object
            $jsonRequest = json_decode(file_get_contents('php://input'), true);
            $jsonRequest['user_id'] = $feUserObj->getUsername();

            // Build url and request service
            $response = $this->doPOST(
                '/mosaic_maps',
                $jsonRequest
            );

            if ($response) {
                $this->view->assign('value', json_decode($response, true));
            }
        } else {
            throw new \UnexpectedValueException('Could not determine username.');
        }
    }

        /**
     * Action to get a new map_view
     */
    public function getMosaicMapAction()
    {
        $mosaicMapId = GeneralUtility::_GP('mosaic_map_id');

        // Build url and request service
        $response = $this->doGET('/mosaic_maps/' . $mosaicMapId);

        if ($response) {
            $content = $response->getBody()->getContents();
            $this->view->assign('value', json_decode($content, true));
        }
    }

    public function deleteMosaicMapAction() {
        $mosaicMapId = GeneralUtility::_GP('mosaic_map_id');

        // Build url and request service
        $response = $this->doDELETE('/mosaic_maps/' . $mosaicMapId);

        if ($response) {
            $content = $response->getBody()->getContents();
            $this->view->assign('value', json_decode($content, true));
        }
    }

    public function postMosaicMapAction()
    {
        $mosaicMapId = GeneralUtility::_GP('mosaic_map_id');

        // get mapid from GET parameter map_id and request params
        $feUserObj = $this->getActualUser();

        // Build json request
        if (!is_null($feUserObj) && !is_null($feUserObj->getUsername())) {
            // Attach a user_id to the request object
            $jsonRequest = json_decode(file_get_contents('php://input'), true);
            $jsonRequest['user_id'] = $feUserObj->getUsername();

            // Build url and request service
            $response = $this->doPOST(
                '/mosaic_maps/' . $mosaicMapId,
                $jsonRequest
            );

            if ($response) {
                $this->view->assign('value', json_decode($response, true));
            }
        } else {
            throw new \UnexpectedValueException('Could not determine username.');
        }
    }

    public function refreshMosaicMapAction()
    {
        $mosaicMapId = GeneralUtility::_GP('mosaic_map_id');

        // get mapid from GET parameter map_id and request params
        $feUserObj = $this->getActualUser();

        // Build json request
        if (!is_null($feUserObj) && !is_null($feUserObj->getUsername())) {
            // Attach a user_id to the request object
            $jsonRequest = json_decode('{}', true);
            $jsonRequest['user_id'] = $feUserObj->getUsername();

            // Build url and request service
            $response = $this->doPOST(
                '/mosaic_maps/' . $mosaicMapId . '/refresh',
                $jsonRequest
            );

            if ($response) {
                $this->view->assign('value', json_decode($response, true));
            }
        } else {
            throw new \UnexpectedValueException('Could not determine username.');
        }
    }


    /**
     * Validate user session
     *
     * @param string $sessionId
     * @return void
     */
    public function getSessionAction()
    {

        $feUserObj = $this->getActualUser();
        $response = [
            'valid' => false,
            'userData' => null,
        ];

        if(!is_null($feUserObj) && !is_null($feUserObj->getUsername())) {
            $response['valid'] = true;
            $userData = [
                'username' => $feUserObj->getUsername(),
                'uid' => $feUserObj->getUid(),
                'groups' => array_map(function($group){
                    return $group->getTitle();
                },$feUserObj->getUsergroup()->getArray())
            ];
            $response['userData'] = $userData;
            // Session is valid
            $this->view->assign('value', $response);
        } else {
            // Session is invalid
            $this->view->assign('value', $response);
        }
    }
}

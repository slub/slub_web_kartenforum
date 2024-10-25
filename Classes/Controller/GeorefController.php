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
     * Create JSON response
     * @var string
     */
    protected $defaultViewObjectName = JsonView::class;


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

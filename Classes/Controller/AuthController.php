<?php

namespace Slub\SlubWebKartenforum\Controller;

use Slub\SlubWebKartenforum\Domain\Model\User;
use TYPO3\CMS\Core\Crypto\PasswordHashing\InvalidPasswordHashException;
use TYPO3\CMS\Core\Crypto\PasswordHashing\PasswordHashFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Domain\Repository\FrontendUserRepository;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use TYPO3\CMS\Extbase\Mvc\Exception\StopActionException;
use TYPO3\CMS\Extbase\Mvc\Exception\UnsupportedRequestTypeException;
use TYPO3\CMS\Extbase\Persistence\Exception\IllegalObjectTypeException;


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


/**
 * AuthController
 */
class AuthController extends ActionController
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
     * userGroupRepository
     *
     * @var \TYPO3\CMS\Extbase\Domain\Repository\FrontendUserGroupRepository
     * @inject
     */
    protected $userGroupRepository;

    /**
     * persistenceManager
     *
     * @var \TYPO3\CMS\Extbase\Persistence\Generic\PersistenceManager
     * @inject
     */
    protected $persistenceManager;

    /**
     * Handle signup form
     * @param User|NULL $user
     * @return void
     */
    public function signupAction(User $user = NULL)
    {
        $arguments = $this->request->getArguments();
        $this->view->assign('errors', $arguments['errors']);
        $this->view->assign('user', $user);
    }

    /**
     * Add new users to database
     * @param User $user
     * @return void
     * @throws InvalidPasswordHashException
     * @throws StopActionException
     * @throws UnsupportedRequestTypeException
     * @throws IllegalObjectTypeException
     */
    public function addUserAction(User $user)
    {
        // attach user group to user
        $usergroup = $this->userGroupRepository->findByTitle('vk2-user')[0];
        $user->addUsergroup($usergroup);

        // handle password
        $saltFactory = GeneralUtility::makeInstance(PasswordHashFactory::class);
        $defaultHashInstance = $saltFactory->getDefaultHashInstance(TYPO3_MODE);
        $user->setPassword($defaultHashInstance->getHashedPassword($user->getPassword()));

        // add user to repository and persist
        $user->setName($user->getFirstName() . ' ' . $user->getLastName());
        $this->feUserRepository->add($user);
        $this->persistenceManager->persistAll();

        // forward user to login page
        $uriBuilder = $this->uriBuilder;
        $targetUid = empty($this->settings['flexform']['loginPage']) ? $this->settings['loginPage'] : $this->settings['flexform']['loginPage'];
        $uri = $uriBuilder->setTargetPageUid($targetUid)->build();
        $this->redirectToURI($uri, $delay = 0, $statusCode = 303);
    }
}

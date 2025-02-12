<?php

/*
 * Copyright notice
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
 */

namespace Slub\SlubWebKartenforum\Controller;

use Psr\Http\Message\ResponseInterface;
use Slub\SlubWebKartenforum\Domain\Model\FrontendUser;
use Slub\SlubWebKartenforum\Domain\Repository\FrontendUserGroupRepository;
use Slub\SlubWebKartenforum\Domain\Repository\FrontendUserRepository;
use TYPO3\CMS\Core\Crypto\PasswordHashing\InvalidPasswordHashException;
use TYPO3\CMS\Core\Crypto\PasswordHashing\PasswordHashFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use TYPO3\CMS\Extbase\Mvc\Exception\StopActionException;
use TYPO3\CMS\Extbase\Mvc\Exception\UnsupportedRequestTypeException;
use TYPO3\CMS\Extbase\Persistence\Exception\IllegalObjectTypeException;
use TYPO3\CMS\Extbase\Persistence\Generic\PersistenceManager;

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
     * userGroupRepository
     *
     * @var FrontendUserGroupRepository
     */
    protected $feUserGroupRepository;

    /**
     * persistenceManager
     *
     * @var PersistenceManager
     */
    protected $persistenceManager;

    public function __construct(FrontendUserRepository $feUserRepository, FrontendUserGroupRepository $feUserGroupRepository, PersistenceManager $persistenceManager)
    {
        $this->feUserRepository = $feUserRepository;
        $this->feUserGroupRepository = $feUserGroupRepository;
        $this->persistenceManager = $persistenceManager;
    }

    /**
     * Handle signup form
     * @param FrontendUser|NULL $user
     * @return ResponseInterface
     */
    public function signupAction(FrontendUser $user = NULL)
    {
        $arguments = $this->request->getArguments();
        if (key_exists(
            'errors',
            $arguments,
        )) {
            $this->view->assign('errors', $arguments['errors']);
        }

        $this->view->assign('user', $user);

        return $this->htmlResponse();
    }

    /**
     * Add new users to database
     * @param FrontendUser $user
     * @return ResponseInterface
     * @throws InvalidPasswordHashException
     * @throws StopActionException
     * @throws UnsupportedRequestTypeException
     * @throws IllegalObjectTypeException
     */
    public function addUserAction(FrontendUser $user)
    {
        // attach user group to user
        $usergroup = $this->feUserGroupRepository->findByTitle('vk2-user')[0];
        $user->addUsergroup($usergroup);

        // handle password
        $saltFactory = GeneralUtility::makeInstance(PasswordHashFactory::class);
        $defaultHashInstance = $saltFactory->getDefaultHashInstance('FE');
        $user->setPassword($defaultHashInstance->getHashedPassword($user->getPassword()));

        // add user to repository and persist
        $user->setName($user->getFirstName() . ' ' . $user->getLastName());
        $this->feUserRepository->add($user);
        $this->persistenceManager->persistAll();

        $uriBuilder = $this->uriBuilder;
        $redirectTargetUid = empty($this->settings['flexform']['loginPage']) ? $this->settings['loginPage'] : $this->settings['flexform']['loginPage'];

        $userId = $user->getUid();
        if (!empty($userId)) {
            $tsfe = $this->request->getAttribute('frontend.controller');
            $tsfe->fe_user->createUserSession(['uid' => $userId]);
            $tsfe->fe_user->enforceNewSessionId();

            $rootPageId = $tsfe->rootLine[0]['uid'];
            $redirectTargetUid = $rootPageId;
        }

        $uri = $uriBuilder->setTargetPageUid($redirectTargetUid)->build();
        return $this
            ->responseFactory
            ->createResponse(303)
            ->withHeader('Location', $uri);
    }
}

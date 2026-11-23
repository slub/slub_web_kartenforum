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
use Slub\SlubWebKartenforum\Domain\Model\FrontendUserGroup;
use Slub\SlubWebKartenforum\Domain\Repository\FrontendUserGroupRepository;
use Slub\SlubWebKartenforum\Domain\Repository\FrontendUserRepository;
use TYPO3\CMS\Core\Crypto\PasswordHashing\InvalidPasswordHashException;
use TYPO3\CMS\Core\Crypto\PasswordHashing\PasswordHashFactory;
use TYPO3\CMS\Core\Site\Entity\Site;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use TYPO3\CMS\Extbase\Persistence\Exception\IllegalObjectTypeException;
use TYPO3\CMS\Extbase\Persistence\Generic\PersistenceManager;
use TYPO3\CMS\Frontend\Authentication\FrontendUserAuthentication;

/**
 * AuthController
 */
class AuthController extends ActionController
{
    public function __construct(
        protected readonly FrontendUserRepository $feUserRepository,
        protected readonly FrontendUserGroupRepository $feUserGroupRepository,
        protected readonly PersistenceManager $persistenceManager,
        protected readonly PasswordHashFactory $passwordHashFactory,
    ) {}

    /**
     * Handle signup form
     */
    public function signupAction(?FrontendUser $user = null): ResponseInterface
    {
        $arguments = $this->request->getArguments();
        if (array_key_exists('errors', $arguments)) {
            $this->view->assign('errors', $arguments['errors']);
        }

        $this->view->assign('user', $user);

        return $this->htmlResponse();
    }

    /**
     * Add new users to database
     *
     * @throws InvalidPasswordHashException
     * @throws IllegalObjectTypeException
     */
    public function addUserAction(FrontendUser $user): ResponseInterface
    {
        // attach user group to user
        $usergroup = $this->feUserGroupRepository->findOneBy(['title' => 'vk2-user']);
        if ($usergroup instanceof FrontendUserGroup) {
            $user->addUsergroup($usergroup);
        }

        // handle password
        $defaultHashInstance = $this->passwordHashFactory->getDefaultHashInstance('FE');
        $user->setPassword($defaultHashInstance->getHashedPassword($user->getPassword()));

        // add user to repository and persist
        $user->setName($user->getFirstName() . ' ' . $user->getLastName());
        $this->feUserRepository->add($user);
        $this->persistenceManager->persistAll();

        $redirectTargetUid = empty($this->settings['flexform']['loginPage']) ? $this->settings['loginPage'] : $this->settings['flexform']['loginPage'];

        $userId = $user->getUid();
        if (!empty($userId)) {
            $frontendUser = $this->request->getAttribute('frontend.user');
            if ($frontendUser instanceof FrontendUserAuthentication) {
                $frontendUser->createUserSession(['uid' => $userId]);
                // Make the new user known to the current request as well, otherwise
                // storeSessionData() treats the request as anonymous and removes the cookie
                $frontendUser->user = $frontendUser->getRawUserByUid($userId);
                $frontendUser->enforceNewSessionId();
            }

            $site = $this->request->getAttribute('site');
            if ($site instanceof Site) {
                $redirectTargetUid = $site->getRootPageId();
            }
        }

        $uri = $this->uriBuilder->setTargetPageUid((int)$redirectTargetUid)->build();
        return $this
            ->responseFactory
            ->createResponse(303)
            ->withHeader('Location', $uri);
    }
}

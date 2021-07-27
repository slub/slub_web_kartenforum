<?php
namespace Slub\SlubWebKartenforum\Controller;

use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use TYPO3\CMS\Extbase\Domain\Repository\FrontendUserRepository;
use TYPO3\CMS\Core\Crypto\PasswordHashing\PasswordHashFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;


/***************************************************************
 *
*  Copyright notice
*
*  (c) 2015 Jacob Mendt <Jacob.Mendt@slub-dresden.de>, SLUB
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

use TYPO3\CMS\Extbase\Annotation as Extbase;

/**
 * AuthController
 */
class AuthController extends \TYPO3\CMS\Extbase\Mvc\Controller\ActionController
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
	 * @var \TYPO3\CMS\Core\Database\DatabaseConnection
	 */
	protected $databaseConnection = NULL;

	/**
	 * controllerContext
	 *
	 * @var \TYPO3\CMS\Extbase\Mvc\Controller\ControllerContext
	 */
	public $controllerContext;

	/**
	 * TypoScript
	 *
	 * @var array
	 */
	public $config;

	/**
	 * Complete Configuration
	 *
	 * @var array
	 */
	public $vk2Config;

	/**
	 * (non-PHPdoc)
	 * @see \TYPO3\CMS\Extbase\Mvc\Controller\ActionController::initializeAction()
	 */
	public function initializeAction()
    {
		$this->databaseConnection = $GLOBALS['TYPO3_DB'];
		$this->controllerContext = $this->buildControllerContext();
		$this->vk2Config = $this->configurationManager->getConfiguration(
				ConfigurationManagerInterface::CONFIGURATION_TYPE_FRAMEWORK
		);
		$this->config = $this->configurationManager->getConfiguration(
				ConfigurationManagerInterface::CONFIGURATION_TYPE_FULL_TYPOSCRIPT
		);

		// called for debugging
		//DebuggerUtility::var_dump($this->vk2Config);
		//DebuggerUtility::var_dump($this->vk2Config['persistence']['storagePid']);
		//DebuggerUtility::var_dump($this->vk2config['settings']['passwordSave']);
		//DebuggerUtility::var_dump($GLOBALS['TSFE']->loginUser);
		//\TYPO3\CMS\Extbase\Utility\DebuggerUtility();
	}

	/**
	 * Does only returns the login page. User login is done via core extension
	 * fe_login
	 *
	 * @param \Slub\SlubWebKartenforum\Domain\Model\User $user
	 * @Extbase\IgnoreValidation("user")
	 */
	public function loginAction(\Slub\SlubWebKartenforum\Domain\Model\User $user = NULL)
    {
		$arguments = $this->request->getArguments();

		$this->view->assign('errors', $arguments['errors']);
		$this->view->assign('user', $user);
	}

	/**
	 * Returns an error page
	 */
	public function loginErrorAction()
    {
		$arguments = $this->request->getArguments();

		$this->view->assign('msg', $arguments['msg']);
	}

	public function logoutAction()
    {
		if ($GLOBALS['TSFE']->loginUser) {
			$GLOBALS['TSFE']->fe_user->logoff();
			$this->redirect('show', 'Main', NULL);
		}
	}

	/**
	 * For debugging is called before signUpAction
	 */
	public function initializeSignupAction()
    {
//		debug($this->request->getArguments());
	}

	/**
	 * sign up a user
	 * @param \Slub\SlubWebKartenforum\Domain\Model\User $user
	 */
	public function signupAction(\Slub\SlubWebKartenforum\Domain\Model\User $user)
    {
		// attached usergroup to user
		$usergroup = $this->userGroupRepository->findByTitle('vk2-user')[0];
		$user->addUsergroup($usergroup);

        $saltFactory = GeneralUtility::makeInstance(PasswordHashFactory::class);
		$defaultHashInstance = $saltFactory->getDefaultHashInstance(TYPO3_MODE);

		// hash password
		$user->setPassword($defaultHashInstance->getHashedPassword($user->getPassword()));

		// add user to repository and persist
		$user->setName($user->getFirstName() . ' ' . $user->getLastName());
		$this->feUserRepository->add($user);
		$this->persistenceManager->persistAll();

		$uriBuilder = $this->uriBuilder;
		$targetUid = empty($this->settings['flexform']['loginPage']) ? $this->settings['loginPage'] : $this->settings['flexform']['loginPage'];
		$uri = $uriBuilder
		  ->setTargetPageUid($targetUid)
		  ->build();
		$this->redirectToURI($uri, $delay=0, $statusCode=303);
	}
}

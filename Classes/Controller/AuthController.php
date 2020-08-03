<?php
namespace Slub\SlubWebKartenforum\Controller;

use \TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use Slub\SlubWebKartenforum\Utils\Tools;


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

/**
 * AuthController
 */
class AuthController extends \TYPO3\CMS\Extbase\Mvc\Controller\ActionController {

	/**
	 * FrontendUserRepository
	 *
	 * @var \TYPO3\CMS\Extbase\Domain\Repository\FrontendUserRepository
	 * @inject
	 */
	protected $FrontendUserRepository;

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
	public function initializeAction() {
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
	 */
	public function loginAction(
			\Slub\SlubWebKartenforum\Domain\Model\User $user = NULL){
		$this->view->assign('user', $user);
	}

	/**
	 * Returns an error page
	 */
	public function loginErrorAction(){}

	public function logoutAction(){
		if ($GLOBALS['TSFE']->loginUser) {
			$GLOBALS['TSFE']->fe_user->logoff();
			$this->redirect('show', 'Main', NULL);
		}
	}

// 	/**
// 	 * For debugging is called before signUpAction
// 	 */
// 	public function initializeSignupAction() {
// 		DebuggerUtility::var_dump($this->request->getArguments());
// 	}

	/**
	 * sign up a user
	 *
	 * @param \Slub\SlubWebKartenforum\Domain\Model\User $user
	 */
	public function signupAction(\Slub\SlubWebKartenforum\Domain\Model\User $user)
  {
		// check if user exist
		$userExist = Tools::getUserByUsername($this->FrontendUserRepository, $user->getUsername());
		if (!empty($userExist[0])) {
			// redirect
			$errorMessage = array( 'msg' => 'Username is already in use.');
			$this->redirect('loginError', 'Auth', NULL, $errorMessage);
		}

		// attached usergroup to user
		$usergroup = $this->userGroupRepository->findByTitle('vk2-user')[0];
		$user->addUsergroup($usergroup);

		// hash passpord
		$user->hashPassword($this->vk2config['settings']['passwordSave']);

		// add user to database
		$user->setName($user->getFirstName() . ' ' . $user->getLastName());
		$this->FrontendUserRepository->add($user);
		$this->persistenceManager->persistAll();

		$this->redirect('login', 'Auth', NULL);
//		$this->afterSignupDo($user);
	}

	/**
	 * Actions to be done after a sign up process
	 *
	 * @param \Slub\SlubWebKartenforum\Domain\Model\User $user
	 * @param bool $login Login after creation
	 * @return void
	 */
	public function afterSignupDo(\Slub\SlubWebKartenforum\Domain\Model\User $user, $login = TRUE) {
		// persist user (otherwise login is not possible if user is still disabled)
		$this->FrontendUserRepository->update($user);
		$this->persistenceManager->persistAll();

		// login user
		if ($login) {
			$this->loginAfterCreate($user);
		}

		// redirect
		$this->redirect('show', 'Main', NULL);
	}

	/**
	 * Login FE-User after creation
	 *
	 * @param \Slub\SlubWebKartenforum\Domain\Model\User $user
	 * @return void
	 */
	protected function loginAfterCreate(\Slub\SlubWebKartenforum\Domain\Model\User $user) {
		$GLOBALS['TSFE']->fe_user->checkPid = FALSE;
		$info = $GLOBALS['TSFE']->fe_user->getAuthInfoArray();
		$pids = $this->vk2Config['persistence']['storagePid'];
		$extraWhere = ' AND pid IN (' . $this->databaseConnection->cleanIntList($pids) . ')';
		$user = $GLOBALS['TSFE']->fe_user->fetchUserRecord($info['db_user'], $user->getUsername(), $extraWhere);

		//DebuggerUtility::var_dump($user);
		$GLOBALS['TSFE']->fe_user->createUserSession($user);
		$GLOBALS['TSFE']->fe_user->user = $GLOBALS['TSFE']->fe_user->fetchUserSession();
		// enforce session so we get a FE cookie, otherwise autologin does not work (TYPO3 6.2.5+)
		$GLOBALS['TSFE']->fe_user->setAndSaveSessionData('dummy', TRUE);
	}

}

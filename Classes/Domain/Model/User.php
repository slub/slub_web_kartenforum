<?php
namespace Slub\SlubWebKartenforum\Domain\Model;

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Saltedpasswords\Salt\SaltFactory;
use TYPO3\CMS\Saltedpasswords\Utility\SaltedPasswordsUtility;

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
 * User
 */
class User extends \TYPO3\CMS\Extbase\Domain\Model\FrontendUser
{

	/**
	 * Hash the password of the given user
	 *
	 * @param string $method "md5" or "sha1"
	 * @return void
	 */
	public function hashPassword($method) {
		switch ($method) {
			case 'md5':
				$this->setPassword(md5($this->getPassword()));
				break;

			case 'sha1':
				$this->setPassword(sha1($this->getPassword()));
				break;

			default:
				if (ExtensionManagementUtility::isLoaded('saltedpasswords')) {
					if (SaltedPasswordsUtility::isUsageEnabled('FE')) {
						$objInstanceSaltedPw = SaltFactory::getSaltingInstance();
						$this->setPassword($objInstanceSaltedPw->getHashedPassword($this->getPassword()));
					}
				}
		}
	}
}

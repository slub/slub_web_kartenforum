<?php
namespace Slub\SlubWebKartenforum\Domain\Model;

use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

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
 * User
 */
class User extends \TYPO3\CMS\Extbase\Domain\Model\FrontendUser
{

    /**
	 * Username - must be unique
	 *
     * @var string
     * @Extbase\Validate("NotEmpty")
	 * @Extbase\Validate("Slub\SlubWebKartenforum\Domain\Validator\UsernameValidator")
     */
    protected $username = '';

	/**
	 * Email address - make sure no record is created if empty
	 *
     * @var string
     * @Extbase\Validate("NotEmpty")
     */
    protected $email = '';

    /**
	 * Password - make sure no record is created if empty
	 *
     * @var string
 	 * @Extbase\Validate("StringLength", options={"minimum": 9, "maximum": 50})
     */
    protected $password = '';

}

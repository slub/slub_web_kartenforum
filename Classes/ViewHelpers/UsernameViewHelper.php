<?php

/*
 * Copyright notice
 *
 *  (c) 2020 Alexander Bigga <alexander.bigga@slub-dresden.de>
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

namespace Slub\SlubWebKartenforum\ViewHelpers;

use Slub\SlubWebKartenforum\Domain\Repository\FrontendUserRepository;
use \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * ViewHelper to get page info
 *
 * # Example: Basic example
 * <code>
 * <vk:frontendUser field="name">
 * 	<span>name</span>
 * </code>
 * <output>
 * Will output the fe_user name field
 * </output>
 *
 * @package TYPO3
 */
class UsernameViewHelper extends AbstractViewHelper
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
	 * Initialize arguments.
	 */
	public function initializeArguments()
	{
		parent::initializeArguments();
		$this->registerArgument('field', 'string', 'field to fetch from fe_user record', false, 'name');
	}

	/**
	 * @throws \UnexpectedValueException
	 */
	public function render()
	{
		$field = $this->arguments['field'];

		$feUserObj = $this->getActualUser();

		if ($feUserObj != NULL) {
			switch ($field) {
				case 'name':
					$output = $feUserObj->getName();
					break;
				case 'username':
				default:
					$output = $feUserObj->getUsername();
			}
			return $output;
		} else {
			return '';
		}
	}

	/**
	 * gets current logged in frontend user
	 *
	 * @return FrontendUser
	 */
	public function getActualUser()
	{
		$user = $GLOBALS['TSFE']->fe_user->user;

		if (is_null($user)) {
			return null;
		}

		$feUserObj = $this->feUserRepository->findByUid($user['uid']);
		return $feUserObj;
	}
}

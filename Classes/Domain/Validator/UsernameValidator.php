<?php
namespace Slub\SlubWebKartenforum\Domain\Validator;
/***************************************************************
 *
 *  Copyright notice
 *
 *  (c) 2020 Alexander Bigga <Alexander.Bigga@slub-dresden.de>, SLUB
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
use TYPO3\CMS\Extbase\Validation\Validator\AbstractValidator;
use TYPO3\CMS\Extbase\Domain\Repository\FrontendUserRepository;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * User
 */
class UsernameValidator extends AbstractValidator
{
    /**
     * feUserRepository
     *
     * @var FrontendUserRepository
     */
    protected $feUserRepository;

    public function __construct(array $options = [])
    {
        // TODO when upgrading to TYPO3 12 this can be replaced by DI
        // see https://docs.typo3.org/m/typo3/reference-coreapi/main/en-us/ExtensionArchitecture/Extbase/Reference/Domain/Validator.html#dependency-injection-in-validators
        $this->feUserRepository = GeneralUtility::makeInstance(FrontendUserRepository::class);
        parent::__construct($options);
    }

    /**
     * Username is only valid if it is not in use yet.
     */
    protected function isValid($value)
   {
       $countUser = $this->feUserRepository->findByUsername($value)->count();
       if ($countUser === 0) {
           return;
       }
       $this->addError('Username already in use.', 1596722363);
   }
}
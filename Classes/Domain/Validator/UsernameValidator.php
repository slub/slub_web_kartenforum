<?php

/*
 * Copyright notice
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
 */

namespace Slub\SlubWebKartenforum\Domain\Validator;

use Slub\SlubWebKartenforum\Domain\Repository\FrontendUserRepository;
use TYPO3\CMS\Extbase\Validation\Validator\AbstractValidator;

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

    public function __construct(FrontendUserRepository $feUserRepository)
    {
        $this->feUserRepository = $feUserRepository;
    }

    /**
     * Username is only valid if it is not in use yet.
     */
    protected function isValid(mixed $value): void
    {
        $countUser = $this->feUserRepository->findByUsername($value)->count();
        if ($countUser === 0) {
            return;
        }
        $this->addError('Username already in use.', 1596722363);
    }
}

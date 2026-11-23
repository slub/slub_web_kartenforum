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

use Psr\Http\Message\ServerRequestInterface;
use Slub\SlubWebKartenforum\Domain\Model\FrontendUser;
use Slub\SlubWebKartenforum\Domain\Repository\FrontendUserRepository;
use TYPO3\CMS\Frontend\Authentication\FrontendUserAuthentication;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

/**
 * ViewHelper to get the current frontend user's name or username
 *
 * # Example: Basic example
 * <code>
 * <vk:username field="name" />
 * </code>
 * <output>
 * Will output the fe_user name field
 * </output>
 */
class UsernameViewHelper extends AbstractViewHelper
{
    public function __construct(
        protected readonly FrontendUserRepository $feUserRepository,
    ) {}

    /**
     * Initialize arguments.
     */
    public function initializeArguments(): void
    {
        parent::initializeArguments();
        $this->registerArgument('field', 'string', 'field to fetch from fe_user record', false, 'name');
    }

    public function render(): string
    {
        $feUserObj = $this->getActualUser();
        if ($feUserObj === null) {
            return '';
        }

        return match ($this->arguments['field']) {
            'name' => $feUserObj->getName(),
            default => $feUserObj->getUsername(),
        };
    }

    /**
     * gets current logged in frontend user
     */
    public function getActualUser(): ?FrontendUser
    {
        $request = $this->renderingContext->hasAttribute(ServerRequestInterface::class)
            ? $this->renderingContext->getAttribute(ServerRequestInterface::class)
            : null;
        $frontendUser = $request instanceof ServerRequestInterface ? $request->getAttribute('frontend.user') : null;
        $user = $frontendUser instanceof FrontendUserAuthentication ? $frontendUser->user : null;

        if (!is_array($user)) {
            return null;
        }

        $feUserObj = $this->feUserRepository->findByUid((int)$user['uid']);
        return $feUserObj instanceof FrontendUser ? $feUserObj : null;
    }
}

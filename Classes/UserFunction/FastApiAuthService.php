<?php declare(strict_types=1);

namespace Slub\SlubWebKartenforum\UserFunction;

use Psr\Http\Message\ServerRequestInterface;
use Slub\SlubWebKartenforum\Domain\Model\FrontendUser;
use Slub\SlubWebKartenforum\Domain\Model\FrontendUserGroup;
use Slub\SlubWebKartenforum\Domain\Repository\FrontendUserRepository;
use TYPO3\CMS\Core\Attribute\AsAllowedCallable;
use TYPO3\CMS\Frontend\Authentication\FrontendUserAuthentication;

/**
 * FastApiAuthService
 */
final class FastApiAuthService
{
    public function __construct(
        private readonly FrontendUserRepository $feUserRepository,
    ) {}

    /**
     * gets current logged in frontend user
     */
    private function getActualUser(ServerRequestInterface $request): ?FrontendUser
    {
        $frontendUser = $request->getAttribute('frontend.user');
        $user = $frontendUser instanceof FrontendUserAuthentication ? $frontendUser->user : null;

        if (!is_array($user)) {
            return null;
        }

        $feUserObj = $this->feUserRepository->findByUid((int)$user['uid']);
        return $feUserObj instanceof FrontendUser ? $feUserObj : null;
    }

    /**
     * Validate user session
     *
     * Called as USER_INT userFunc, which passes the current request as third argument.
     */
    #[AsAllowedCallable]
    public function getSession(string $content, array $conf, ServerRequestInterface $request): string
    {
        $feUserObj = $this->getActualUser($request);
        $response = [
            'valid' => false,
            'userData' => null,
        ];

        if ($feUserObj === null || $feUserObj->getUsername() === '') {
            return json_encode($response, JSON_THROW_ON_ERROR);
        }

        $response['valid'] = true;
        $userData = [
            'username' => $feUserObj->getUsername(),
            'uid' => $feUserObj->getUid(),
            'groups' => array_map(
                static fn (FrontendUserGroup $group): string => $group->getTitle(),
                $feUserObj->getUsergroup()->getArray()
            ),
        ];
        $response['userData'] = $userData;

        return json_encode($response, JSON_THROW_ON_ERROR);
    }
}

<?php declare(strict_types=1);

namespace Slub\SlubWebKartenforum\UserFunction;

use Slub\SlubWebKartenforum\Domain\Model\FrontendUser;
use Slub\SlubWebKartenforum\Domain\Repository\FrontendUserRepository;

/**
 * FastApiAuthService
 */
final class FastApiAuthService
{
    /**
     * feUserRepository
     *
     * @var FrontendUserRepository
     */
    private $feUserRepository;

    public function __construct(FrontendUserRepository $feUserRepository)
    {
        $this->feUserRepository = $feUserRepository;
    }

    /**
     * gets current logged in frontend user
     *
     * @return FrontendUser
     */
    private function getActualUser()
    {
        $user = $GLOBALS['TSFE']->fe_user->user;

        if (is_null($user)) {
            return null;
        }

        $feUserObj = $this->feUserRepository->findByUid($user['uid']);
        return $feUserObj;
    }

    /**
     * Validate user session
     *
     * @param string $sessionId
     * @return mixed
     */
    public function getSession()
    {
        $feUserObj = $this->getActualUser();
        $response = [
            'valid' => false,
            'userData' => null,
        ];

        if (is_null($feUserObj) || is_null($feUserObj->getUsername())) {
            return json_encode($response);
        }

        $response['valid'] = true;
        $userData = [
            'username' => $feUserObj->getUsername(),
            'uid' => $feUserObj->getUid(),
            'groups' => array_map(function ($group) {
                return $group->getTitle();
            }, $feUserObj->getUsergroup()->getArray())
        ];
        $response['userData'] = $userData;

        return json_encode($response);
    }
}

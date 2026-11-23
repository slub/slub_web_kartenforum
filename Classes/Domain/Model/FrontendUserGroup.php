<?php

/*
 * Created by tom.schulze@pikobytes.de on 03.02.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

namespace Slub\SlubWebKartenforum\Domain\Model;

use TYPO3\CMS\Extbase\DomainObject\AbstractEntity;
use TYPO3\CMS\Extbase\Persistence\ObjectStorage;

/**
 * A Frontend User Group
 */
class FrontendUserGroup extends AbstractEntity
{
    protected string $title = '';

    protected string $description = '';

    /**
     * @var ObjectStorage<FrontendUserGroup>
     */
    protected ObjectStorage $subgroup;

    /**
     * Constructs a new Frontend User Group
     */
    public function __construct(string $title = '')
    {
        $this->setTitle($title);
        $this->subgroup = new ObjectStorage();
    }

    /**
     * Called again with initialize object, as fetching an entity from the DB does not use the constructor
     */
    public function initializeObject(): void
    {
        $this->subgroup ??= new ObjectStorage();
    }

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    /**
     * Sets the subgroups. Keep in mind that the property is called "subgroup"
     * although it can hold several subgroups.
     *
     * @param ObjectStorage<FrontendUserGroup> $subgroup An object storage containing the subgroups to add
     */
    public function setSubgroup(ObjectStorage $subgroup): void
    {
        $this->subgroup = $subgroup;
    }

    public function addSubgroup(FrontendUserGroup $subgroup): void
    {
        $this->subgroup->attach($subgroup);
    }

    public function removeSubgroup(FrontendUserGroup $subgroup): void
    {
        $this->subgroup->detach($subgroup);
    }

    /**
     * Returns the subgroups. Keep in mind that the property is called "subgroup"
     * although it can hold several subgroups.
     *
     * @return ObjectStorage<FrontendUserGroup> An object storage containing the subgroups
     */
    public function getSubgroup(): ObjectStorage
    {
        return $this->subgroup;
    }
}

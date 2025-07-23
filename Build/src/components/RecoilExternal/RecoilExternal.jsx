/*
 * Created by tom.schulze@pikobytes.de on 23.05.25.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import { useRecoilCallback } from "recoil";

const _privateExternalStore = {};

/**
 * Exposes a global recoil setter and async getter.
 *
 * Adapted from https://github.com/luisanton-io/recoil-nexus.
 *
 * Note: Has drawbacks w/ multiple roots: https://github.com/facebookexperimental/Recoil/pull/1826
 * @returns null
 */
const RecoilExternal = () => {
  const setState = useRecoilCallback(
    ({ set }) =>
      (recoilVal, valOrUpdater) => {
        set(recoilVal, valOrUpdater);
      },
    []
  );

  const getStateAsync = useRecoilCallback(
    ({ snapshot }) =>
      async (recoilVal) => {
        return snapshot.getPromise(recoilVal);
      },
    []
  );

  _privateExternalStore.setState = setState;
  _privateExternalStore.getStateAsync = getStateAsync;

  return null;
};

/**
 * Allows setting the value of a recoil atom from outside the react context.
 * @param {*} recoilVal recoil state
 * @param {*} valOrUpdater a value or recoil updater function
 * @returns
 */
export const setRecoilStateExternally = (recoilVal, valOrUpdater) =>
  _privateExternalStore.setState(recoilVal, valOrUpdater);

/**
 * Allows getting the value of a recoil atom from outside the react context.
 * @param {*} recoilVal recoil state
 * @returns a promise fullfilling to the recoil state value
 */
export const getRecoilStateExternallyAsync = async (recoilVal) =>
  _privateExternalStore.getStateAsync(recoilVal);

export default RecoilExternal;

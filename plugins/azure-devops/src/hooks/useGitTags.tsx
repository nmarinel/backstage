/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { GitTag } from '@backstage/plugin-azure-devops-common';

import { Entity } from '@backstage/catalog-model';
import { azureDevOpsApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
// import useAsync from 'react-use/lib/useAsync';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useDebounce from 'react-use/lib/useDebounce';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useProjectRepoFromEntity } from './useProjectRepoFromEntity';

export type GitTagListContextProps = {
  gitTags: GitTag[];
  loading: boolean;
  error?: Error;
};

export const GitTagListContext = createContext<
  GitTagListContextProps | undefined
>(undefined);

type OutputState = {
  gitTags: GitTag[];
};

export const GitTagListProvider = (entity: Entity) => {
  const api = useApi(azureDevOpsApiRef);
  const { project, repo } = useProjectRepoFromEntity(entity);

  const [outputState, setOutputState] = useState<OutputState>(() => { // todo: this doesn't really need its own type
    return {
      gitTags: [],
    };
  });

  const [{ loading, error }, refresh] = useAsyncFn(
    async () => {
      const response = await api.getGitTags(project, repo);
      setOutputState({ gitTags: response.items });
    },
    [api, outputState, project, repo],
    { loading: true },
  );

  useDebounce(refresh, 10);

  const value = useMemo(
    () => ({
      gitTags: outputState.gitTags,
      loading,
      error,
    }),
    [outputState, loading, error],
  );

  return <GitTagListContext.Provider value={value} />;
};

// export function useGitTags(): {
//   items?: GitTag[];
//   loading: boolean;
//   error?: Error;
// } {
//   const { project, repo } = useProjectRepoFromEntity(entity);

//   const { value, loading, error } = useAsync(() => {
//     return api.getGitTags(project, repo);
//   }, [api, project, repo]);

//   return {
//     items: value?.items,
//     loading,
//     error,
//   };
// }

export function useGitTags(entity: Entity): GitTagListContextProps {
  // const context = useContext(GitTagListContext);
  // if (!context)
  //   throw new Error('useGitTags must be used within GitTagListProvider'); // todo make GitTagListProvider
  // return context;

  const api = useApi(azureDevOpsApiRef);
  const { project, repo } = useProjectRepoFromEntity(entity);

  const [outputState, setOutputState] = useState<OutputState>(() => { // todo: this doesn't really need its own type
    return {
      gitTags: [],
    };
  });

  const [{ loading, error }, refresh] = useAsyncFn(
    async () => {
      const response = await api.getGitTags(project, repo);
      setOutputState({ gitTags: response.items });
    },
    [api, outputState, project, repo],
    { loading: true },
  );

  useDebounce(refresh, 10);

  const value = useMemo(
    () => ({
      gitTags: outputState.gitTags,
      loading,
      error,
    }),
    [outputState, loading, error],
  );

  return value;
}

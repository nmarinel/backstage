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

import { Box } from '@material-ui/core';
import {
  Link,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { GitTag } from '@backstage/plugin-azure-devops-common';
import React, { useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { AzureGitTagsIcon } from '../AzureGitTagsIcon';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useGitTags } from '../../hooks/useGitTags';
import { azureDevOpsApiRef } from '../../api';

export const GitTagTable = () => {
  const { entity } = useEntity();
  const { useState } = React;

  const { gitTags, loading, error } = useGitTags(entity);
  const api = useApi(azureDevOpsApiRef);

  const handleSubmit = (tag: GitTag) => {
    if (tag.objectId) {
      api.saveGitTagAnnotation(tag.objectId, tag.annotation);
    }
  };

  const renderTag = useCallback((row: Partial<GitTag>) => {
    return (
      <Box display="flex" alignItems="center">
        <Link to={row.link ?? ''}>{row.name}</Link>
      </Box>
    );
  }, []);
  const renderCommit = useCallback((row: Partial<GitTag>) => {
    return (
      <Box display="flex" alignItems="center">
        <Link to={row.commitLink ?? ''}>{row.peeledObjectId}</Link>
      </Box>
    );
  }, []);

  const [data, setData] = useState(gitTags);

  if (error) {
    return (
      <div>
        <ResponseErrorPanel error={error} />
      </div>
    );
  }

  return (
    <Table<GitTag>
      isLoading={loading}
      editable={{
        onRowUpdate: (newData: any, oldData: any) =>
          new Promise((resolve, reject) => {
            const gt: GitTag = {
              annotation: String(newData.annotation),
              objectId: newData.objectId,
              link: newData.link,
              commitLink: newData.commitLink,
            };

            // update UI with new data
            const dataUpdate = [...gitTags];
            const index = oldData.tableData.id;
            dataUpdate[index] = newData;
            setData([...dataUpdate]);

            handleSubmit(gt);
            resolve(gt);
          }),
      }}
      columns={[
        {
          title: 'Annotation',
          field: 'annotation',
          width: 'auto',
          editable: 'always',
        },
        {
          title: 'Tag',
          field: 'name',
          highlight: false,
          defaultSort: 'desc',
          editable: 'never',
          width: 'auto',
          render: renderTag,
        },
        {
          title: 'Commit',
          field: 'peeledObjectId',
          editable: 'never',
          width: 'auto',
          render: renderCommit,
        },
        {
          title: 'Created By',
          field: 'createdBy',
          editable: 'never',
          width: 'auto',
        },
      ]}
      options={{
        search: true,
        paging: true,
        pageSize: 5,
        showEmptyDataSourceMessage: !loading,
        loadingType: 'linear',
      }}
      title={
        <Box display="flex" alignItems="center">
          <AzureGitTagsIcon style={{ fontSize: 30 }} />
          <Box mr={1} />
          Azure Repos - Git Tags ({gitTags ? gitTags.length : 0})
        </Box>
      }
      data={gitTags}
    />
  );
};

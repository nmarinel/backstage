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

const columns: TableColumn[] = [
  {
    title: 'Tag',
    field: 'name',
    highlight: false,
    defaultSort: 'desc',
    width: 'auto',
    render: (row: Partial<GitTag>) => (
      <Box display="flex" alignItems="center">
        <Link to={row.link ?? ''}>{row.name}</Link>
      </Box>
    ),
  },
  {
    title: 'Commit',
    field: 'peeledObjectId',
    width: 'auto',
    render: (row: Partial<GitTag>) => (
      <Box display="flex" alignItems="center">
        <Link to={row.commitLink ?? ''}>{row.peeledObjectId}</Link>
      </Box>
    ),
  },
  {
    title: 'Annotation',
    field: 'annotation',
    width: 'auto',
    editable: 'always',
  },
  {
    title: 'Created By',
    field: 'createdBy',
    width: 'auto',
  },
];

export const GitTagTable = (updateTarget: GitTag) => {
  const { entity } = useEntity();

  const { items, loading, error } = useGitTags(entity);
  const api = useApi(azureDevOpsApiRef);

  const handleClick = useCallback(async () => {
    if (updateTarget.objectId && updateTarget.annotation) {
      await api.saveGitTagAnnotation(
        updateTarget.objectId,
        updateTarget.annotation,
      );
    }
  }, [updateTarget, api]);

  if (error) {
    return (
      <div>
        <ResponseErrorPanel error={error} />
      </div>
    );
  }

  return (
    <Table
      isLoading={loading}
      columns={columns}
      cellEditable={{
        onCellEditApproved: (newValue, oldValue, rowData: any, columnDef) => {
          return new Promise((resolve, reject) => {
            // console.log('rowData: ' + JSON.stringify(rowData));

            const gt: GitTag = {
              annotation: String(newValue),
              objectId: rowData.objectId,
              link: rowData.link,
              commitLink: rowData.commitLink,
            };
            // updateTarget = gt; todo find a way around no-param-reassign

            setTimeout(() => {
              handleClick();
              resolve();
            }, 1000);
          });
        },
        isCellEditable: (rowData: Partial<GitTag>, columnDef) => {
          return true;
        },
      }}
      options={{
        search: true,
        paging: true,
        pageSize: 5,
        showEmptyDataSourceMessage: !loading,
      }}
      title={
        <Box display="flex" alignItems="center">
          <AzureGitTagsIcon style={{ fontSize: 30 }} />
          <Box mr={1} />
          Azure Repos - Git Tags ({items ? items.length : 0})
        </Box>
      }
      data={items ?? []}
    />
  );
};

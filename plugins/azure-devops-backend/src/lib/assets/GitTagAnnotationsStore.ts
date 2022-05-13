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

import { resolvePackagePath } from '@backstage/backend-common';
import { Knex } from 'knex';
import { GitTagAnnotation } from './types';

const migrationsDir = resolvePackagePath(
  '@backstage/plugin-azure-devops-backend',
  'migrations',
);

interface GitTagAnnotationRow {
  gitTagObjectId: string; // or commit id?
  value: string;
  created_at?: Date;
  updated_at?: Date;
}

/** @internal */
export interface GitTagAnnotationStoreOptions {
  database: Knex;
}

/**
 * A storage for static assets that are assumed to be immutable.
 *
 * @internal
 */
export class GitTagAnnotationsStore {
  #db: Knex;

  static async create(options: GitTagAnnotationStoreOptions) {
    await options.database.migrate.latest({
      directory: migrationsDir,
    });
    return new GitTagAnnotationsStore(options);
  }

  private constructor(options: GitTagAnnotationStoreOptions) {
    this.#db = options.database;
  }

  async storeGitTagAnnotation(gitTagAnnotation: GitTagAnnotation) {
    const existingRow = await this.#db<GitTagAnnotationRow>(
      'git_tag_annotations',
    ).where('gitTagObjectId', gitTagAnnotation.gitTagObjectId);

    if (existingRow) {
      await this.#db('git_tag_annotations')
        .update('value', gitTagAnnotation.value)
        .where('gitTagObjectId', gitTagAnnotation.gitTagObjectId);
    } else {
      await this.#db('git_tag_annotations').insert({
        gitTagObjectId: gitTagAnnotation.gitTagObjectId,
        value: gitTagAnnotation.value,
      });
    }
  }

  async getGitTagAnnotation(
    gitTagObjectId: string,
  ): Promise<GitTagAnnotation | undefined> {
    const [row] = await this.#db<GitTagAnnotation>('git_tag_annotations').where(
      {
        gitTagObjectId,
      },
    );
    if (!row) {
      return undefined;
    }
    return row;
  }
}

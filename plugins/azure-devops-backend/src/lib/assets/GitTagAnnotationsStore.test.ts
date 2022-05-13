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

import { TestDatabases } from '@backstage/backend-test-utils';
import { GitTagAnnotationsStore } from './GitTagAnnotationsStore';

describe('StaticAssetsStore', () => {
  const databases = TestDatabases.create({
    ids: ['POSTGRES_13', 'POSTGRES_9', 'SQLITE_3'],
  });

  it.each(databases.eachSupportedId())(
    'should store and retrieve assets, %p',
    async databaseId => {
      const store = await GitTagAnnotationsStore.create({
        database: await databases.init(databaseId),
      });

      await store.storeGitTagAnnotation({
        gitTagObjectId: 'aaa2f645ec987a60980a819e3f7aaa93d942cc3c',
        value: 'foo',
      });
      await store.storeGitTagAnnotation({
        gitTagObjectId: '295f8050d35435f27cb431cffd815204dc6cd3ea',
        value: 'bar',
      });
      await store.storeGitTagAnnotation({
        gitTagObjectId: '295f8050d35435f27cb431cffd815204dc6cd3ea',
        value: 'updated bar',
      });

      const now = new Date().getTime();

      const foo = await store.getGitTagAnnotation(
        'aaa2f645ec987a60980a819e3f7aaa93d942cc3c',
      );
      expect(foo!.value).toBe('foo');
      expect(foo!.created_at).toBeDefined();
      expect(foo!.created_at?.getTime()).toBeGreaterThan(now - 5000);
      expect(foo!.updated_at).toBeUndefined();

      const bar = await store.getGitTagAnnotation(
        '295f8050d35435f27cb431cffd815204dc6cd3ea',
      );
      expect(bar!.value).toBe('updated bar');
      expect(bar!.created_at).toBeDefined();
      expect(bar!.created_at?.getTime()).toBeGreaterThan(now - 5000);
      expect(bar!.updated_at).toBeDefined();

      await expect(
        store.getGitTagAnnotation('badidhere'),
      ).resolves.toBeUndefined();
    },
    60_000,
  );
});

/*
 * Copyright 2022 The Backstage Authors
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

exports.up = async function up(knex) {
  return knex.schema.createTable('git_tag_annotations', table => {
    table.comment('Annotations for git tags');
    table
      .text('gitTagObjectId')
      .primary()
      .notNullable()
      .comment('Unique ID for the git tag to be annotated');
    table.text('value').notNullable().comment('annotation text');
    table
      .timestamps()
      .comment('Adds created_at and updated_at columns on the database');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('git_tag_annotations');
};

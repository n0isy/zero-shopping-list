import {
  boolean,
  createSchema,
  createBuilder,
  number,
  relationships,
  string,
  table,
} from '@rocicorp/zero';

const list = table('list')
  .columns({
    id: string(),
    name: string(),
    created_at: number(),
  })
  .primaryKey('id');

const item = table('item')
  .columns({
    id: string(),
    list_id: string(),
    title: string(),
    checked: boolean(),
    sort_order: number(),
    created_at: number(),
  })
  .primaryKey('id');

const listRelationships = relationships(list, ({many}) => ({
  items: many({
    sourceField: ['id'],
    destField: ['list_id'],
    destSchema: item,
  }),
}));

const itemRelationships = relationships(item, ({one}) => ({
  list: one({
    sourceField: ['list_id'],
    destField: ['id'],
    destSchema: list,
  }),
}));

export const schema = createSchema({
  tables: [list, item],
  relationships: [listRelationships, itemRelationships],
});

export const builder = createBuilder(schema);

declare module '@rocicorp/zero' {
  interface DefaultTypes {
    schema: typeof schema;
  }
}

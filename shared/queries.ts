import {defineQueries, defineQuery} from '@rocicorp/zero';
import {z} from 'zod/mini';
import {builder} from './schema';

export const queries = defineQueries({
  listWithItems: defineQuery(
    z.string(),
    ({args: listId}) =>
      builder.list.where('id', listId).related('items').one(),
  ),
});

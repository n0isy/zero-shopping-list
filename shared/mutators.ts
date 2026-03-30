import {defineMutator, defineMutators} from '@rocicorp/zero';
import {z} from 'zod/mini';

export const mutators = defineMutators({
  list: {
    create: defineMutator(
      z.object({
        id: z.string(),
        name: z.string(),
        created_at: z.number(),
      }),
      async ({tx, args}) => {
        await tx.mutate.list.insert({
          id: args.id,
          name: args.name,
          created_at: args.created_at,
        });
      },
    ),
    rename: defineMutator(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
      async ({tx, args}) => {
        await tx.mutate.list.update({id: args.id, name: args.name});
      },
    ),
  },
  item: {
    add: defineMutator(
      z.object({
        id: z.string(),
        list_id: z.string(),
        title: z.string(),
        sort_order: z.number(),
        created_at: z.number(),
      }),
      async ({tx, args}) => {
        await tx.mutate.item.insert({
          id: args.id,
          list_id: args.list_id,
          title: args.title,
          checked: false,
          sort_order: args.sort_order,
          created_at: args.created_at,
        });
      },
    ),
    toggle: defineMutator(
      z.object({
        id: z.string(),
        checked: z.boolean(),
      }),
      async ({tx, args}) => {
        await tx.mutate.item.update({id: args.id, checked: args.checked});
      },
    ),
    remove: defineMutator(
      z.string(),
      async ({tx, args: id}) => {
        await tx.mutate.item.delete({id});
      },
    ),
  },
});

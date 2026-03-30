import {mustGetMutator, type ReadonlyJSONValue} from '@rocicorp/zero';
import {handleMutateRequest} from '@rocicorp/zero/server';
import {zeroPostgresJS} from '@rocicorp/zero/server/adapters/postgresjs';
import postgres from 'postgres';
import {mutators} from '../../../../shared/mutators';
import {schema} from '../../../../shared/schema';
import {NextResponse} from 'next/server';

const sql = postgres(process.env.ZERO_UPSTREAM_DB as string);
const dbProvider = zeroPostgresJS(schema, sql);

export async function POST(request: Request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const body = (await request.json()) as ReadonlyJSONValue;

  const response = await handleMutateRequest(
    dbProvider,
    (transact, _mutation) =>
      transact((tx, name, args) => {
        const mutator = mustGetMutator(mutators, name);
        return mutator.fn({tx, args, ctx: undefined});
      }),
    query,
    body,
    'info',
  );

  return NextResponse.json(response);
}

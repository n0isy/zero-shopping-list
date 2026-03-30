import {mustGetQuery, type ReadonlyJSONValue} from '@rocicorp/zero';
import {handleQueryRequest} from '@rocicorp/zero/server';
import {queries} from '../../../../shared/queries';
import {schema} from '../../../../shared/schema';
import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  const body = (await request.json()) as ReadonlyJSONValue;

  const response = await handleQueryRequest(
    (name: string, args: ReadonlyJSONValue | undefined) => {
      const query = mustGetQuery(queries, name);
      return query.fn({args, ctx: undefined});
    },
    schema,
    body,
  );

  return NextResponse.json(response);
}

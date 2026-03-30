import type {Plugin} from 'vite';
import {
  mustGetMutator,
  mustGetQuery,
  type ReadonlyJSONValue,
} from '@rocicorp/zero';
import {handleMutateRequest, handleQueryRequest} from '@rocicorp/zero/server';
import {zeroPostgresJS} from '@rocicorp/zero/server/adapters/postgresjs';
import postgres from 'postgres';
import {mutators} from '../../shared/mutators';
import {queries} from '../../shared/queries';
import {schema} from '../../shared/schema';

function readBody(req: any): Promise<ReadonlyJSONValue> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => (data += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(e); }
    });
  });
}

export function apiPlugin(): Plugin {
  let dbProvider: any;

  return {
    name: 'api-server',
    configureServer(server) {
      const dbUrl = process.env.ZERO_UPSTREAM_DB;
      if (!dbUrl) {
        console.warn('ZERO_UPSTREAM_DB not set, API routes disabled');
        return;
      }
      const sql = postgres(dbUrl);
      dbProvider = zeroPostgresJS(schema, sql);

      server.middlewares.use('/api/mutate', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        try {
          const url = new URL(req.url!, `http://localhost`);
          const query = Object.fromEntries(url.searchParams.entries());
          const body = await readBody(req);
          const response = await handleMutateRequest(
            dbProvider,
            (transact) =>
              transact((tx, name, args) => {
                const mutator = mustGetMutator(mutators, name);
                return mutator.fn({tx, args, ctx: undefined});
              }),
            query,
            body,
            'info',
          );
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(response));
        } catch (e) {
          console.error('mutate error:', e);
          res.statusCode = 500;
          res.end(JSON.stringify({error: String(e)}));
        }
      });

      server.middlewares.use('/api/query', async (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        try {
          const body = await readBody(req);
          const response = await handleQueryRequest(
            (name: string, args: ReadonlyJSONValue | undefined) => {
              const query = mustGetQuery(queries, name);
              return query.fn({args, ctx: undefined});
            },
            schema,
            body,
          );
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(response));
        } catch (e) {
          console.error('query error:', e);
          res.statusCode = 500;
          res.end(JSON.stringify({error: String(e)}));
        }
      });

      console.log('API routes registered: /api/mutate, /api/query');
    },
  };
}

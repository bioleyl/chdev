import { ZodError } from 'zod';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodSchema } from 'zod';

export type TypedRequest<TBody = unknown, TParams = unknown, TQuery = Record<string, unknown>> = Omit<
  Request,
  'body' | 'params' | 'query'
> & {
  body: TBody;
  params: TParams;
  query: TQuery;
};

export type TypedHandler<TBody, TParams = unknown, TQuery = Record<string, unknown>> = (
  req: TypedRequest<TBody, TParams, TQuery>,
  res: Response,
  next: NextFunction
) => unknown | Promise<unknown>;

interface ValidationSchemas<TBody, TParams, TQuery> {
  body?: ZodSchema<TBody>;
  params?: ZodSchema<TParams>;
  query?: ZodSchema<TQuery>;
}

/**
 *  Middleware de validation pour Express utilisant Zod. Permet de valider les paramètres de route, la query string et le corps de la requête.
 *  En cas d'erreur de validation, renvoie une réponse 422 avec les détails des erreurs.
 * @param schemas ValidationSchemas<TBody, TParams, TQuery> Les schémas Zod pour valider le corps (body), les paramètres (params) et la query string (query) de la requête.
 * @param handlers Le ou les handlers de la route à exécuter si la validation réussit.
 * @returns Un tableau contenant le middleware de validation et les handlers de la route.
 */
export const validateMiddleware = <TBody = unknown, TParams = unknown, TQuery = Record<string, unknown>>(
  schemas: ValidationSchemas<TBody, TParams, TQuery>,
  ...handlers: Array<TypedHandler<TBody, TParams, TQuery>>
): Array<RequestHandler> => {
  const middleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mutableReq = req as TypedRequest<TBody, TParams, TQuery>;

      if (schemas.params) {
        mutableReq.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        mutableReq.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.body) {
        mutableReq.body = await schemas.body.parseAsync(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(422).json({
          status: 'fail',
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };

  return [middleware, ...(handlers as Array<RequestHandler>)];
};

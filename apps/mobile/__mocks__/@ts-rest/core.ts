/* eslint-disable @typescript-eslint/naming-convention -- mass re-exporting someone else's module*/
import type { ApiFetcherArgs } from '@ts-rest/core';
import { apiMockers } from '../../__tests__/mock-api';
const originalModule = jest.requireActual('@ts-rest/core');

// I shit you not this is the only way to pass through everything
// but mock ONE function.
export const ContractNoBody = originalModule.ContractNoBody;
export const ContractPlainTypeRuntimeSymbol =
  originalModule.ContractPlainTypeRuntimeSymbol;
export const ResponseValidationError = originalModule.ResponseValidationError;
export const TsRestResponseError = originalModule.TsRestResponseError;
export const UnknownStatusError = originalModule.UnknownStatusError;
export const ZodErrorSchema = originalModule.ZodErrorSchema;
export const checkZodSchema = originalModule.checkZodSchema;
export const convertQueryParamsToUrlString =
  originalModule.convertQueryParamsToUrlString;
export const encodeQueryParams = originalModule.encodeQueryParams;
export const encodeQueryParamsJson = originalModule.encodeQueryParamsJson;
export const evaluateFetchApiArgs = originalModule.evaluateFetchApiArgs;
export const exhaustiveGuard = originalModule.exhaustiveGuard;
export const extractZodObjectShape = originalModule.extractZodObjectShape;
export const fetchApi = originalModule.fetchApi;
export const getCompleteUrl = originalModule.getCompleteUrl;
export const insertParamsIntoPath = originalModule.insertParamsIntoPath;
export const isAppRouteMutation = originalModule.isAppRouteMutation;
export const isAppRouteNoBody = originalModule.isAppRouteNoBody;
export const isAppRouteOtherResponse = originalModule.isAppRouteOtherResponse;
export const isAppRouteResponse = originalModule.isAppRouteResponse;
export const isErrorResponse = originalModule.isErrorResponse;
export const isSuccessResponse = originalModule.isSuccessResponse;
export const isResponse = originalModule.isResponse;
export const isUnknownErrorResponse = originalModule.isUnknownErrorResponse;
export const isUnknownResponse = originalModule.isUnknownResponse;
export const isUnknownSuccessResponse = originalModule.isUnknownSuccessResponse;
export const isZodObject = originalModule.isZodObject;
export const isZodObjectStrict = originalModule.isZodObjectStrict;
export const isZodType = originalModule.isZodType;
export const parseJsonQueryObject = originalModule.parseJsonQueryObject;
export const validateResponse = originalModule.validateResponse;
export const zodErrorResponse = originalModule.zodErrorResponse;
export const zodMerge = originalModule.zodMerge;

export const isAppRoute = originalModule.isAppRoute;
export const isAppRouteQuery = originalModule.isAppRouteQuery;
export const getRouteQuery = originalModule.getRouteQuery;
export const initContract = originalModule.initContract;
export const initClient = originalModule.initClient;
export const tsRestFetchApi = jest
  .fn()
  .mockImplementation(async (args: ApiFetcherArgs) => {
    const defaultResponse = {
      status: 200,
      body: {},
      headers: new Headers(),
    };

    const mocker = apiMockers.value.find((mocker) =>
      mocker.requestMatches(args),
    );
    if (mocker) {
      return { ...defaultResponse, ...mocker.response() };
    }
    return defaultResponse;
  });

import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import { ZodType, type ZodIssue } from 'zod';
import { HTTPException } from 'hono/http-exception';

export const simpleValidator = <
  T extends keyof ValidationTargets,
  Z extends ZodType
>(
  target: T,
  object: Z
) =>
  zValidator(target, object, (result, _) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: zToEnglish(result.error.issues)
      });
    }
  });

const zToEnglish = (issues: ZodIssue | ZodIssue[]): string => {
  if (Array.isArray(issues)) {
    return issues.map(zToEnglish).join('; ');
  }

  const concatWithQuote = (arr: any[]): string =>
    arr.map(k => `'${k}'`).join(', ');

  const issue = issues;
  switch (issue.code) {
    case 'unrecognized_keys':
      if (issue.keys.length === 1)
        return `Property '${issue.keys[0]}' is not allowed`;
      else return `Properties ${concatWithQuote(issue.keys)} are not allowed`;

    case 'invalid_string':
      if (issue.validation === 'regex')
        return `Property ${issue.path.map(p => `'${p}'`).join(', ')} does not satisfy the conditions`;
      break;

    case 'invalid_type':
      return `${concatWithQuote(issue.path)} is either missing or not a ${issue.expected}`;

    case 'invalid_date':
      return `${concatWithQuote(issue.path)} is either missing or not a date`;

    case 'too_small':
      return `${concatWithQuote(issue.path)} is too small`;
  }

  return issue.message;
};

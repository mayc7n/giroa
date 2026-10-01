import { ESLint, type Linter } from 'eslint';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const projectConfig = require('../../eslint.config.js') as Linter.Config[];
const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: projectConfig });

async function lintSnippet(source: string) {
  const [result] = await eslint.lintText(source, {
    filePath: `${process.cwd()}/src/lint-fixture.ts`,
  });
  return result;
}

describe('convenção de nomes do projeto', () => {
  it('rejeita identificadores snake_case', async () => {
    const result = await lintSnippet('export const invalid_name = 1;');

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: '@typescript-eslint/naming-convention',
          severity: 2,
        }),
      ]),
    );
  });

  it('aceita identificadores camelCase', async () => {
    const result = await lintSnippet('export const validName = 1;');

    expect(result.messages.filter(({ ruleId }) => ruleId === '@typescript-eslint/naming-convention')).toHaveLength(0);
  });

  it('aceita constantes em UPPER_CASE', async () => {
    const result = await lintSnippet('export const DATABASE_VERSION = 2;');

    expect(result.messages.filter(({ ruleId }) => ruleId === '@typescript-eslint/naming-convention')).toHaveLength(0);
  });

  it('aceita propriedades entre aspas que exigem hífen', async () => {
    const result = await lintSnippet("export const payload = { 'data-value': 1 };");

    expect(result.messages.filter(({ ruleId }) => ruleId === '@typescript-eslint/naming-convention')).toHaveLength(0);
  });

  it('rejeita propriedades PascalCase fora de componentes', async () => {
    const result = await lintSnippet('export const payload = { InvalidProperty: 1 };');

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: '@typescript-eslint/naming-convention',
          severity: 2,
        }),
      ]),
    );
  });
});

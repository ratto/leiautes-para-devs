/**
 * @file validation.ts
 * @description Regras de validação em tempo real para campos CNAB240 (US07).
 *
 * Exporta funções factory que retornam arrays de `ValidationRule` compatíveis com
 * o prop `rules` do `q-input` e `q-select` do Quasar. As regras cobrem:
 * - Tipo numérico (`'Num'`): apenas dígitos 0–9.
 * - Tipo alfanumérico (`'Alfa'`): charset FEBRABAN (letras, dígitos, espaço,
 *   pontuação e caracteres acentuados do ISO-8859-1).
 * - Obrigatoriedade: campo não pode estar vazio quando `obrigatorio: true`.
 *
 * Mensagens de erro seguem o padrão definido pelo SPEC US08:
 * - Tipo inválido: `"Campo [Nome]: aceita apenas [tipo]. Valor informado: '[valor]'."`
 * - Campo obrigatório vazio: `"Campo [Nome] é obrigatório."`
 *
 * ## Bypass em Modo Playground (US10, RN02)
 *
 * Todas as regras consultam `useConfigStore().getModoPlayground` **a cada chamada**
 * (dentro do closure retornado, não no momento da criação da regra). Quando o
 * Playground está ativo, cada regra retorna `true` imediatamente, sem checar o
 * valor — isso permite que o `q-form` não bloqueie o download nem exiba erros
 * enquanto o QA testa entradas fora do padrão FEBRABAN.
 *
 * ## Uso recomendado
 *
 * Para campos editáveis comuns (`q-input`):
 * ```ts
 * import { regrasCampo } from 'src/utils/validation';
 * // No template:
 * // <q-input :rules="regrasCampo(campo)" />
 * ```
 *
 * Para campos de seleção (`q-select`):
 * ```ts
 * import { regraObrigatorio } from 'src/utils/validation';
 * // No template:
 * // <q-select :rules="campo.obrigatorio ? [regraObrigatorio(campo)] : []" />
 * ```
 *
 * @see src/utils/masks.ts — filtros de entrada para campos numéricos
 * @see src/model/cnab240/types.ts — `CampoLeiaute`, `TipoCampo`
 * @see src/stores/config-store.ts — `getModoPlayground`
 * @see docs/spec/us07-validacao-tempo-real/SPEC.md
 * @see docs/spec/us10-modo-playground/SPEC.md — RN02
 */

import type { CampoLeiaute } from 'src/model/cnab240/types';
import { useConfigStore } from 'src/stores/config-store';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Tipo de regra de validação compatível com o prop `rules` do `q-input` Quasar.
 *
 * Retorna `true` se o valor for válido, ou uma string de erro descritiva se inválido.
 * Quasar também aceita `Promise<true | string>`, mas todas as regras aqui são síncronas.
 */
export type ValidationRule = (val: string) => true | string;

// ─── Expressões regulares ──────────────────────────────────────────────────────

/**
 * Expressão regular para campos numéricos: apenas dígitos 0–9.
 * Strings vazias passam (`*` em vez de `+`) — a regra de obrigatoriedade
 * cuida do caso de campo vazio.
 *
 * @example
 * REGEX_NUMERICO.test('003')  // → true
 * REGEX_NUMERICO.test('3a')   // → false
 * REGEX_NUMERICO.test('')     // → true
 */
export const REGEX_NUMERICO = /^[0-9]*$/;

/**
 * Expressão regular para campos alfanuméricos FEBRABAN.
 *
 * Charset aceito:
 * - Letras latinas A–Z e a–z.
 * - Caracteres acentuados do ISO-8859-1 (À–Ö, Ø–ö, ø–ÿ), cobrindo
 *   ã, õ, â, ê, î, ô, û, ç, á, é, í, ó, ú e equivalentes maiúsculos.
 * - Dígitos 0–9.
 * - Espaço, pontuação e símbolos comuns em campos CNAB:
 *   `. , ; : ! ? @ # $ % & * ( ) - _ + = [ ] { } | < > / \`
 *
 * Strings vazias passam (ver `REGEX_NUMERICO` — mesma razão).
 *
 * @example
 * REGEX_ALFANUMERICO.test('EMPRESA LTDA')  // → true
 * REGEX_ALFANUMERICO.test('Rua São João')  // → true
 * REGEX_ALFANUMERICO.test('tab\there')     // → false (tab não é permitido)
 */
export const REGEX_ALFANUMERICO = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9 .,;:!?@#$%&*()\-_+=[\]{}|<>/\\]*$/;

// ─── Funções factory de regras ────────────────────────────────────────────────

/**
 * Retorna a regra de validação de tipo numérico para o campo.
 *
 * O campo deve conter apenas dígitos (0–9). Strings vazias passam nesta regra;
 * a regra de obrigatoriedade (`regraObrigatorio`) cuida dos campos required vazios.
 *
 * @param campo - Metadados do campo CNAB240 (deve ter `tipo: 'Num'`).
 * @returns Função de validação que retorna `true` se válido ou mensagem de erro.
 *
 * Em Modo Playground (US10, RN02), retorna `true` imediatamente sem checar o valor.
 *
 * @example
 * const regra = regraNumerico({ label: 'Código do Banco', tipo: 'Num', ... });
 * regra('341')   // → true
 * regra('')      // → true (vazio passa — obrigatoriedade é regra separada)
 * regra('3a1')   // → 'Campo Código do Banco: aceita apenas dígitos (0–9). Valor informado: "3a1".'
 */
export function regraNumerico(campo: CampoLeiaute): ValidationRule {
  return (val: string): true | string => {
    if (useConfigStore().getModoPlayground) return true;
    if (!val) return true;
    if (REGEX_NUMERICO.test(val)) return true;
    return `Campo ${campo.label}: aceita apenas dígitos (0–9). Valor informado: "${val}".`;
  };
}

/**
 * Retorna a regra de validação do charset alfanumérico FEBRABAN para o campo.
 *
 * O campo deve conter apenas caracteres do conjunto ISO-8859-1 permitido pela
 * FEBRABAN: letras (incluindo acentuadas), dígitos, espaço e pontuação comum.
 * Strings vazias passam nesta regra.
 *
 * @param campo - Metadados do campo CNAB240 (deve ter `tipo: 'Alfa'`).
 * @returns Função de validação que retorna `true` se válido ou mensagem de erro.
 *
 * Em Modo Playground (US10, RN02), retorna `true` imediatamente sem checar o valor.
 *
 * @example
 * const regra = regraAlfanumerico({ label: 'Nome da Empresa', tipo: 'Alfa', ... });
 * regra('EMPRESA LTDA')   // → true
 * regra('Rua São João')   // → true
 * regra('nome\ttab')      // → 'Campo Nome da Empresa: aceita apenas o charset FEBRABAN...'
 */
export function regraAlfanumerico(campo: CampoLeiaute): ValidationRule {
  return (val: string): true | string => {
    if (useConfigStore().getModoPlayground) return true;
    if (!val) return true;
    if (REGEX_ALFANUMERICO.test(val)) return true;
    return (
      `Campo ${campo.label}: aceita apenas o charset FEBRABAN ` +
      `(letras, dígitos, espaço e pontuação). Valor informado: "${val}".`
    );
  };
}

/**
 * Retorna a regra de obrigatoriedade para o campo.
 *
 * Se `campo.obrigatorio` for `true`, o valor não pode ser vazio nem conter
 * apenas espaços. Para campos opcionais, retorna uma regra que sempre passa.
 *
 * @param campo - Metadados do campo CNAB240.
 * @returns Função de validação que retorna `true` se preenchido ou mensagem de erro.
 *
 * @example
 * const regra = regraObrigatorio({ obrigatorio: true, label: 'Código do Banco', ... });
 * regra('')    // → 'Campo Código do Banco é obrigatório.'
 * regra('   ') // → 'Campo Código do Banco é obrigatório.'
 * regra('341') // → true
 *
 * const regraOpcional = regraObrigatorio({ obrigatorio: false, label: 'Densidade', ... });
 * regraOpcional('')  // → true (campo opcional — vazio é permitido)
 *
 * Em Modo Playground (US10, RN02), retorna `true` imediatamente, mesmo para
 * campos obrigatórios vazios.
 */
export function regraObrigatorio(campo: CampoLeiaute): ValidationRule {
  return (val: string): true | string => {
    if (useConfigStore().getModoPlayground) return true;
    if (!campo.obrigatorio) return true;
    if (val && val.trim().length > 0) return true;
    return `Campo ${campo.label} é obrigatório.`;
  };
}

/**
 * Retorna todas as regras de validação aplicáveis ao campo editável.
 *
 * Combina as regras de tipo (numérico ou alfanumérico) com a regra de
 * obrigatoriedade: `[tipoRegra, regraObrigatorio]`.
 *
 * Não deve ser chamada para campos `readonly`, pois esses não são editáveis
 * e não exibem mensagens de erro ao usuário.
 *
 * @param campo - Metadados do campo CNAB240 não-readonly.
 * @returns Array de `ValidationRule` pronto para uso no prop `rules` do `q-input`.
 *
 * @example
 * ```ts
 * // Em um componente Vue:
 * import { regrasCampo } from 'src/utils/validation';
 *
 * // No template:
 * // <q-input :rules="regrasCampo(campo)" />
 * ```
 */
export function regrasCampo(campo: CampoLeiaute): ValidationRule[] {
  const regrasTipo = campo.tipo === 'Num' ? regraNumerico(campo) : regraAlfanumerico(campo);

  return [regrasTipo, regraObrigatorio(campo)];
}

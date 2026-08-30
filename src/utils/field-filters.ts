/**
 * @file field-filters.ts
 * @description Filtros de entrada para campos CNAB240 (US07).
 *
 * Funções puras que transformam um valor bruto de entrada em um valor filtrado
 * antes de ser gravado no estado reativo do composable. O objetivo é implementar
 * o requisito "campos numéricos rejeitam caracteres não numéricos" de forma
 * **proativa** (o caractere inválido nunca entra no estado) em vez de apenas
 * exibir um erro após a digitação.
 *
 * ## Estratégia por tipo de campo
 *
 * | Tipo (`CampoLeiaute.tipo`) | Estratégia                                     |
 * | -------------------------- | ---------------------------------------------- |
 * | `'Num'`                    | Filtra: remove não-dígitos silenciosamente      |
 * | `'Alfa'`                   | Pass-through: erros via regra de validação      |
 *
 * Para campos alfanuméricos (`'Alfa'`), a remoção silenciosa de caracteres
 * prejudicaria a UX (charset amplo, difícil detectar o que foi removido).
 * Por isso, `filtrarAlfanumerico` é pass-through e a validação FEBRABAN é
 * feita por regras em `src/utils/validation.ts`.
 *
 * ## Uso recomendado
 *
 * No handler `@update:model-value` de `q-input` editável:
 * ```ts
 * import { filtrarEntrada } from 'src/utils/field-filters';
 *
 * function handleUpdate(campo: CampoLeiaute, val: string | null | number): void {
 *   estado[campo.id] = filtrarEntrada(campo, String(val ?? ''));
 * }
 * ```
 *
 * No template:
 * ```vue
 * <q-input
 *   :model-value="estado[campo.id]"
 *   @update:model-value="(val) => handleUpdate(campo, val)"
 * />
 * ```
 *
 * @see src/utils/validation.ts — regras de validação (erro visual em q-input)
 * @see src/model/cnab240/types.ts — `CampoLeiaute`, `TipoCampo`
 */

import type { CampoLeiaute } from 'src/model/cnab240/types';

// ─── Filtros por tipo ──────────────────────────────────────────────────────────

/**
 * Remove todos os caracteres não-dígitos de uma string de entrada.
 *
 * Usado nos campos com `tipo: 'Num'` para filtrar proativamente a entrada
 * antes de gravar no estado: ao o usuário digitar `'12a'`, o valor gravado é `'12'`.
 * Zeros à esquerda são preservados (útil para campos como agência: `'0001'`).
 *
 * @param valor - String de entrada bruta recebida do evento do `q-input`.
 * @returns String contendo apenas dígitos (0–9) do original.
 *
 * @example
 * filtrarNumerico('12a3b')  // → '123'
 * filtrarNumerico('001')    // → '001' (zeros à esquerda preservados)
 * filtrarNumerico('')       // → ''
 * filtrarNumerico('abc')    // → ''
 */
export function filtrarNumerico(valor: string): string {
  return valor.replace(/[^0-9]/g, '');
}

/**
 * Retorna o valor sem alteração (pass-through) para campos alfanuméricos.
 *
 * Para campos `tipo: 'Alfa'`, a validação do charset FEBRABAN é feita por regra
 * de `q-input` (erro visual), não por filtragem silenciosa. Esta função existe
 * para manter a API simétrica de `filtrarEntrada`, permitindo que os componentes
 * não precisem verificar o tipo do campo antes de chamar o filtro.
 *
 * @param valor - String de entrada bruta.
 * @returns Mesma string, sem nenhuma modificação.
 *
 * @example
 * filtrarAlfanumerico('EMPRESA LTDA')  // → 'EMPRESA LTDA'
 * filtrarAlfanumerico('Rua São João')  // → 'Rua São João'
 */
export function filtrarAlfanumerico(valor: string): string {
  return valor;
}

// ─── Filtro composto ───────────────────────────────────────────────────────────

/**
 * Aplica o filtro de entrada correto com base no tipo do campo CNAB240.
 *
 * Despacha para `filtrarNumerico` quando `campo.tipo === 'Num'` e para
 * `filtrarAlfanumerico` (pass-through) quando `campo.tipo === 'Alfa'`.
 *
 * Deve ser chamada no handler `@update:model-value` de cada `q-input` editável,
 * em conjunto com `regrasCampo` do `validation.ts` para o feedback visual de erro.
 *
 * @param campo - Metadados do campo CNAB240.
 * @param valor - Valor bruto recebido do evento de atualização do `q-input`.
 * @returns Valor filtrado pronto para gravar no estado reativo.
 *
 * @example
 * ```ts
 * import { filtrarEntrada } from 'src/utils/field-filters';
 * import { regrasCampo }   from 'src/utils/validation';
 *
 * // Handler no componente:
 * function handleUpdate(campo: CampoLeiaute, val: string | null | number): void {
 *   estado[campo.id] = filtrarEntrada(campo, String(val ?? ''));
 * }
 *
 * // Template:
 * // <q-input
 * //   :model-value="estado[campo.id]"
 * //   :rules="regrasCampo(campo)"
 * //   @update:model-value="(val) => handleUpdate(campo, val)"
 * // />
 * ```
 */
export function filtrarEntrada(campo: CampoLeiaute, valor: string): string {
  return campo.tipo === 'Num' ? filtrarNumerico(valor) : filtrarAlfanumerico(valor);
}

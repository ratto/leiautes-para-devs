/**
 * Metadados injetados nas rotas de leiaute.
 * Lidos pelo `LeiautePlaceholderPage` e pelo `LeiauteSelector`.
 */

/** Identificadores dos leiautes suportados. */
export type LeiauteId = 'CNAB240' | 'RCB001' | 'CNAB400';

export interface LeiauteRouteMeta {
  /** Identificador único do leiaute. */
  leiauteId: LeiauteId;
  /** Rótulo legível exibido na UI. */
  label: string;
  /** Indica se o leiaute está ativo no MVP (true = funcional). */
  disponivel: boolean;
}

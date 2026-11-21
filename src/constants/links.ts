/**
 * @file constants/links.ts
 * @description Links externos canônicos do projeto.
 *
 * Fonte única de verdade das URLs externas usadas em mais de um ponto da
 * interface — hoje o `GithubLink` do header (US35) e o `AppFooter` (US33).
 *
 * @module constants/links
 */

/**
 * URL canônica do repositório do projeto no GitHub (RN05 da US35).
 *
 * @example
 * import { GITHUB_URL } from 'src/constants/links';
 * // 'https://github.com/ratto/leiautes-para-devs'
 */
export const GITHUB_URL = 'https://github.com/ratto/leiautes-para-devs' as const;

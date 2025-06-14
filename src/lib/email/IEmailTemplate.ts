/* lib/email/IEmailTemplate.ts */
export interface IEmailTemplate<Data = unknown> {
  defaultSubject: (data: Data) => string;
  html: (data: Data) => string;
  text?: (data: Data) => string; // facultatif : sera auto-généré si absent
}

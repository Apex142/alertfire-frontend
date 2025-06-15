interface ListBlockProps {
  title: string;
  /** Tableau d’IDs ou de libellés ; undefined autorisé */
  items?: string[];
  /** Classe tailwind additionnelle (optionnel) */
  className?: string;
}

export function ListBlock({ title, items, className }: ListBlockProps) {
  const list = items ?? []; // fallback tableau vide

  return (
    <div
      className={`rounded-lg border border-border bg-card p-5 ${
        className ?? ""
      }`}
    >
      <h3 className="mb-3 font-semibold">{title}</h3>

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {list.map((item) => (
            <li
              key={item}
              className="rounded bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

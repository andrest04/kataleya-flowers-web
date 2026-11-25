import type { PasswordCriterionId } from '@/features/admin/schemas/passwordPolicy';
import { HARD_TO_GUESS_LABEL, PASSWORD_CRITERIA } from '@/features/admin/schemas/passwordPolicy';

import PasswordCriterionItem from './PasswordCriterionItem';

interface PasswordCriteriaListProps {
  id: string;
  criteria: Record<PasswordCriterionId, boolean>;
  hardToGuess: boolean | null;
  passwordsMatch: boolean;
}

export default function PasswordCriteriaList({
  id,
  criteria,
  hardToGuess,
  passwordsMatch,
}: PasswordCriteriaListProps) {
  const allMet = passwordsMatch && hardToGuess !== false && Object.values(criteria).every(Boolean);

  return (
    <div className="mt-3">
      <ul id={id} aria-label="Requisitos de la contraseña" className="space-y-1">
        {PASSWORD_CRITERIA.map((criterion) => (
          <PasswordCriterionItem key={criterion.id} label={criterion.label} met={criteria[criterion.id]} />
        ))}
        {hardToGuess !== null && <PasswordCriterionItem label={HARD_TO_GUESS_LABEL} met={hardToGuess} />}
        <PasswordCriterionItem label="Las contraseñas coinciden" met={passwordsMatch} />
      </ul>
      <p role="status" className="sr-only">
        {allMet ? 'La contraseña cumple todos los requisitos.' : ''}
      </p>
    </div>
  );
}

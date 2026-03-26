import { getPasswordRequirementStatus } from '@/lib/password'
import { cn } from '@/lib/utils'

type PasswordRequirementsProps = {
  password: string
  className?: string
}

export function PasswordRequirements({
  password,
  className
}: PasswordRequirementsProps) {
  const requirements = getPasswordRequirementStatus(password)

  return (
    <div className={cn('mt-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3', className)}>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
        Securite du mot de passe
      </p>
      <ul className="mt-3 space-y-2">
        {requirements.map((requirement) => (
          <li
            key={requirement.id}
            className={cn(
              'flex items-center gap-2 text-sm transition-colors',
              requirement.met ? 'text-emerald-300' : 'text-rose-300'
            )}
          >
            <span
              className={cn(
                'inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold',
                requirement.met
                  ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-200'
                  : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
              )}
            >
              {requirement.met ? 'OK' : '...'}
            </span>
            <span>{requirement.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

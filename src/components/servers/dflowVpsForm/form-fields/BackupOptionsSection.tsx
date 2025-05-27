import { useDflowVpsForm } from '../DflowVpsFormProvider'
import { formatValue } from '../utils'
import { CheckCircle } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export const BackupOptionsSection = () => {
  const form = useFormContext()
  const { vpsPlan } = useDflowVpsForm()

  if (!vpsPlan?.backupOptions) return null

  return (
    <div className='mb-6'>
      <h2 className='mb-3 text-lg font-semibold text-foreground'>
        Data Protection with Auto Backup{' '}
        <span className='text-destructive'>*</span>
      </h2>
      <RadioGroup
        value={form.watch('backup.id')}
        onValueChange={value => {
          const selectedBackup = vpsPlan?.backupOptions?.find(
            b => b.id === value,
          )
          if (selectedBackup) {
            form.setValue(
              'backup',
              {
                id: selectedBackup.id as string,
                priceId: selectedBackup.stripePriceId || '',
              },
              { shouldValidate: true },
            )
          }
        }}
        className='flex flex-col gap-4 sm:flex-row'>
        {vpsPlan?.backupOptions?.map(backupOption => {
          const isSelected = backupOption.id === form.watch('backup.id')

          return (
            <div
              key={backupOption.id}
              className={`relative flex-1 transition-transform duration-300 ${
                isSelected ? 'scale-100' : 'scale-95'
              }`}>
              {isSelected && (
                <CheckCircle
                  className='absolute right-4 top-3 text-primary'
                  size={20}
                />
              )}
              <RadioGroupItem
                value={backupOption.id as string}
                id={`backup-${backupOption.id}`}
                className='hidden h-4 w-4'
              />
              <label
                htmlFor={`backup-${backupOption.id}`}
                className={`block h-full w-full cursor-pointer rounded-lg transition-all duration-300 ease-in-out ${
                  isSelected
                    ? 'border-2 border-primary bg-secondary/10'
                    : 'border-2 border-transparent bg-secondary/5'
                } p-4`}>
                <div className='mb-2'>
                  <span className='text-lg font-semibold text-foreground'>
                    {backupOption.label}
                  </span>
                </div>
                <div className='space-y-1 text-sm text-muted-foreground'>
                  <div>
                    <strong>Mode:</strong> {backupOption.mode}
                  </div>
                  <div>
                    <strong>Frequency:</strong> {backupOption.frequency}
                  </div>
                  <div>
                    <strong>Recovery:</strong> {backupOption.recovery}
                  </div>
                  <div>
                    <strong>Backup Retention:</strong>{' '}
                    {backupOption.retention || 'x'}
                  </div>
                </div>
                <div className='mt-2 font-bold text-primary'>
                  {backupOption.price.type === 'paid'
                    ? `${formatValue(backupOption.price.amount as number)} / month`
                    : 'Included'}
                </div>
                <div className='mt-2 text-sm text-muted-foreground'>
                  {backupOption.description}
                </div>
              </label>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}

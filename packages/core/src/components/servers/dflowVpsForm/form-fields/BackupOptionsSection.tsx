import { useDflowVpsForm } from "@core/components/servers/dflowVpsForm/DflowVpsFormProvider"
import { formatValue } from "@core/components/servers/dflowVpsForm/utils"
import { DatabaseBackup } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export const BackupOptionsSection = () => {
  const { control, setValue, watch } = useFormContext()
  const { vpsPlan } = useDflowVpsForm()

  if (!vpsPlan?.backupOptions) return null

  return (
    <div className='mb-6'>
      <h2 className='mb-3 text-lg font-semibold text-foreground'>
        Data Protection with Auto Backup{' '}
        <span className='text-destructive'>*</span>
      </h2>

      <FormField
        control={control}
        name='backup.id'
        render={({ field }) => {
          return (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={value => {
                    const selectedBackup = vpsPlan?.backupOptions?.find(
                      b => b.id === value,
                    )
                    if (selectedBackup) {
                      setValue(
                        'backup',
                        {
                          id: selectedBackup.id as string,
                          priceId: selectedBackup.stripePriceId || '',
                        },
                        { shouldValidate: true },
                      )
                    }
                  }}
                  value={field?.value}
                  className='grid sm:grid-cols-2'>
                  {vpsPlan?.backupOptions?.map(backupOption => {
                    return (
                      <FormItem key={backupOption.id}>
                        <FormControl>
                          <div
                            className={`relative flex items-start rounded-md border ${
                              field?.value === backupOption.id
                                ? 'border-2 border-primary'
                                : 'border-input'
                            } cursor-pointer p-4 transition-all duration-200 hover:border-primary/50`}>
                            <RadioGroupItem
                              value={backupOption.id ?? ''}
                              id={backupOption.id ?? ''}
                              className='order-1 after:absolute after:inset-0'
                            />

                            <div className='flex grow gap-4'>
                              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary/50'>
                                {/* <p className='text-xl'>{flagDetails?.flag}</p> */}
                                <DatabaseBackup className='size-5' />
                              </div>

                              <div>
                                <Label
                                  htmlFor={backupOption.id ?? ''}
                                  className='cursor-pointer font-medium'>
                                  {backupOption.label}
                                </Label>

                                <ul>
                                  <li className='text-muted-foreground'>
                                    <span className='text-sm font-semibold'>
                                      Mode:
                                    </span>{' '}
                                    {backupOption.mode}
                                  </li>
                                  <li className='text-muted-foreground'>
                                    <span className='text-sm font-semibold'>
                                      Frequency:
                                    </span>{' '}
                                    {backupOption.frequency}
                                  </li>
                                  <li className='text-muted-foreground'>
                                    <span className='text-sm font-semibold'>
                                      Recovery:
                                    </span>{' '}
                                    {backupOption.recovery}
                                  </li>
                                  <li className='text-muted-foreground'>
                                    <span className='text-sm font-semibold'>
                                      Backup Retention:
                                    </span>{' '}
                                    {backupOption.retention || 'x'}
                                  </li>
                                </ul>

                                <p className='font-semibold'>
                                  {backupOption.price.type === 'paid'
                                    ? `${formatValue(backupOption.price.amount as number)} / month`
                                    : 'Included'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </FormControl>
                      </FormItem>
                    )
                  })}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    </div>
  )
}

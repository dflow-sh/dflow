import { Plus, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'

import RuleForm from './RuleForm'

const OutboundRulesSection = ({
  form,
  fields,
  onAppend,
  onRemove,
  handleTypeChange,
  handleSourceTypeChange,
}: {
  form: any
  fields: any[]
  onAppend: () => void
  onRemove: (index: number) => void
  handleTypeChange: (value: any, index: number, isInbound: boolean) => void
  handleSourceTypeChange: (
    value: string,
    index: number,
    isInbound: boolean,
  ) => void
}) => {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium'>Outbound Rules</h3>
        <Button type='button' variant='outline' size='sm' onClick={onAppend}>
          <Plus className='mr-2 h-4 w-4' />
          Add Rule
        </Button>
      </div>

      {fields.length === 0 && (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <ShieldCheck className='mb-4 h-12 w-12 text-muted-foreground opacity-20' />
          <p className='text-muted-foreground'>No Outbound Rules Found</p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Add outbound rules to control traffic leaving your resources
          </p>
        </div>
      )}

      {fields.map((field, index) => (
        <RuleForm
          key={field.id}
          form={form}
          index={index}
          isInbound={false}
          onRemove={() => onRemove(index)}
          handleTypeChange={handleTypeChange}
          handleSourceTypeChange={handleSourceTypeChange}
        />
      ))}
    </div>
  )
}

export default OutboundRulesSection

import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

import PortInputs from './PortInputs'
import ProtocolInput from './ProtocolInput'
import RuleTypeSelect from './RuleTypeSelect'
import SourceDestination from './SourceDestination'

const RuleForm = ({
  form,
  index,
  isInbound,
  onRemove,
  handleTypeChange,
  handleSourceTypeChange,
}: {
  form: any
  index: number
  isInbound: boolean
  onRemove: () => void
  handleTypeChange: (value: any, index: number, isInbound: boolean) => void
  handleSourceTypeChange: (
    value: string,
    index: number,
    isInbound: boolean,
  ) => void
}) => {
  const watchRuleType = form.watch(
    isInbound ? `inboundRules.${index}.type` : `outboundRules.${index}.type`,
  )
  const watchSourceDestType = form.watch(
    isInbound
      ? `inboundRules.${index}.sourceType`
      : `outboundRules.${index}.destinationType`,
  )

  const isCustomType = ['custom-tcp', 'custom-udp', 'custom-protocol'].includes(
    watchRuleType,
  )
  const isPortEditable = isCustomType
  const isProtocolEditable = watchRuleType === 'custom-protocol'
  const hidePorts = ['all-traffic', 'icmp', 'icmpv6'].includes(watchRuleType)
  const isCustomSourceDest = watchSourceDestType === 'custom'

  return (
    <div className='space-y-4 rounded-md border p-4'>
      <div className='flex items-center justify-between'>
        <h4 className='font-medium'>
          {isInbound ? 'Inbound' : 'Outbound'} Rule {index + 1}
        </h4>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={onRemove}
          className='text-red-500 hover:text-red-600'>
          <Trash2 className='mr-1 h-4 w-4' />
          Remove
        </Button>
      </div>

      {isInbound && (
        <input
          type='hidden'
          {...form.register(`inboundRules.${index}.securityGroupRuleId`)}
        />
      )}

      <RuleTypeSelect
        form={form}
        index={index}
        isInbound={isInbound}
        handleTypeChange={handleTypeChange}
      />

      <ProtocolInput
        form={form}
        index={index}
        isInbound={isInbound}
        isProtocolEditable={isProtocolEditable}
      />

      {!hidePorts && (
        <PortInputs
          form={form}
          index={index}
          isInbound={isInbound}
          isPortEditable={isPortEditable}
        />
      )}

      <SourceDestination
        form={form}
        index={index}
        isInbound={isInbound}
        isCustomSourceDest={isCustomSourceDest}
        handleSourceTypeChange={handleSourceTypeChange}
      />

      <FormField
        control={form.control}
        name={
          isInbound
            ? `inboundRules.${index}.description`
            : `outboundRules.${index}.description`
        }
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default RuleForm

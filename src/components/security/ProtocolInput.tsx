import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const ProtocolInput = ({
  form,
  index,
  isInbound,
  isProtocolEditable,
}: {
  form: any
  index: number
  isInbound: boolean
  isProtocolEditable: boolean
}) => {
  return (
    <FormField
      control={form.control}
      name={
        isInbound
          ? `inboundRules.${index}.protocol`
          : `outboundRules.${index}.protocol`
      }
      render={({ field }) => (
        <FormItem>
          <FormLabel>Protocol</FormLabel>
          <FormControl>
            <Input
              {...field}
              disabled={!isProtocolEditable}
              value={field.value ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default ProtocolInput

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const PortInputs = ({
  form,
  index,
  isInbound,
  isPortEditable,
}: {
  form: any
  index: number
  isInbound: boolean
  isPortEditable: boolean
}) => {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <FormField
        control={form.control}
        name={
          isInbound
            ? `inboundRules.${index}.fromPort`
            : `outboundRules.${index}.fromPort`
        }
        render={({ field }) => (
          <FormItem>
            <FormLabel>Port Range (From)</FormLabel>
            <FormControl>
              <Input
                type='number'
                min={-1}
                max={65535}
                {...field}
                disabled={!isPortEditable}
                onChange={e =>
                  field.onChange(parseInt(e.target.value, 10) || 0)
                }
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={
          isInbound
            ? `inboundRules.${index}.toPort`
            : `outboundRules.${index}.toPort`
        }
        render={({ field }) => (
          <FormItem>
            <FormLabel>Port Range (To)</FormLabel>
            <FormControl>
              <Input
                type='number'
                min={-1}
                max={65535}
                {...field}
                disabled={!isPortEditable}
                onChange={e =>
                  field.onChange(parseInt(e.target.value, 10) || 0)
                }
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default PortInputs

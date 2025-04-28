import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SourceDestination = ({
  form,
  index,
  isInbound,
  isCustomSourceDest,
  handleSourceTypeChange,
}: {
  form: any
  index: number
  isInbound: boolean
  isCustomSourceDest: boolean
  handleSourceTypeChange: (
    value: string,
    index: number,
    isInbound: boolean,
  ) => void
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name={
          isInbound
            ? `inboundRules.${index}.sourceType`
            : `outboundRules.${index}.destinationType`
        }
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {isInbound ? 'Source Type' : 'Destination Type'}
            </FormLabel>
            <Select
              onValueChange={value => {
                field.onChange(value)
                handleSourceTypeChange(value, index, isInbound)
              }}
              defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={`Select ${isInbound ? 'source' : 'destination'} type`}
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value='my-ip'>My IP</SelectItem>
                <SelectItem value='anywhere-ipv4'>Anywhere-IPv4</SelectItem>
                <SelectItem value='anywhere-ipv6'>Anywhere-IPv6</SelectItem>
                <SelectItem value='custom'>Custom</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={
          isInbound
            ? `inboundRules.${index}.source`
            : `outboundRules.${index}.destination`
        }
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isInbound ? 'Source' : 'Destination'}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder='0.0.0.0/0'
                disabled={!isCustomSourceDest}
              />
            </FormControl>
            <FormDescription>
              CIDR notation (e.g., 0.0.0.0/0 for anywhere)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

export default SourceDestination

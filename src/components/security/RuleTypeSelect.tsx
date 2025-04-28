import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const RuleTypeSelect = ({
  form,
  index,
  isInbound,
  handleTypeChange,
}: {
  form: any
  index: number
  isInbound: boolean
  handleTypeChange: (value: any, index: number, isInbound: boolean) => void
}) => {
  return (
    <FormField
      control={form.control}
      name={
        isInbound ? `inboundRules.${index}.type` : `outboundRules.${index}.type`
      }
      render={({ field }) => (
        <FormItem>
          <FormLabel>Type</FormLabel>
          <Select
            onValueChange={value => {
              field.onChange(value)
              handleTypeChange(value, index, isInbound)
            }}
            defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder='Select rule type' />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value='all-traffic'>All Traffic</SelectItem>
              <SelectItem value='all-tcp'>All TCP</SelectItem>
              <SelectItem value='all-udp'>All UDP</SelectItem>
              <SelectItem value='ssh'>SSH</SelectItem>
              <SelectItem value='http'>HTTP</SelectItem>
              <SelectItem value='https'>HTTPS</SelectItem>
              <SelectItem value='custom-tcp'>Custom TCP</SelectItem>
              <SelectItem value='custom-udp'>Custom UDP</SelectItem>
              <SelectItem value='icmp'>ICMP</SelectItem>
              <SelectItem value='icmpv6'>ICMPv6</SelectItem>
              <SelectItem value='smtp'>SMTP</SelectItem>
              <SelectItem value='pop3'>POP3</SelectItem>
              <SelectItem value='imap'>IMAP</SelectItem>
              <SelectItem value='ms-sql'>MS SQL</SelectItem>
              <SelectItem value='mysql-aurora'>MySQL/Aurora</SelectItem>
              <SelectItem value='postgresql'>PostgreSQL</SelectItem>
              <SelectItem value='dns-udp'>DNS (UDP)</SelectItem>
              <SelectItem value='rdp'>RDP</SelectItem>
              <SelectItem value='nfs'>NFS</SelectItem>
              <SelectItem value='custom-protocol'>Custom Protocol</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default RuleTypeSelect

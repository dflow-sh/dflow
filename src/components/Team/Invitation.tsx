'use client'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Check, Copy } from 'lucide-react'
import { motion } from 'motion/react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { toast } from 'sonner'

import { sendInvitationLinkAction } from '@/actions/team'
import { generateInviteLink } from '@/lib/generateInvitationLink'
import { Tenant } from '@/payload-types'

enum Role {
  Admin = 'tenant-admin',
  User = 'tenant-user',
}

const Invitation = ({ tenant }: { tenant: any }) => {
  const [email, setEmail] = useState<string>('')
  const [role, setRole] = useState<Role>(Role.User)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    const lin = await generateInviteLink((tenant.tenant as Tenant).id, [role])
    setCopied(true)
    navigator.clipboard.writeText(lin).then(
      () => {},
      err => {
        console.error(err)
      },
    )
    setTimeout(() => {
      setCopied(false)
    }, 1000)
  }

  const {
    execute: sendInvitationLink,
    isPending: isSendInvitationLinkPending,
  } = useAction(sendInvitationLinkAction, {
    onSuccess: () => {
      toast.success('Email sent successfully')
    },
    onError: error => {
      toast.error('Failed to send invitation email')
    },
  })
  const handleChange = (newRole: string) => {
    if (newRole === Role.Admin || newRole === Role.User) {
      setRole(newRole as Role)
    }
  }

  const sendLink = async () => {
    const link = await generateInviteLink((tenant.tenant as Tenant).id, [role])
    sendInvitationLink({
      email,
      link,
    })
  }
  return (
    <div>
      <h3 className='mb-2 text-lg font-medium'>Invite to your workspace</h3>
      <div className='flex w-full items-start gap-x-2'>
        <Input
          onChange={e => setEmail(e.target.value)}
          className='w-full'
          type='email'
          required
          placeholder='example@gmail.com'
        />
        <div className='space-y-1'>
          <Select
            value={role}
            onValueChange={newRole => handleChange(newRole)}
            defaultValue={role}>
            <SelectTrigger className='w-64'>
              <SelectValue placeholder='select role' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='tenant-user'>Member</SelectItem>
              <SelectItem value='tenant-admin'>Admin</SelectItem>
            </SelectContent>
          </Select>
          <div>
            {copied ? (
              <motion.div
                key='check-icon'
                initial={{ opacity: 0, y: '10px' }}
                animate={{ opacity: 1, y: '0px' }}
                exit={{ opacity: 0, y: '10px' }}
                transition={{ duration: 0.2 }}>
                <p className='inline-flex items-center gap-x-2 text-sm text-primary'>
                  <Check size={16} /> Copied!
                </p>
              </motion.div>
            ) : (
              <motion.div
                key='check-copy'
                initial={{ opacity: 0, y: '-10px' }}
                animate={{ opacity: 1, y: '0px' }}
                exit={{ opacity: 0, y: '-10px' }}
                transition={{ duration: 0.2 }}>
                <p
                  className='inline-flex cursor-pointer items-center gap-x-2 text-sm text-primary'
                  onClick={() => copyToClipboard()}>
                  <Copy size={16} />
                  Copy Invitation link
                </p>
              </motion.div>
            )}
          </div>
        </div>
        {/* <Select
          value={expireTime}
          onValueChange={newRole => handleChange(newRole)}
          defaultValue={expireTime}>
          <SelectTrigger className='w-64'>
            <SelectValue placeholder='Select Link expire time' />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel>Select link expire time</SelectLabel>
            <SelectItem value='1h'>1 Hour</SelectItem>
            <SelectItem value='12h'>12 Hours</SelectItem>
            <SelectItem value='1d'>1 Day</SelectItem>
            <SelectItem value='2d'>2 Days</SelectItem>
            <SelectItem value='7d'>7 Days</SelectItem>
            <SelectItem value='14d'>14 Days</SelectItem>
            <SelectItem value='1m'>1 Month</SelectItem>
            <SelectItem value='3m'>3 Months</SelectItem>
            <SelectItem value='6m'>6 Months</SelectItem>
            <SelectItem value='1y'>1 Year</SelectItem>
          </SelectContent>
        </Select> */}
        <Button
          onClick={sendLink}
          isLoading={isSendInvitationLinkPending}
          disabled={!email || isSendInvitationLinkPending}>
          Invite
        </Button>
      </div>
    </div>
  )
}

export default Invitation

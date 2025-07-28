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

import {
  generateInviteLinkAction,
  sendInvitationLinkAction,
} from '@/actions/team'
import { Role, Tenant } from '@/payload-types'

const Invitation = ({ roles, tenant }: { roles: Role[]; tenant: any }) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string | undefined>(roles?.at(0)?.id)
  const [copied, setCopied] = useState(false)

  const {
    execute: sendInvitationLink,
    isPending: isSendInvitationLinkPending,
  } = useAction(sendInvitationLinkAction, {
    onSuccess: () => {
      toast.success('Email sent successfully')
    },
    onError: ({ error }) => {
      toast.error(`Failed to send invitation email ${error?.serverError}`)
    },
  })

  const { execute: generateInvitationLink } = useAction(
    generateInviteLinkAction,
    {
      onSuccess: ({ data }) => {
        setCopied(true)
        navigator.clipboard.writeText(data?.inviteLink!).then(
          () => {},
          err => {
            console.error(err)
          },
        )
        setTimeout(() => {
          setCopied(false)
        }, 1000)
      },
      onError: ({ error }) => {
        toast.error(`Failed to generate invitation link ${error?.serverError}`)
      },
    },
  )

  const {
    execute: generateInvitationLinkAndSendEmail,
    isPending: isGenerateInvitationLinkAndSendEmailPending,
  } = useAction(generateInviteLinkAction, {
    onSuccess: ({ data, input }) => {
      console.log({ input, data, email })
      sendInvitationLink({
        email: input?.email!,
        link: data?.inviteLink!,
      })
    },
    onError: ({ error }) => {
      toast.error(`Failed to generate invitation link ${error?.serverError}`)
    },
  })

  const copyToClipboard = () => {
    generateInvitationLink({
      role: role!,
      tenantId: (tenant.tenant as Tenant).id,
    })
  }

  const handleChange = (newRole: string) => {
    setRole(newRole)
  }

  const sendLink = async () => {
    generateInvitationLinkAndSendEmail({
      role: role!,
      tenantId: (tenant.tenant as Tenant).id,
      email: email,
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
              {roles?.map(role => (
                <SelectItem key={role?.id} value={role?.id}>
                  {role?.name}
                </SelectItem>
              ))}
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
        <Button
          onClick={sendLink}
          isLoading={
            isSendInvitationLinkPending ||
            isGenerateInvitationLinkAndSendEmailPending
          }
          disabled={
            !email ||
            isSendInvitationLinkPending ||
            isGenerateInvitationLinkAndSendEmailPending
          }>
          Invite
        </Button>
      </div>
    </div>
  )
}

export default Invitation

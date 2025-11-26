import { buttonVariants } from "@core/components/ui/button"
import {
  AlertTriangle,
  Database,
  Globe,
  Loader2,
  MessageSquare,
  Package,
  Shield,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'

import { Alert, AlertDescription } from "@core/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@core/components/ui/alert-dialog"
import { Badge } from "@core/components/ui/badge"
import { cn } from "@core/lib/utils"

interface PluginUsageDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  pluginName: string
  category: string
  usageData: {
    inUse: boolean
    services: any[]
  } | null
  isLoading: boolean
  organisationSlug: string
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'database':
      return Database
    case 'messageQueue':
      return MessageSquare
    case 'domain':
      return Globe
    default:
      return Package
  }
}

const getPluginMessage = (
  pluginName: string,
  category: string,
  inUse: boolean,
  services: any[],
) => {
  if (pluginName === 'letsencrypt') {
    if (inUse) {
      return {
        title: 'SSL Certificate Plugin In Active Use',
        description:
          "The Let's Encrypt plugin is currently active and managing SSL certificates for your SSH setup. You must disable SSL certificate management before uninstalling this plugin to prevent HTTPS connectivity issues.",
        canUninstall: false,
        variant: 'destructive' as const,
        severity: 'high' as const,
      }
    } else {
      return {
        title: "Confirm Let's Encrypt Uninstall",
        description: `Are you sure you want to uninstall the Let's Encrypt plugin? You can reinstall it later if you need SSL certificate management.`,
        canUninstall: true,
        variant: 'default' as const,
        severity: 'medium' as const,
      }
    }
  }

  if (!inUse) {
    return {
      title: 'Confirm Plugin Uninstall',
      description: `Are you sure you want to uninstall the ${pluginName} plugin? You can reinstall it later if needed.`,
      canUninstall: true,
      variant: 'default' as const,
      severity: 'medium' as const,
    }
  }

  switch (category) {
    case 'database':
      return {
        title: 'Database Plugin In Active Use',
        description: `The ${pluginName} database plugin is currently being used by ${services.length} service${services.length > 1 ? 's' : ''}. You must delete these services before uninstalling to prevent data loss and service disruptions.`,
        canUninstall: false,
        variant: 'destructive' as const,
        severity: 'high' as const,
      }
    case 'messageQueue':
      return {
        title: 'Message Queue Plugin In Active Use',
        description: `The ${pluginName} message queue plugin is currently processing messages for your applications. Uninstalling will disrupt message handling and may cause data loss.`,
        canUninstall: false,
        variant: 'destructive' as const,
        severity: 'high' as const,
      }
    case 'domain':
      return {
        title: 'Domain Plugin In Active Use',
        description: `The ${pluginName} domain plugin is currently managing domains and SSL certificates. Uninstalling may cause websites to become inaccessible.`,
        canUninstall: false,
        variant: 'destructive' as const,
        severity: 'high' as const,
      }
    default:
      return {
        title: 'Plugin Currently In Use',
        description: `The ${pluginName} plugin has active dependencies. Please review and resolve all dependencies before proceeding with uninstallation.`,
        canUninstall: false,
        variant: 'destructive' as const,
        severity: 'medium' as const,
      }
  }
}

export const PluginUninstallDialog: React.FC<PluginUsageDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pluginName,
  category,
  usageData,
  isLoading,
  organisationSlug,
}) => {
  if (!usageData) return null

  const { inUse, services } = usageData
  const message = getPluginMessage(pluginName, category, inUse, services)
  const CategoryIcon = getCategoryIcon(category)

  const getSeverityIcon = () => {
    if (inUse) return AlertTriangle
    return Trash2
  }

  const SeverityIcon = getSeverityIcon()

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className='max-w-2xl'>
        <AlertDialogHeader className='space-y-4'>
          <div className='flex items-start gap-4'>
            <div className='bg-muted rounded-full p-3'>
              <SeverityIcon className='h-4 w-4' />
            </div>
            <div className='flex-1 space-y-2'>
              <AlertDialogTitle className='flex items-center gap-2 text-xl font-semibold'>
                {message.title}
                <Badge
                  variant='outline'
                  className='ml-2 flex items-center gap-1'>
                  <CategoryIcon className='h-3 w-3' />
                  {category}
                </Badge>
              </AlertDialogTitle>
              <AlertDialogDescription className='text-muted-foreground text-sm'>
                {message.description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Show dependent services section if there are actual services */}
        {inUse && services.length > 0 && (
          <div className='space-y-4'>
            <Alert variant={message.variant} className='border-l-4'>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-semibold'>
                      {services.length} Dependent Service
                      {services.length > 1 ? 's' : ''}
                    </p>
                    <Badge variant='secondary'>Action Required</Badge>
                  </div>
                  <div className='space-y-2'>
                    {services.map((service, index) => (
                      <div key={index} className='rounded border p-3'>
                        <Link
                          href={`/${organisationSlug}/dashboard/project/${service.project?.id}/service/${service.id}`}
                          className='text-sm font-medium hover:underline'>
                          {service.name || service.id}
                        </Link>
                        {service.project?.name && (
                          <p className='text-muted-foreground mt-1 text-xs'>
                            Project: {service.project.name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className='bg-muted/50 rounded border border-dashed p-4'>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <Shield className='h-4 w-4' />
                <span className='font-medium'>Next Steps:</span>
              </div>
              <p className='text-muted-foreground mt-1 text-sm'>
                Delete the dependent services listed above, then try
                uninstalling again.
              </p>
            </div>
          </div>
        )}

        {/* Show warning for letsencrypt when in use (SSH connection) but no specific services */}
        {pluginName === 'letsencrypt' && inUse && services.length === 0 && (
          <div className='space-y-4'>
            <Alert variant='destructive' className='border-l-4'>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>
                <div className='space-y-2'>
                  <p className='text-sm font-semibold'>
                    SSL Certificate Management Active
                  </p>
                  <p className='text-sm'>
                    This plugin is actively managing SSL certificates for your
                    SSH connection setup. Uninstalling is blocked to prevent
                    certificate renewal failures and HTTPS issues.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className='bg-muted/50 rounded border border-dashed p-4'>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <Shield className='h-4 w-4' />
                <span className='font-medium'>Required Action:</span>
              </div>
              <p className='text-muted-foreground mt-1 text-sm'>
                Disable SSL certificate management in your server settings
                before attempting to uninstall this plugin.
              </p>
            </div>
          </div>
        )}

        <AlertDialogFooter className='gap-2'>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={!message.canUninstall || isLoading}
            className={cn(
              message.variant === 'destructive' && message.canUninstall
                ? buttonVariants({ variant: 'destructive' })
                : buttonVariants({ variant: 'default' }),
            )}>
            {isLoading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Uninstalling...
              </>
            ) : (
              <>
                <Trash2 className='h-4 w-4' />
                Uninstall Plugin
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

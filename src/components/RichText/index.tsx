import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/utilities/ui'

type Props = {
  content: string
  className?: string
  enableProse?: boolean
} & Omit<React.ComponentProps<typeof ReactMarkdown>, 'children'>

export default function RichText({ content, className, enableProse = true, ...rest }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        div: ({ className: divClassName, ...divProps }) => (
          <div
            className={cn(
              'markdown',
              {
                'mx-auto prose md:prose-md dark:prose-invert': enableProse,
              },
              className,
              divClassName,
            )}
            {...divProps}
          />
        ),
      }}
      {...rest}
    >
      {content}
    </ReactMarkdown>
  )
} 
import OrderConfirmationTemplate from '@/app/(shared)/order-confirmation-template'

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId: string }>
}) {
  const { orderId } = await searchParams
  return <OrderConfirmationTemplate orderId={orderId} />
}

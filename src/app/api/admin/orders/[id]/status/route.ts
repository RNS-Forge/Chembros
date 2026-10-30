import { PATCH as handleStatusUpdate } from '@/app/api/orders/[id]/status/route'

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  return handleStatusUpdate(req, context)
}

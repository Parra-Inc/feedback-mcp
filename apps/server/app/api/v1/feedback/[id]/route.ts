import { verifyAdminRequest } from "@/lib/auth/admin";
import { deleteFeedbackById, getFeedbackById } from "@/lib/feedback/query";

export const dynamic = "force-dynamic";

// GET /api/v1/feedback/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAdminRequest(request);
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const feedback = await getFeedbackById(id);
  if (!feedback) {
    return Response.json({ error: `No feedback found with id "${id}"` }, { status: 404 });
  }
  return Response.json({ feedback });
}

// DELETE /api/v1/feedback/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyAdminRequest(request);
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const deleted = await deleteFeedbackById(id);
  if (!deleted) {
    return Response.json({ error: `No feedback found with id "${id}"` }, { status: 404 });
  }
  return Response.json({ deleted: true, id });
}

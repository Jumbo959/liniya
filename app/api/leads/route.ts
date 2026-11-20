import { createLead } from "@/lib/actions";
import type { LeadType } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    email?: string;
    type?: LeadType;
    apartmentId?: string;
    message?: string;
    time?: string;
    company?: string;
  };
  const result = await createLead({
    name: body.name || "",
    phone: body.phone || "",
    email: body.email || "",
    type: body.type || "consult",
    apartmentId: body.apartmentId || "",
    message: body.message || "",
    time: body.time || "",
    company: body.company,
  });
  return Response.json(result, { status: result.ok ? 200 : 400 });
}

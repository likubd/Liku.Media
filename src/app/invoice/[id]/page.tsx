import { Metadata } from "next";
import { getInvoiceByIdOrNumber } from "@/lib/invoice-server";
import { InvoiceClientView } from "./invoice-client-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const invoiceId = params?.id ? decodeURIComponent(params.id) : "";
  const invoice = await getInvoiceByIdOrNumber(invoiceId);

  if (invoice) {
    return {
      title: `Invoice #${invoice.invoiceNumber} - ${invoice.client.name || "Client"} | Liku Media`,
      description: `Official Invoice #${invoice.invoiceNumber} from Liku Media for ${invoice.client.name || "Client"}.`,
    };
  }

  return {
    title: "Official Invoice | Liku Media",
    description: "Official service invoice from Liku Media.",
  };
}

export default async function PublicInvoicePage({ params }: PageProps) {
  const invoiceId = params?.id ? decodeURIComponent(params.id) : "";
  const invoice = await getInvoiceByIdOrNumber(invoiceId);

  return (
    <InvoiceClientView
      initialInvoice={invoice}
      invoiceId={invoiceId}
    />
  );
}

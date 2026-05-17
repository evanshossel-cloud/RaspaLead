import { PageHeader } from "@/components/shared/page-header";
import { CreateLeadSearchForm } from "@/features/searches/components/create-lead-search-form";

export default function NewSearchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RaspaLead // Nova operacao"
        title="Nova busca"
        description="Configure a busca, defina o contexto comercial e acompanhe o processamento em background pela tela de operacao."
      />

      <CreateLeadSearchForm />
    </div>
  );
}

export type AppInngestEvents = {
  "lead-search.created": {
    data: {
      search_id: string;
      workspace_id: string;
      user_id: string;
    };
  };
  "lead.enrichment.requested": {
    data: {
      lead_id: string;
      workspace_id: string;
      user_id: string;
    };
  };
  "lead.ai-message.requested": {
    data: {
      lead_id: string;
      workspace_id: string;
      user_id: string;
    };
  };
};

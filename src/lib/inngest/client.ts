import { EventSchemas, Inngest } from "inngest";
import type { AppInngestEvents } from "./events";

export const inngest = new Inngest({
  id: "xgryd-leads",
  name: "XGryd Leads",
  schemas: new EventSchemas().fromRecord<AppInngestEvents>(),
});

import { HMPPS_AUTH_ROLE } from "../../../../middleware/authorisationMiddleware";

export type HmppsAuthUser = {
  name: string;
  email: string;
  displayName: string;
  token: string;
  username: string;
  authSource: string;
  roles: HMPPS_AUTH_ROLE[];
  hasSpoRole: boolean;
  hasPpcsRole: boolean;
  hasOdmRole: boolean;
}

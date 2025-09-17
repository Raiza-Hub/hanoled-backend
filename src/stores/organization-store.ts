import { create } from "zustand";
import type { Organization } from "../db/schema";

interface CurrentOrgActions {
  setCurrentOrg: (org: Organization) => void;
}

interface OrganizationState {
  currentOrg: Organization | null;
  action: CurrentOrgActions;
}

export const useOrganizationStore = create<OrganizationState>()((set) => ({
  currentOrg: null,
  action: {
    setCurrentOrg: (org) => set({ currentOrg: org }),
  },
}));

export const useCurrentOrganization = () =>
  useOrganizationStore((state) => state.currentOrg);

export const useCurrentOrgActions = () =>
  useOrganizationStore((state) => state.action);

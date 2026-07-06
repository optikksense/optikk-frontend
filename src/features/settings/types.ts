/** Lightweight tenant summary shown in the settings tenant tab. */
export interface SettingsTenantViewModel {
  readonly name?: string | null;
  readonly apiKey?: string | null;
  readonly role?: string | null;
}

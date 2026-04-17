import { Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../../supabase/supabase.constants";
import { UpdateBrandingDto } from "../dto/update-branding.dto";

@Injectable()
export class InstitutionBrandingService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async updateInstitutionBranding(institutionId: string, brandingDto: UpdateBrandingDto): Promise<void> {
    const { data: institution, error: fetchError } = await this.supabaseAdminClient
      .from("institutions")
      .select("branding")
      .eq("id", institutionId)
      .single();

    if (fetchError || !institution) {
      throw new NotFoundException("Institution not found.");
    }

    const currentBranding = institution.branding ?? {};
    
    // Create new branding object, preserving status_history
    const newBranding = {
      ...currentBranding,
      colors: brandingDto.colors ?? currentBranding.colors,
      logoUrl: brandingDto.logoUrl !== undefined ? brandingDto.logoUrl : currentBranding.logoUrl
    };

    const { error: updateError } = await this.supabaseAdminClient
      .from("institutions")
      .update({ branding: newBranding })
      .eq("id", institutionId);

    if (updateError) {
      throw new InternalServerErrorException("Failed to update branding settings.");
    }
  }
}

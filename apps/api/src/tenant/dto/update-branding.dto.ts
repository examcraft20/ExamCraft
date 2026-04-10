import {
  IsOptional,
  IsString,
  IsObject,
  IsUrl,
  Matches,
} from "class-validator";

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const ALLOWED_LOGO_EXTENSIONS = ".png,.jpg,.jpeg,.svg,.webp";

export class UpdateBrandingDto {
  @IsOptional()
  @IsUrl(
    { protocols: ["https"], require_tld: true },
    {
      message: "Logo must be a valid HTTPS URL",
    },
  )
  @Matches(new RegExp(`\\.(${ALLOWED_LOGO_EXTENSIONS.replace(/,/g, "|")})$`), {
    message: "Logo must end in png, jpg, jpeg, svg, or webp",
  })
  logoUrl?: string;

  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: "Primary color must be a valid hex color (#RGB or #RRGGBB)",
  })
  primaryColor?: string;

  @IsOptional()
  @Matches(HEX_COLOR_REGEX, {
    message: "Secondary color must be a valid hex color (#RGB or #RRGGBB)",
  })
  secondaryColor?: string;

  @IsOptional()
  @IsObject()
  customSettings?: Record<string, unknown>;
}

export type FormFiledType = {
    name: string;
    required: boolean;
};

export type OptionType = {
    label: string;
    value: string;
    translateKey?: string;
};

export type TokenClaimsType =
    | {
          extension_SubscriberId?: string;
          extension_Products?: { id: string }[];
          sub: string;
          emails: string[];
          name?: string;
          city?: string;
          country?: string;
          postalCode?: string;
          streetAddress?: string;
      }
    | undefined;

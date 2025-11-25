/**
 * Maximum field lengths (from C# StringLength attributes)
 */
export const FieldLimits = {
  Company: {
    Name: 100,
    MailingName: 100,
    Street1: 50,
    Street2: 50,
    City: 30,
    State: 2,
    Zip: 50,
    Phone: 20,
    Fax: 20,
  },
  ValSection: {
    SectionText: 100,
    DefaultColType: 10,
  },
  ValDetail: {
    ItemType: 20,
    ItemText: 3000,
  },
  ValSubItem: {
    ColValue: 200,
    ColType: 10,
  },
} as const;

/**
 * Default values for creating new entities
 */
export const Defaults = {
  Company: {
    state: '',
    zip: '',
  },
  ValSection: {
    displayOrder: 0,
    autoIndent: false,
  },
} as const;

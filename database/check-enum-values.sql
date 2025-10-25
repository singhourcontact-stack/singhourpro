-- Check what enum values are valid for the type column in services table
SELECT unnest(enum_range(NULL::type_service)) as valid_values;

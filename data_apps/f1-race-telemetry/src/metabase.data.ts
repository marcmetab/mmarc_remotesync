const models = { } as const;

const tables = {
  // Database: Hack2026_Bob
  // Schema: default
  // Table: ast_catalog
  astCatalog: {
    type: "table",
    id: 399,
    name: "Ast Catalog",
    fields: {
      // Display name: A Au
      aAu: {
        type: "column",
        name: "a_au",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3126,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: Abs Magnitude H
      absMagnitudeH: {
        type: "column",
        name: "abs_magnitude_h",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3133,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: Ad Au
      adAu: {
        type: "column",
        name: "ad_au",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3130,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: Albedo
      albedo: {
        type: "column",
        name: "albedo",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3135,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: Condition Code
      conditionCode: {
        type: "column",
        name: "condition_code",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3141,
        tableId: 399,
        baseType: "type/Integer"
      },
      // Display name: Designation Year
      designationYear: {
        type: "column",
        name: "designation_year",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3139,
        tableId: 399,
        baseType: "type/Integer"
      },
      // Display name: Diameter Km
      diameterKm: {
        type: "column",
        name: "diameter_km",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3134,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: E
      e: {
        type: "column",
        name: "e",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3127,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: Epoch Jd
      epochJd: {
        type: "column",
        name: "epoch_jd",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3537,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: First Obs
      firstObs: {
        type: "column",
        name: "first_obs",
        sourceName: "ast_catalog",
        jsType: "Date",
        fieldId: 3136,
        tableId: 399,
        baseType: "type/Date"
      },
      // Display name: First Obs Year
      firstObsYear: {
        type: "column",
        name: "first_obs_year",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3138,
        tableId: 399,
        baseType: "type/Integer"
      },
      // Display name: Full Name
      // Semantic type: type/Name
      fullName: {
        type: "column",
        name: "full_name",
        sourceName: "ast_catalog",
        jsType: "string",
        fieldId: 3118,
        tableId: 399,
        baseType: "type/Text"
      },
      // Display name: I Deg
      iDeg: {
        type: "column",
        name: "i_deg",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3128,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: Is Neo
      isNeo: {
        type: "column",
        name: "is_neo",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3123,
        tableId: 399,
        baseType: "type/Integer"
      },
      // Display name: Is Numbered
      // Semantic type: type/Quantity
      isNumbered: {
        type: "column",
        name: "is_numbered",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3122,
        tableId: 399,
        baseType: "type/Integer"
      },
      // Display name: Is Pha
      isPha: {
        type: "column",
        name: "is_pha",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3124,
        tableId: 399,
        baseType: "type/Integer"
      },
      // Display name: Kind
      // Semantic type: type/Category
      kind: {
        type: "column",
        name: "kind",
        sourceName: "ast_catalog",
        jsType: "string",
        fieldId: 3121,
        tableId: 399,
        baseType: "type/Text"
      },
      // Display name: Last Obs
      lastObs: {
        type: "column",
        name: "last_obs",
        sourceName: "ast_catalog",
        jsType: "Date",
        fieldId: 3137,
        tableId: 399,
        baseType: "type/Date"
      },
      // Display name: Mean Anomaly Deg
      meanAnomalyDeg: {
        type: "column",
        name: "mean_anomaly_deg",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3540,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: Mean Motion Deg Day
      meanMotionDegDay: {
        type: "column",
        name: "mean_motion_deg_day",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3541,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: Moid Au
      moidAu: {
        type: "column",
        name: "moid_au",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3132,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: N Obs Used
      nObsUsed: {
        type: "column",
        name: "n_obs_used",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3140,
        tableId: 399,
        baseType: "type/Integer"
      },
      // Display name: Name
      name: {
        type: "column",
        name: "name",
        sourceName: "ast_catalog",
        jsType: "string",
        fieldId: 3120,
        tableId: 399,
        baseType: "type/Text"
      },
      // Display name: Node Deg
      nodeDeg: {
        type: "column",
        name: "node_deg",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3538,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: Orbit Class
      // Semantic type: type/PK
      orbitClass: {
        type: "column",
        name: "orbit_class",
        sourceName: "ast_catalog",
        jsType: "string",
        fieldId: 3125,
        tableId: 399,
        baseType: "type/Text"
      },
      // Display name: Pdes
      pdes: {
        type: "column",
        name: "pdes",
        sourceName: "ast_catalog",
        jsType: "string",
        fieldId: 3119,
        tableId: 399,
        baseType: "type/Text"
      },
      // Display name: Peri Deg
      periDeg: {
        type: "column",
        name: "peri_deg",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3539,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: Period Years
      periodYears: {
        type: "column",
        name: "period_years",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3131,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: Q Au
      qAu: {
        type: "column",
        name: "q_au",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3129,
        tableId: 399,
        baseType: "type/Float"
      },
      // Display name: Refreshed At
      refreshedAt: {
        type: "column",
        name: "refreshed_at",
        sourceName: "ast_catalog",
        jsType: "Date",
        fieldId: 3142,
        tableId: 399,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Spkid
      // Semantic type: type/PK
      spkid: {
        type: "column",
        name: "spkid",
        sourceName: "ast_catalog",
        jsType: "number",
        fieldId: 3117,
        tableId: 399,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: default
  // Table: ast_catalog_mv
  astCatalogMv: {
    type: "table",
    id: 400,
    name: "Ast Catalog Mv",
    fields: {
      // Display name: A Au
      aAu: {
        type: "column",
        name: "a_au",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3152,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: Abs Magnitude H
      absMagnitudeH: {
        type: "column",
        name: "abs_magnitude_h",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3159,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: Ad Au
      adAu: {
        type: "column",
        name: "ad_au",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3156,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: Albedo
      albedo: {
        type: "column",
        name: "albedo",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3161,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: Condition Code
      conditionCode: {
        type: "column",
        name: "condition_code",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3167,
        tableId: 400,
        baseType: "type/Integer"
      },
      // Display name: Designation Year
      designationYear: {
        type: "column",
        name: "designation_year",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3165,
        tableId: 400,
        baseType: "type/Integer"
      },
      // Display name: Diameter Km
      diameterKm: {
        type: "column",
        name: "diameter_km",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3160,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: E
      e: {
        type: "column",
        name: "e",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3153,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: Epoch Jd
      epochJd: {
        type: "column",
        name: "epoch_jd",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3542,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: First Obs
      firstObs: {
        type: "column",
        name: "first_obs",
        sourceName: "ast_catalog_mv",
        jsType: "Date",
        fieldId: 3162,
        tableId: 400,
        baseType: "type/Date"
      },
      // Display name: First Obs Year
      firstObsYear: {
        type: "column",
        name: "first_obs_year",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3164,
        tableId: 400,
        baseType: "type/Integer"
      },
      // Display name: Full Name
      // Semantic type: type/Name
      fullName: {
        type: "column",
        name: "full_name",
        sourceName: "ast_catalog_mv",
        jsType: "string",
        fieldId: 3144,
        tableId: 400,
        baseType: "type/Text"
      },
      // Display name: I Deg
      iDeg: {
        type: "column",
        name: "i_deg",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3154,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: Is Neo
      isNeo: {
        type: "column",
        name: "is_neo",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3149,
        tableId: 400,
        baseType: "type/Integer"
      },
      // Display name: Is Numbered
      // Semantic type: type/Quantity
      isNumbered: {
        type: "column",
        name: "is_numbered",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3148,
        tableId: 400,
        baseType: "type/Integer"
      },
      // Display name: Is Pha
      isPha: {
        type: "column",
        name: "is_pha",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3150,
        tableId: 400,
        baseType: "type/Integer"
      },
      // Display name: Kind
      // Semantic type: type/Category
      kind: {
        type: "column",
        name: "kind",
        sourceName: "ast_catalog_mv",
        jsType: "string",
        fieldId: 3147,
        tableId: 400,
        baseType: "type/Text"
      },
      // Display name: Last Obs
      lastObs: {
        type: "column",
        name: "last_obs",
        sourceName: "ast_catalog_mv",
        jsType: "Date",
        fieldId: 3163,
        tableId: 400,
        baseType: "type/Date"
      },
      // Display name: Mean Anomaly Deg
      meanAnomalyDeg: {
        type: "column",
        name: "mean_anomaly_deg",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3545,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: Mean Motion Deg Day
      meanMotionDegDay: {
        type: "column",
        name: "mean_motion_deg_day",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3546,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: Moid Au
      moidAu: {
        type: "column",
        name: "moid_au",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3158,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: N Obs Used
      nObsUsed: {
        type: "column",
        name: "n_obs_used",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3166,
        tableId: 400,
        baseType: "type/Integer"
      },
      // Display name: Name
      name: {
        type: "column",
        name: "name",
        sourceName: "ast_catalog_mv",
        jsType: "string",
        fieldId: 3146,
        tableId: 400,
        baseType: "type/Text"
      },
      // Display name: Node Deg
      nodeDeg: {
        type: "column",
        name: "node_deg",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3543,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: Orbit Class
      // Semantic type: type/Category
      orbitClass: {
        type: "column",
        name: "orbit_class",
        sourceName: "ast_catalog_mv",
        jsType: "string",
        fieldId: 3151,
        tableId: 400,
        baseType: "type/Text"
      },
      // Display name: Pdes
      pdes: {
        type: "column",
        name: "pdes",
        sourceName: "ast_catalog_mv",
        jsType: "string",
        fieldId: 3145,
        tableId: 400,
        baseType: "type/Text"
      },
      // Display name: Peri Deg
      periDeg: {
        type: "column",
        name: "peri_deg",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3544,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: Period Years
      periodYears: {
        type: "column",
        name: "period_years",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3157,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: Q Au
      qAu: {
        type: "column",
        name: "q_au",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3155,
        tableId: 400,
        baseType: "type/Float"
      },
      // Display name: Refreshed At
      refreshedAt: {
        type: "column",
        name: "refreshed_at",
        sourceName: "ast_catalog_mv",
        jsType: "Date",
        fieldId: 3168,
        tableId: 400,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Spkid
      spkid: {
        type: "column",
        name: "spkid",
        sourceName: "ast_catalog_mv",
        jsType: "number",
        fieldId: 3143,
        tableId: 400,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: default
  // Table: ast_close_approaches
  astCloseApproaches: {
    type: "table",
    id: 401,
    name: "Ast Close Approaches",
    fields: {
      // Display name: Abs Magnitude H
      absMagnitudeH: {
        type: "column",
        name: "abs_magnitude_h",
        sourceName: "ast_close_approaches",
        jsType: "number",
        fieldId: 3181,
        tableId: 401,
        baseType: "type/Float"
      },
      // Display name: Approach At
      // Semantic type: type/PK
      approachAt: {
        type: "column",
        name: "approach_at",
        sourceName: "ast_close_approaches",
        jsType: "Date",
        fieldId: 3172,
        tableId: 401,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Des
      des: {
        type: "column",
        name: "des",
        sourceName: "ast_close_approaches",
        jsType: "string",
        fieldId: 3169,
        tableId: 401,
        baseType: "type/Text"
      },
      // Display name: Diameter Km
      diameterKm: {
        type: "column",
        name: "diameter_km",
        sourceName: "ast_close_approaches",
        jsType: "number",
        fieldId: 3182,
        tableId: 401,
        baseType: "type/Float"
      },
      // Display name: Dist Au
      distAu: {
        type: "column",
        name: "dist_au",
        sourceName: "ast_close_approaches",
        jsType: "number",
        fieldId: 3173,
        tableId: 401,
        baseType: "type/Float"
      },
      // Display name: Dist Km
      distKm: {
        type: "column",
        name: "dist_km",
        sourceName: "ast_close_approaches",
        jsType: "number",
        fieldId: 3177,
        tableId: 401,
        baseType: "type/Float"
      },
      // Display name: Dist Lunar
      distLunar: {
        type: "column",
        name: "dist_lunar",
        sourceName: "ast_close_approaches",
        jsType: "number",
        fieldId: 3176,
        tableId: 401,
        baseType: "type/Float"
      },
      // Display name: Dist Max Au
      distMaxAu: {
        type: "column",
        name: "dist_max_au",
        sourceName: "ast_close_approaches",
        jsType: "number",
        fieldId: 3175,
        tableId: 401,
        baseType: "type/Float"
      },
      // Display name: Dist Min Au
      distMinAu: {
        type: "column",
        name: "dist_min_au",
        sourceName: "ast_close_approaches",
        jsType: "number",
        fieldId: 3174,
        tableId: 401,
        baseType: "type/Float"
      },
      // Display name: Fullname
      // Semantic type: type/Name
      fullname: {
        type: "column",
        name: "fullname",
        sourceName: "ast_close_approaches",
        jsType: "string",
        fieldId: 3170,
        tableId: 401,
        baseType: "type/Text"
      },
      // Display name: Orbit ID
      orbitId: {
        type: "column",
        name: "orbit_id",
        sourceName: "ast_close_approaches",
        jsType: "string",
        fieldId: 3171,
        tableId: 401,
        baseType: "type/Text"
      },
      // Display name: Refreshed At
      refreshedAt: {
        type: "column",
        name: "refreshed_at",
        sourceName: "ast_close_approaches",
        jsType: "Date",
        fieldId: 3183,
        tableId: 401,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Time Uncertainty
      timeUncertainty: {
        type: "column",
        name: "time_uncertainty",
        sourceName: "ast_close_approaches",
        jsType: "string",
        fieldId: 3180,
        tableId: 401,
        baseType: "type/Text"
      },
      // Display name: V Inf Kms
      vInfKms: {
        type: "column",
        name: "v_inf_kms",
        sourceName: "ast_close_approaches",
        jsType: "number",
        fieldId: 3179,
        tableId: 401,
        baseType: "type/Float"
      },
      // Display name: V Rel Kms
      vRelKms: {
        type: "column",
        name: "v_rel_kms",
        sourceName: "ast_close_approaches",
        jsType: "number",
        fieldId: 3178,
        tableId: 401,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: default
  // Table: ast_close_approaches_mv
  astCloseApproachesMv: {
    type: "table",
    id: 402,
    name: "Ast Close Approaches Mv",
    fields: {
      // Display name: Abs Magnitude H
      absMagnitudeH: {
        type: "column",
        name: "abs_magnitude_h",
        sourceName: "ast_close_approaches_mv",
        jsType: "number",
        fieldId: 3196,
        tableId: 402,
        baseType: "type/Float"
      },
      // Display name: Approach At
      approachAt: {
        type: "column",
        name: "approach_at",
        sourceName: "ast_close_approaches_mv",
        jsType: "Date",
        fieldId: 3187,
        tableId: 402,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Des
      des: {
        type: "column",
        name: "des",
        sourceName: "ast_close_approaches_mv",
        jsType: "string",
        fieldId: 3184,
        tableId: 402,
        baseType: "type/Text"
      },
      // Display name: Diameter Km
      diameterKm: {
        type: "column",
        name: "diameter_km",
        sourceName: "ast_close_approaches_mv",
        jsType: "number",
        fieldId: 3197,
        tableId: 402,
        baseType: "type/Float"
      },
      // Display name: Dist Au
      distAu: {
        type: "column",
        name: "dist_au",
        sourceName: "ast_close_approaches_mv",
        jsType: "number",
        fieldId: 3188,
        tableId: 402,
        baseType: "type/Float"
      },
      // Display name: Dist Km
      distKm: {
        type: "column",
        name: "dist_km",
        sourceName: "ast_close_approaches_mv",
        jsType: "number",
        fieldId: 3192,
        tableId: 402,
        baseType: "type/Float"
      },
      // Display name: Dist Lunar
      distLunar: {
        type: "column",
        name: "dist_lunar",
        sourceName: "ast_close_approaches_mv",
        jsType: "number",
        fieldId: 3191,
        tableId: 402,
        baseType: "type/Float"
      },
      // Display name: Dist Max Au
      distMaxAu: {
        type: "column",
        name: "dist_max_au",
        sourceName: "ast_close_approaches_mv",
        jsType: "number",
        fieldId: 3190,
        tableId: 402,
        baseType: "type/Float"
      },
      // Display name: Dist Min Au
      distMinAu: {
        type: "column",
        name: "dist_min_au",
        sourceName: "ast_close_approaches_mv",
        jsType: "number",
        fieldId: 3189,
        tableId: 402,
        baseType: "type/Float"
      },
      // Display name: Fullname
      // Semantic type: type/Name
      fullname: {
        type: "column",
        name: "fullname",
        sourceName: "ast_close_approaches_mv",
        jsType: "string",
        fieldId: 3185,
        tableId: 402,
        baseType: "type/Text"
      },
      // Display name: Orbit ID
      orbitId: {
        type: "column",
        name: "orbit_id",
        sourceName: "ast_close_approaches_mv",
        jsType: "string",
        fieldId: 3186,
        tableId: 402,
        baseType: "type/Text"
      },
      // Display name: Refreshed At
      refreshedAt: {
        type: "column",
        name: "refreshed_at",
        sourceName: "ast_close_approaches_mv",
        jsType: "Date",
        fieldId: 3198,
        tableId: 402,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Time Uncertainty
      timeUncertainty: {
        type: "column",
        name: "time_uncertainty",
        sourceName: "ast_close_approaches_mv",
        jsType: "string",
        fieldId: 3195,
        tableId: 402,
        baseType: "type/Text"
      },
      // Display name: V Inf Kms
      vInfKms: {
        type: "column",
        name: "v_inf_kms",
        sourceName: "ast_close_approaches_mv",
        jsType: "number",
        fieldId: 3194,
        tableId: 402,
        baseType: "type/Float"
      },
      // Display name: V Rel Kms
      vRelKms: {
        type: "column",
        name: "v_rel_kms",
        sourceName: "ast_close_approaches_mv",
        jsType: "number",
        fieldId: 3193,
        tableId: 402,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: default
  // Table: ast_neo_orbits
  astNeoOrbits: {
    type: "table",
    id: 432,
    name: "Ast Neo Orbits",
    fields: {
      // Display name: A Au
      aAu: {
        type: "column",
        name: "a_au",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3554,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Abs Magnitude H
      absMagnitudeH: {
        type: "column",
        name: "abs_magnitude_h",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3566,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Ad Au
      adAu: {
        type: "column",
        name: "ad_au",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3563,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Albedo
      albedo: {
        type: "column",
        name: "albedo",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3568,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Condition Code
      conditionCode: {
        type: "column",
        name: "condition_code",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3570,
        tableId: 432,
        baseType: "type/Integer"
      },
      // Display name: Designation
      designation: {
        type: "column",
        name: "designation",
        sourceName: "ast_neo_orbits",
        jsType: "string",
        fieldId: 3548,
        tableId: 432,
        baseType: "type/Text"
      },
      // Display name: Diameter Km
      diameterKm: {
        type: "column",
        name: "diameter_km",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3567,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Discovery Year
      discoveryYear: {
        type: "column",
        name: "discovery_year",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3553,
        tableId: 432,
        baseType: "type/Integer"
      },
      // Display name: E
      e: {
        type: "column",
        name: "e",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3555,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Epoch Jd
      epochJd: {
        type: "column",
        name: "epoch_jd",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3561,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Full Name
      fullName: {
        type: "column",
        name: "full_name",
        sourceName: "ast_neo_orbits",
        jsType: "string",
        fieldId: 3549,
        tableId: 432,
        baseType: "type/Text"
      },
      // Display name: I Deg
      iDeg: {
        type: "column",
        name: "i_deg",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3556,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Impact Probability
      impactProbability: {
        type: "column",
        name: "impact_probability",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3574,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Impact Year Range
      impactYearRange: {
        type: "column",
        name: "impact_year_range",
        sourceName: "ast_neo_orbits",
        jsType: "string",
        fieldId: 3575,
        tableId: 432,
        baseType: "type/Text"
      },
      // Display name: Is Pha
      isPha: {
        type: "column",
        name: "is_pha",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3552,
        tableId: 432,
        baseType: "type/Integer"
      },
      // Display name: Mean Anomaly Deg
      meanAnomalyDeg: {
        type: "column",
        name: "mean_anomaly_deg",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3559,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Mean Motion Deg Day
      meanMotionDegDay: {
        type: "column",
        name: "mean_motion_deg_day",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3560,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Moid Au
      moidAu: {
        type: "column",
        name: "moid_au",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3565,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: N Obs Used
      nObsUsed: {
        type: "column",
        name: "n_obs_used",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3569,
        tableId: 432,
        baseType: "type/Integer"
      },
      // Display name: Name
      // Semantic type: type/Name
      name: {
        type: "column",
        name: "name",
        sourceName: "ast_neo_orbits",
        jsType: "string",
        fieldId: 3550,
        tableId: 432,
        baseType: "type/Text"
      },
      // Display name: Node Deg
      nodeDeg: {
        type: "column",
        name: "node_deg",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3557,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: On Risk List
      onRiskList: {
        type: "column",
        name: "on_risk_list",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3571,
        tableId: 432,
        baseType: "type/Integer"
      },
      // Display name: Orbit Class
      // Semantic type: type/Category
      orbitClass: {
        type: "column",
        name: "orbit_class",
        sourceName: "ast_neo_orbits",
        jsType: "string",
        fieldId: 3551,
        tableId: 432,
        baseType: "type/Text"
      },
      // Display name: Palermo Cum
      palermoCum: {
        type: "column",
        name: "palermo_cum",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3573,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Peri Deg
      periDeg: {
        type: "column",
        name: "peri_deg",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3558,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Period Years
      periodYears: {
        type: "column",
        name: "period_years",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3564,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Q Au
      qAu: {
        type: "column",
        name: "q_au",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3562,
        tableId: 432,
        baseType: "type/Float"
      },
      // Display name: Spkid
      spkid: {
        type: "column",
        name: "spkid",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3547,
        tableId: 432,
        baseType: "type/Integer"
      },
      // Display name: Torino Max
      torinoMax: {
        type: "column",
        name: "torino_max",
        sourceName: "ast_neo_orbits",
        jsType: "number",
        fieldId: 3572,
        tableId: 432,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: default
  // Table: ast_neocp_live
  astNeocpLive: {
    type: "table",
    id: 403,
    name: "Ast Neocp Live",
    fields: {
      // Display name: Abs Magnitude H
      absMagnitudeH: {
        type: "column",
        name: "abs_magnitude_h",
        sourceName: "ast_neocp_live",
        jsType: "number",
        fieldId: 3205,
        tableId: 403,
        baseType: "type/Float"
      },
      // Display name: Arc Days
      arcDays: {
        type: "column",
        name: "arc_days",
        sourceName: "ast_neocp_live",
        jsType: "number",
        fieldId: 3207,
        tableId: 403,
        baseType: "type/Float"
      },
      // Display name: Dec Deg
      decDeg: {
        type: "column",
        name: "dec_deg",
        sourceName: "ast_neocp_live",
        jsType: "number",
        fieldId: 3203,
        tableId: 403,
        baseType: "type/Float"
      },
      // Display name: Discovery Date
      discoveryDate: {
        type: "column",
        name: "discovery_date",
        sourceName: "ast_neocp_live",
        jsType: "Date",
        fieldId: 3201,
        tableId: 403,
        baseType: "type/Date"
      },
      // Display name: N Obs
      nObs: {
        type: "column",
        name: "n_obs",
        sourceName: "ast_neocp_live",
        jsType: "number",
        fieldId: 3206,
        tableId: 403,
        baseType: "type/BigInteger"
      },
      // Display name: Neo Score
      // Semantic type: type/Score
      neoScore: {
        type: "column",
        name: "neo_score",
        sourceName: "ast_neocp_live",
        jsType: "number",
        fieldId: 3200,
        tableId: 403,
        baseType: "type/BigInteger"
      },
      // Display name: Not Seen Days
      notSeenDays: {
        type: "column",
        name: "not_seen_days",
        sourceName: "ast_neocp_live",
        jsType: "number",
        fieldId: 3208,
        tableId: 403,
        baseType: "type/Float"
      },
      // Display name: Ra Hours
      raHours: {
        type: "column",
        name: "ra_hours",
        sourceName: "ast_neocp_live",
        jsType: "number",
        fieldId: 3202,
        tableId: 403,
        baseType: "type/Float"
      },
      // Display name: Temp Desig
      tempDesig: {
        type: "column",
        name: "temp_desig",
        sourceName: "ast_neocp_live",
        jsType: "string",
        fieldId: 3199,
        tableId: 403,
        baseType: "type/Text"
      },
      // Display name: Updated Note
      // Semantic type: type/Category
      updatedNote: {
        type: "column",
        name: "updated_note",
        sourceName: "ast_neocp_live",
        jsType: "string",
        fieldId: 3209,
        tableId: 403,
        baseType: "type/Text"
      },
      // Display name: V Magnitude
      vMagnitude: {
        type: "column",
        name: "v_magnitude",
        sourceName: "ast_neocp_live",
        jsType: "number",
        fieldId: 3204,
        tableId: 403,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: default
  // Table: ast_neocp_snapshots
  astNeocpSnapshots: {
    type: "table",
    id: 404,
    name: "Ast Neocp Snapshots",
    fields: {
      // Display name: Abs Magnitude H
      absMagnitudeH: {
        type: "column",
        name: "abs_magnitude_h",
        sourceName: "ast_neocp_snapshots",
        jsType: "number",
        fieldId: 3217,
        tableId: 404,
        baseType: "type/Float"
      },
      // Display name: Arc Days
      arcDays: {
        type: "column",
        name: "arc_days",
        sourceName: "ast_neocp_snapshots",
        jsType: "number",
        fieldId: 3219,
        tableId: 404,
        baseType: "type/Float"
      },
      // Display name: Dec Deg
      decDeg: {
        type: "column",
        name: "dec_deg",
        sourceName: "ast_neocp_snapshots",
        jsType: "number",
        fieldId: 3215,
        tableId: 404,
        baseType: "type/Float"
      },
      // Display name: Discovery Date
      discoveryDate: {
        type: "column",
        name: "discovery_date",
        sourceName: "ast_neocp_snapshots",
        jsType: "Date",
        fieldId: 3213,
        tableId: 404,
        baseType: "type/Date"
      },
      // Display name: N Obs
      nObs: {
        type: "column",
        name: "n_obs",
        sourceName: "ast_neocp_snapshots",
        jsType: "number",
        fieldId: 3218,
        tableId: 404,
        baseType: "type/BigInteger"
      },
      // Display name: Neo Score
      // Semantic type: type/Score
      neoScore: {
        type: "column",
        name: "neo_score",
        sourceName: "ast_neocp_snapshots",
        jsType: "number",
        fieldId: 3212,
        tableId: 404,
        baseType: "type/BigInteger"
      },
      // Display name: Not Seen Days
      notSeenDays: {
        type: "column",
        name: "not_seen_days",
        sourceName: "ast_neocp_snapshots",
        jsType: "number",
        fieldId: 3220,
        tableId: 404,
        baseType: "type/Float"
      },
      // Display name: Ra Hours
      raHours: {
        type: "column",
        name: "ra_hours",
        sourceName: "ast_neocp_snapshots",
        jsType: "number",
        fieldId: 3214,
        tableId: 404,
        baseType: "type/Float"
      },
      // Display name: Snapshot At
      // Semantic type: type/PK
      snapshotAt: {
        type: "column",
        name: "snapshot_at",
        sourceName: "ast_neocp_snapshots",
        jsType: "Date",
        fieldId: 3210,
        tableId: 404,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Temp Desig
      // Semantic type: type/PK
      tempDesig: {
        type: "column",
        name: "temp_desig",
        sourceName: "ast_neocp_snapshots",
        jsType: "string",
        fieldId: 3211,
        tableId: 404,
        baseType: "type/Text"
      },
      // Display name: Updated Note
      // Semantic type: type/Category
      updatedNote: {
        type: "column",
        name: "updated_note",
        sourceName: "ast_neocp_snapshots",
        jsType: "string",
        fieldId: 3221,
        tableId: 404,
        baseType: "type/Text"
      },
      // Display name: V Magnitude
      vMagnitude: {
        type: "column",
        name: "v_magnitude",
        sourceName: "ast_neocp_snapshots",
        jsType: "number",
        fieldId: 3216,
        tableId: 404,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: default
  // Table: ast_neocp_snapshots_mv
  astNeocpSnapshotsMv: {
    type: "table",
    id: 405,
    name: "Ast Neocp Snapshots Mv",
    fields: {
      // Display name: Abs Magnitude H
      absMagnitudeH: {
        type: "column",
        name: "abs_magnitude_h",
        sourceName: "ast_neocp_snapshots_mv",
        jsType: "number",
        fieldId: 3229,
        tableId: 405,
        baseType: "type/Float"
      },
      // Display name: Arc Days
      arcDays: {
        type: "column",
        name: "arc_days",
        sourceName: "ast_neocp_snapshots_mv",
        jsType: "number",
        fieldId: 3231,
        tableId: 405,
        baseType: "type/Float"
      },
      // Display name: Dec Deg
      decDeg: {
        type: "column",
        name: "dec_deg",
        sourceName: "ast_neocp_snapshots_mv",
        jsType: "number",
        fieldId: 3227,
        tableId: 405,
        baseType: "type/Float"
      },
      // Display name: Discovery Date
      discoveryDate: {
        type: "column",
        name: "discovery_date",
        sourceName: "ast_neocp_snapshots_mv",
        jsType: "Date",
        fieldId: 3225,
        tableId: 405,
        baseType: "type/Date"
      },
      // Display name: N Obs
      nObs: {
        type: "column",
        name: "n_obs",
        sourceName: "ast_neocp_snapshots_mv",
        jsType: "number",
        fieldId: 3230,
        tableId: 405,
        baseType: "type/BigInteger"
      },
      // Display name: Neo Score
      // Semantic type: type/Score
      neoScore: {
        type: "column",
        name: "neo_score",
        sourceName: "ast_neocp_snapshots_mv",
        jsType: "number",
        fieldId: 3224,
        tableId: 405,
        baseType: "type/BigInteger"
      },
      // Display name: Not Seen Days
      notSeenDays: {
        type: "column",
        name: "not_seen_days",
        sourceName: "ast_neocp_snapshots_mv",
        jsType: "number",
        fieldId: 3232,
        tableId: 405,
        baseType: "type/Float"
      },
      // Display name: Ra Hours
      raHours: {
        type: "column",
        name: "ra_hours",
        sourceName: "ast_neocp_snapshots_mv",
        jsType: "number",
        fieldId: 3226,
        tableId: 405,
        baseType: "type/Float"
      },
      // Display name: Snapshot At
      snapshotAt: {
        type: "column",
        name: "snapshot_at",
        sourceName: "ast_neocp_snapshots_mv",
        jsType: "Date",
        fieldId: 3222,
        tableId: 405,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Temp Desig
      tempDesig: {
        type: "column",
        name: "temp_desig",
        sourceName: "ast_neocp_snapshots_mv",
        jsType: "string",
        fieldId: 3223,
        tableId: 405,
        baseType: "type/Text"
      },
      // Display name: Updated Note
      // Semantic type: type/Category
      updatedNote: {
        type: "column",
        name: "updated_note",
        sourceName: "ast_neocp_snapshots_mv",
        jsType: "string",
        fieldId: 3233,
        tableId: 405,
        baseType: "type/Text"
      },
      // Display name: V Magnitude
      vMagnitude: {
        type: "column",
        name: "v_magnitude",
        sourceName: "ast_neocp_snapshots_mv",
        jsType: "number",
        fieldId: 3228,
        tableId: 405,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: default
  // Table: ast_sentry_live
  astSentryLive: {
    type: "table",
    id: 406,
    name: "Ast Sentry Live",
    fields: {
      // Display name: Abs Magnitude H
      absMagnitudeH: {
        type: "column",
        name: "abs_magnitude_h",
        sourceName: "ast_sentry_live",
        jsType: "number",
        fieldId: 3244,
        tableId: 406,
        baseType: "type/Float"
      },
      // Display name: Des
      des: {
        type: "column",
        name: "des",
        sourceName: "ast_sentry_live",
        jsType: "string",
        fieldId: 3234,
        tableId: 406,
        baseType: "type/Text"
      },
      // Display name: Diameter Km
      diameterKm: {
        type: "column",
        name: "diameter_km",
        sourceName: "ast_sentry_live",
        jsType: "number",
        fieldId: 3243,
        tableId: 406,
        baseType: "type/Float"
      },
      // Display name: First Impact Year
      firstImpactYear: {
        type: "column",
        name: "first_impact_year",
        sourceName: "ast_sentry_live",
        jsType: "number",
        fieldId: 3242,
        tableId: 406,
        baseType: "type/Integer"
      },
      // Display name: Fullname
      // Semantic type: type/Name
      fullname: {
        type: "column",
        name: "fullname",
        sourceName: "ast_sentry_live",
        jsType: "string",
        fieldId: 3235,
        tableId: 406,
        baseType: "type/Text"
      },
      // Display name: Impact Probability
      impactProbability: {
        type: "column",
        name: "impact_probability",
        sourceName: "ast_sentry_live",
        jsType: "number",
        fieldId: 3239,
        tableId: 406,
        baseType: "type/Float"
      },
      // Display name: Impact Year Range
      impactYearRange: {
        type: "column",
        name: "impact_year_range",
        sourceName: "ast_sentry_live",
        jsType: "string",
        fieldId: 3241,
        tableId: 406,
        baseType: "type/Text"
      },
      // Display name: Last Obs
      lastObs: {
        type: "column",
        name: "last_obs",
        sourceName: "ast_sentry_live",
        jsType: "Date",
        fieldId: 3246,
        tableId: 406,
        baseType: "type/Date"
      },
      // Display name: N Impacts
      nImpacts: {
        type: "column",
        name: "n_impacts",
        sourceName: "ast_sentry_live",
        jsType: "number",
        fieldId: 3240,
        tableId: 406,
        baseType: "type/BigInteger"
      },
      // Display name: Palermo Cum
      palermoCum: {
        type: "column",
        name: "palermo_cum",
        sourceName: "ast_sentry_live",
        jsType: "number",
        fieldId: 3238,
        tableId: 406,
        baseType: "type/Float"
      },
      // Display name: Palermo Max
      palermoMax: {
        type: "column",
        name: "palermo_max",
        sourceName: "ast_sentry_live",
        jsType: "number",
        fieldId: 3237,
        tableId: 406,
        baseType: "type/Float"
      },
      // Display name: Torino Max
      torinoMax: {
        type: "column",
        name: "torino_max",
        sourceName: "ast_sentry_live",
        jsType: "number",
        fieldId: 3236,
        tableId: 406,
        baseType: "type/Integer"
      },
      // Display name: V Inf Kms
      vInfKms: {
        type: "column",
        name: "v_inf_kms",
        sourceName: "ast_sentry_live",
        jsType: "number",
        fieldId: 3245,
        tableId: 406,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: default
  // Table: ast_sentry_removed_live
  astSentryRemovedLive: {
    type: "table",
    id: 407,
    name: "Ast Sentry Removed Live",
    fields: {
      // Display name: Des
      des: {
        type: "column",
        name: "des",
        sourceName: "ast_sentry_removed_live",
        jsType: "string",
        fieldId: 3247,
        tableId: 407,
        baseType: "type/Text"
      },
      // Display name: Removed At
      removedAt: {
        type: "column",
        name: "removed_at",
        sourceName: "ast_sentry_removed_live",
        jsType: "Date",
        fieldId: 3248,
        tableId: 407,
        baseType: "type/DateTimeWithLocalTZ"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: default
  // Table: ast_sentry_snapshots
  astSentrySnapshots: {
    type: "table",
    id: 408,
    name: "Ast Sentry Snapshots",
    fields: {
      // Display name: Abs Magnitude H
      absMagnitudeH: {
        type: "column",
        name: "abs_magnitude_h",
        sourceName: "ast_sentry_snapshots",
        jsType: "number",
        fieldId: 3261,
        tableId: 408,
        baseType: "type/Float"
      },
      // Display name: Des
      // Semantic type: type/PK
      des: {
        type: "column",
        name: "des",
        sourceName: "ast_sentry_snapshots",
        jsType: "string",
        fieldId: 3251,
        tableId: 408,
        baseType: "type/Text"
      },
      // Display name: Diameter Km
      diameterKm: {
        type: "column",
        name: "diameter_km",
        sourceName: "ast_sentry_snapshots",
        jsType: "number",
        fieldId: 3260,
        tableId: 408,
        baseType: "type/Float"
      },
      // Display name: First Impact Year
      firstImpactYear: {
        type: "column",
        name: "first_impact_year",
        sourceName: "ast_sentry_snapshots",
        jsType: "number",
        fieldId: 3259,
        tableId: 408,
        baseType: "type/Integer"
      },
      // Display name: Fullname
      // Semantic type: type/Name
      fullname: {
        type: "column",
        name: "fullname",
        sourceName: "ast_sentry_snapshots",
        jsType: "string",
        fieldId: 3252,
        tableId: 408,
        baseType: "type/Text"
      },
      // Display name: Impact Probability
      impactProbability: {
        type: "column",
        name: "impact_probability",
        sourceName: "ast_sentry_snapshots",
        jsType: "number",
        fieldId: 3256,
        tableId: 408,
        baseType: "type/Float"
      },
      // Display name: Impact Year Range
      impactYearRange: {
        type: "column",
        name: "impact_year_range",
        sourceName: "ast_sentry_snapshots",
        jsType: "string",
        fieldId: 3258,
        tableId: 408,
        baseType: "type/Text"
      },
      // Display name: Last Obs
      lastObs: {
        type: "column",
        name: "last_obs",
        sourceName: "ast_sentry_snapshots",
        jsType: "Date",
        fieldId: 3263,
        tableId: 408,
        baseType: "type/Date"
      },
      // Display name: N Impacts
      nImpacts: {
        type: "column",
        name: "n_impacts",
        sourceName: "ast_sentry_snapshots",
        jsType: "number",
        fieldId: 3257,
        tableId: 408,
        baseType: "type/BigInteger"
      },
      // Display name: Palermo Cum
      palermoCum: {
        type: "column",
        name: "palermo_cum",
        sourceName: "ast_sentry_snapshots",
        jsType: "number",
        fieldId: 3255,
        tableId: 408,
        baseType: "type/Float"
      },
      // Display name: Palermo Max
      palermoMax: {
        type: "column",
        name: "palermo_max",
        sourceName: "ast_sentry_snapshots",
        jsType: "number",
        fieldId: 3254,
        tableId: 408,
        baseType: "type/Float"
      },
      // Display name: Snapshot At
      snapshotAt: {
        type: "column",
        name: "snapshot_at",
        sourceName: "ast_sentry_snapshots",
        jsType: "Date",
        fieldId: 3250,
        tableId: 408,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Snapshot Date
      // Semantic type: type/PK
      snapshotDate: {
        type: "column",
        name: "snapshot_date",
        sourceName: "ast_sentry_snapshots",
        jsType: "Date",
        fieldId: 3249,
        tableId: 408,
        baseType: "type/Date"
      },
      // Display name: Torino Max
      torinoMax: {
        type: "column",
        name: "torino_max",
        sourceName: "ast_sentry_snapshots",
        jsType: "number",
        fieldId: 3253,
        tableId: 408,
        baseType: "type/Integer"
      },
      // Display name: V Inf Kms
      vInfKms: {
        type: "column",
        name: "v_inf_kms",
        sourceName: "ast_sentry_snapshots",
        jsType: "number",
        fieldId: 3262,
        tableId: 408,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: default
  // Table: ast_sentry_snapshots_mv
  astSentrySnapshotsMv: {
    type: "table",
    id: 409,
    name: "Ast Sentry Snapshots Mv",
    fields: {
      // Display name: Abs Magnitude H
      absMagnitudeH: {
        type: "column",
        name: "abs_magnitude_h",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "number",
        fieldId: 3276,
        tableId: 409,
        baseType: "type/Float"
      },
      // Display name: Des
      des: {
        type: "column",
        name: "des",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "string",
        fieldId: 3266,
        tableId: 409,
        baseType: "type/Text"
      },
      // Display name: Diameter Km
      diameterKm: {
        type: "column",
        name: "diameter_km",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "number",
        fieldId: 3275,
        tableId: 409,
        baseType: "type/Float"
      },
      // Display name: First Impact Year
      firstImpactYear: {
        type: "column",
        name: "first_impact_year",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "number",
        fieldId: 3274,
        tableId: 409,
        baseType: "type/Integer"
      },
      // Display name: Fullname
      // Semantic type: type/Name
      fullname: {
        type: "column",
        name: "fullname",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "string",
        fieldId: 3267,
        tableId: 409,
        baseType: "type/Text"
      },
      // Display name: Impact Probability
      impactProbability: {
        type: "column",
        name: "impact_probability",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "number",
        fieldId: 3271,
        tableId: 409,
        baseType: "type/Float"
      },
      // Display name: Impact Year Range
      impactYearRange: {
        type: "column",
        name: "impact_year_range",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "string",
        fieldId: 3273,
        tableId: 409,
        baseType: "type/Text"
      },
      // Display name: Last Obs
      lastObs: {
        type: "column",
        name: "last_obs",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "Date",
        fieldId: 3278,
        tableId: 409,
        baseType: "type/Date"
      },
      // Display name: N Impacts
      nImpacts: {
        type: "column",
        name: "n_impacts",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "number",
        fieldId: 3272,
        tableId: 409,
        baseType: "type/BigInteger"
      },
      // Display name: Palermo Cum
      palermoCum: {
        type: "column",
        name: "palermo_cum",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "number",
        fieldId: 3270,
        tableId: 409,
        baseType: "type/Float"
      },
      // Display name: Palermo Max
      palermoMax: {
        type: "column",
        name: "palermo_max",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "number",
        fieldId: 3269,
        tableId: 409,
        baseType: "type/Float"
      },
      // Display name: Snapshot At
      snapshotAt: {
        type: "column",
        name: "snapshot_at",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "Date",
        fieldId: 3265,
        tableId: 409,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Snapshot Date
      snapshotDate: {
        type: "column",
        name: "snapshot_date",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "Date",
        fieldId: 3264,
        tableId: 409,
        baseType: "type/Date"
      },
      // Display name: Torino Max
      torinoMax: {
        type: "column",
        name: "torino_max",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "number",
        fieldId: 3268,
        tableId: 409,
        baseType: "type/Integer"
      },
      // Display name: V Inf Kms
      vInfKms: {
        type: "column",
        name: "v_inf_kms",
        sourceName: "ast_sentry_snapshots_mv",
        jsType: "number",
        fieldId: 3277,
        tableId: 409,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: default
  // Table: ast_torino_history
  astTorinoHistory: {
    type: "table",
    id: 410,
    name: "Ast Torino History",
    fields: {
      // Display name: Date Precision
      // Semantic type: type/Category
      datePrecision: {
        type: "column",
        name: "date_precision",
        sourceName: "ast_torino_history",
        jsType: "string",
        fieldId: 3282,
        tableId: 410,
        baseType: "type/Text"
      },
      // Display name: Des
      // Semantic type: type/PK
      des: {
        type: "column",
        name: "des",
        sourceName: "ast_torino_history",
        jsType: "string",
        fieldId: 3279,
        tableId: 410,
        baseType: "type/Text"
      },
      // Display name: Event
      // Semantic type: type/Category
      event: {
        type: "column",
        name: "event",
        sourceName: "ast_torino_history",
        jsType: "string",
        fieldId: 3284,
        tableId: 410,
        baseType: "type/Text"
      },
      // Display name: Event Date
      // Semantic type: type/PK
      eventDate: {
        type: "column",
        name: "event_date",
        sourceName: "ast_torino_history",
        jsType: "Date",
        fieldId: 3281,
        tableId: 410,
        baseType: "type/Date"
      },
      // Display name: Name
      // Semantic type: type/Name
      name: {
        type: "column",
        name: "name",
        sourceName: "ast_torino_history",
        jsType: "string",
        fieldId: 3280,
        tableId: 410,
        baseType: "type/Text"
      },
      // Display name: Source
      // Semantic type: type/Source
      source: {
        type: "column",
        name: "source",
        sourceName: "ast_torino_history",
        jsType: "string",
        fieldId: 3285,
        tableId: 410,
        baseType: "type/Text"
      },
      // Display name: Torino
      torino: {
        type: "column",
        name: "torino",
        sourceName: "ast_torino_history",
        jsType: "number",
        fieldId: 3283,
        tableId: 410,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: ac36
  // Table: boat_legs
  boatLegs: {
    type: "table",
    id: 424,
    name: "Boat Legs",
    fields: {
      // Display name: Ave Speed Kn
      aveSpeedKn: {
        type: "column",
        name: "ave_speed_kn",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3445,
        tableId: 424,
        baseType: "type/Float"
      },
      // Display name: Boat Index
      // Semantic type: type/PK
      boatIndex: {
        type: "column",
        name: "boat_index",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3433,
        tableId: 424,
        baseType: "type/Integer"
      },
      // Display name: Country
      // Semantic type: type/Country
      country: {
        type: "column",
        name: "country",
        sourceName: "boat_legs",
        jsType: "string",
        fieldId: 3435,
        tableId: 424,
        baseType: "type/Text"
      },
      // Display name: Cumulative Sec
      cumulativeSec: {
        type: "column",
        name: "cumulative_sec",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3441,
        tableId: 424,
        baseType: "type/Integer"
      },
      // Display name: Delta Sec
      deltaSec: {
        type: "column",
        name: "delta_sec",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3442,
        tableId: 424,
        baseType: "type/Integer"
      },
      // Display name: Dist Sailed M
      distSailedM: {
        type: "column",
        name: "dist_sailed_m",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3444,
        tableId: 424,
        baseType: "type/Integer"
      },
      // Display name: Leg Duration Sec
      // Semantic type: type/Duration
      legDurationSec: {
        type: "column",
        name: "leg_duration_sec",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3440,
        tableId: 424,
        baseType: "type/Integer"
      },
      // Display name: Leg End Ms
      legEndMs: {
        type: "column",
        name: "leg_end_ms",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3438,
        tableId: 424,
        baseType: "type/Integer"
      },
      // Display name: Leg Number
      // Semantic type: type/PK
      legNumber: {
        type: "column",
        name: "leg_number",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3434,
        tableId: 424,
        baseType: "type/Integer"
      },
      // Display name: Leg Start Ms
      legStartMs: {
        type: "column",
        name: "leg_start_ms",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3437,
        tableId: 424,
        baseType: "type/Integer"
      },
      // Display name: Leg Start Utc
      // Semantic type: type/CreationTimestamp
      legStartUtc: {
        type: "column",
        name: "leg_start_utc",
        sourceName: "boat_legs",
        jsType: "Date",
        fieldId: 3439,
        tableId: 424,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Max Speed Kn
      maxSpeedKn: {
        type: "column",
        name: "max_speed_kn",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3446,
        tableId: 424,
        baseType: "type/Float"
      },
      // Display name: Max Wind Speed Kn
      maxWindSpeedKn: {
        type: "column",
        name: "max_wind_speed_kn",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3447,
        tableId: 424,
        baseType: "type/Float"
      },
      // Display name: Min Wind Speed Kn
      minWindSpeedKn: {
        type: "column",
        name: "min_wind_speed_kn",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3448,
        tableId: 424,
        baseType: "type/Float"
      },
      // Display name: Place
      place: {
        type: "column",
        name: "place",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3443,
        tableId: 424,
        baseType: "type/Integer"
      },
      // Display name: Point Of Sail
      // Semantic type: type/Category
      pointOfSail: {
        type: "column",
        name: "point_of_sail",
        sourceName: "boat_legs",
        jsType: "string",
        fieldId: 3436,
        tableId: 424,
        baseType: "type/Text"
      },
      // Display name: Race ID
      // Semantic type: type/PK
      raceId: {
        type: "column",
        name: "race_id",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3432,
        tableId: 424,
        baseType: "type/Integer"
      },
      // Display name: Tacks Gybes
      tacksGybes: {
        type: "column",
        name: "tacks_gybes",
        sourceName: "boat_legs",
        jsType: "number",
        fieldId: 3449,
        tableId: 424,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: ac36
  // Table: boat_mark_events
  boatMarkEvents: {
    type: "table",
    id: 425,
    name: "Boat Mark Events",
    fields: {
      // Display name: Boat Index
      // Semantic type: type/PK
      boatIndex: {
        type: "column",
        name: "boat_index",
        sourceName: "boat_mark_events",
        jsType: "number",
        fieldId: 3451,
        tableId: 425,
        baseType: "type/Integer"
      },
      // Display name: Elapsed Sec
      elapsedSec: {
        type: "column",
        name: "elapsed_sec",
        sourceName: "boat_mark_events",
        jsType: "number",
        fieldId: 3455,
        tableId: 425,
        baseType: "type/Float"
      },
      // Display name: Race ID
      // Semantic type: type/PK
      raceId: {
        type: "column",
        name: "race_id",
        sourceName: "boat_mark_events",
        jsType: "number",
        fieldId: 3450,
        tableId: 425,
        baseType: "type/Integer"
      },
      // Display name: Sequence
      // Semantic type: type/PK
      sequence: {
        type: "column",
        name: "sequence",
        sourceName: "boat_mark_events",
        jsType: "number",
        fieldId: 3452,
        tableId: 425,
        baseType: "type/Integer"
      },
      // Display name: T Ms
      tMs: {
        type: "column",
        name: "t_ms",
        sourceName: "boat_mark_events",
        jsType: "number",
        fieldId: 3453,
        tableId: 425,
        baseType: "type/Integer"
      },
      // Display name: Timestamp Utc
      timestampUtc: {
        type: "column",
        name: "timestamp_utc",
        sourceName: "boat_mark_events",
        jsType: "Date",
        fieldId: 3454,
        tableId: 425,
        baseType: "type/DateTimeWithLocalTZ"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: car_telemetry
  carTelemetry: {
    type: "table",
    id: 411,
    name: "Car Telemetry",
    fields: {
      // Display name: Brake
      brake: {
        type: "column",
        name: "brake",
        sourceName: "car_telemetry",
        jsType: "number",
        fieldId: 3295,
        tableId: 411,
        baseType: "type/Integer"
      },
      // Display name: Driver Number
      // Semantic type: type/PK
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "car_telemetry",
        jsType: "number",
        fieldId: 3287,
        tableId: 411,
        baseType: "type/Integer"
      },
      // Display name: Drs
      drs: {
        type: "column",
        name: "drs",
        sourceName: "car_telemetry",
        jsType: "number",
        fieldId: 3296,
        tableId: 411,
        baseType: "type/Integer"
      },
      // Display name: Gear
      gear: {
        type: "column",
        name: "gear",
        sourceName: "car_telemetry",
        jsType: "number",
        fieldId: 3293,
        tableId: 411,
        baseType: "type/Integer"
      },
      // Display name: Rpm
      rpm: {
        type: "column",
        name: "rpm",
        sourceName: "car_telemetry",
        jsType: "number",
        fieldId: 3292,
        tableId: 411,
        baseType: "type/Float"
      },
      // Display name: Session ID
      // Semantic type: type/PK
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "car_telemetry",
        jsType: "number",
        fieldId: 3286,
        tableId: 411,
        baseType: "type/Integer"
      },
      // Display name: Session Time Ms
      // Semantic type: type/PK
      sessionTimeMs: {
        type: "column",
        name: "session_time_ms",
        sourceName: "car_telemetry",
        jsType: "number",
        fieldId: 3290,
        tableId: 411,
        baseType: "type/BigInteger"
      },
      // Display name: Speed
      speed: {
        type: "column",
        name: "speed",
        sourceName: "car_telemetry",
        jsType: "number",
        fieldId: 3291,
        tableId: 411,
        baseType: "type/Float"
      },
      // Display name: Throttle
      throttle: {
        type: "column",
        name: "throttle",
        sourceName: "car_telemetry",
        jsType: "number",
        fieldId: 3294,
        tableId: 411,
        baseType: "type/Float"
      },
      // Display name: Ts
      ts: {
        type: "column",
        name: "ts",
        sourceName: "car_telemetry",
        jsType: "Date",
        fieldId: 3289,
        tableId: 411,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Ts Ms
      tsMs: {
        type: "column",
        name: "ts_ms",
        sourceName: "car_telemetry",
        jsType: "number",
        fieldId: 3288,
        tableId: 411,
        baseType: "type/BigInteger"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: circuit_corners
  circuitCorners: {
    type: "table",
    id: 412,
    name: "Circuit Corners",
    fields: {
      // Display name: Angle
      angle: {
        type: "column",
        name: "angle",
        sourceName: "circuit_corners",
        jsType: "number",
        fieldId: 3302,
        tableId: 412,
        baseType: "type/Float"
      },
      // Display name: Corner Number
      // Semantic type: type/PK
      cornerNumber: {
        type: "column",
        name: "corner_number",
        sourceName: "circuit_corners",
        jsType: "number",
        fieldId: 3298,
        tableId: 412,
        baseType: "type/Integer"
      },
      // Display name: Distance M
      distanceM: {
        type: "column",
        name: "distance_m",
        sourceName: "circuit_corners",
        jsType: "number",
        fieldId: 3303,
        tableId: 412,
        baseType: "type/Float"
      },
      // Display name: Letter
      // Semantic type: type/PK
      letter: {
        type: "column",
        name: "letter",
        sourceName: "circuit_corners",
        jsType: "string",
        fieldId: 3299,
        tableId: 412,
        baseType: "type/Text"
      },
      // Display name: Rotation
      rotation: {
        type: "column",
        name: "rotation",
        sourceName: "circuit_corners",
        jsType: "number",
        fieldId: 3304,
        tableId: 412,
        baseType: "type/Float"
      },
      // Display name: Session ID
      // Semantic type: type/PK
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "circuit_corners",
        jsType: "number",
        fieldId: 3297,
        tableId: 412,
        baseType: "type/Integer"
      },
      // Display name: X
      x: {
        type: "column",
        name: "x",
        sourceName: "circuit_corners",
        jsType: "number",
        fieldId: 3300,
        tableId: 412,
        baseType: "type/Float"
      },
      // Display name: Y
      y: {
        type: "column",
        name: "y",
        sourceName: "circuit_corners",
        jsType: "number",
        fieldId: 3301,
        tableId: 412,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: circuit_layout_version
  circuitLayoutVersion: {
    type: "table",
    id: 413,
    name: "Circuit Layout Version",
    fields: {
      // Display name: From Year
      // Semantic type: type/PK
      fromYear: {
        type: "column",
        name: "from_year",
        sourceName: "circuit_layout_version",
        jsType: "number",
        fieldId: 3306,
        tableId: 413,
        baseType: "type/Integer"
      },
      // Display name: Layout Version
      layoutVersion: {
        type: "column",
        name: "layout_version",
        sourceName: "circuit_layout_version",
        jsType: "number",
        fieldId: 3308,
        tableId: 413,
        baseType: "type/Integer"
      },
      // Display name: Location
      // Semantic type: type/PK
      location: {
        type: "column",
        name: "location",
        sourceName: "circuit_layout_version",
        jsType: "string",
        fieldId: 3305,
        tableId: 413,
        baseType: "type/Text"
      },
      // Display name: Note
      note: {
        type: "column",
        name: "note",
        sourceName: "circuit_layout_version",
        jsType: "string",
        fieldId: 3309,
        tableId: 413,
        baseType: "type/Text"
      },
      // Display name: To Year
      toYear: {
        type: "column",
        name: "to_year",
        sourceName: "circuit_layout_version",
        jsType: "number",
        fieldId: 3307,
        tableId: 413,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1_ops
  // Table: damage_events
  damageEvents: {
    type: "table",
    id: 448,
    name: "Damage Events",
    fields: {
      // Display name: Cause
      // Semantic type: type/Category
      cause: {
        type: "column",
        name: "cause",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3927,
        tableId: 448,
        baseType: "type/Text"
      },
      // Display name: Cause Basis
      // Semantic type: type/Category
      causeBasis: {
        type: "column",
        name: "cause_basis",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3928,
        tableId: 448,
        baseType: "type/Text"
      },
      // Display name: Damage ID
      damageId: {
        type: "column",
        name: "damage_id",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3913,
        tableId: 448,
        baseType: "type/Text"
      },
      // Display name: Driver Code
      // Semantic type: type/Category
      driverCode: {
        type: "column",
        name: "driver_code",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3923,
        tableId: 448,
        baseType: "type/Text"
      },
      // Display name: Driver Name
      // Semantic type: type/Category
      driverName: {
        type: "column",
        name: "driver_name",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3924,
        tableId: 448,
        baseType: "type/Text"
      },
      // Display name: Event Label
      eventLabel: {
        type: "column",
        name: "event_label",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3917,
        tableId: 448,
        baseType: "type/Text"
      },
      // Display name: Failed Part Type Code
      // Semantic type: type/Category
      failedPartTypeCode: {
        type: "column",
        name: "failed_part_type_code",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3932,
        tableId: 448,
        baseType: "type/Text"
      },
      // Display name: Is Mechanical
      isMechanical: {
        type: "column",
        name: "is_mechanical",
        sourceName: "damage_events",
        jsType: "boolean",
        fieldId: 3929,
        tableId: 448,
        baseType: "type/Boolean"
      },
      // Display name: Is Simulated Cost
      isSimulatedCost: {
        type: "column",
        name: "is_simulated_cost",
        sourceName: "damage_events",
        jsType: "boolean",
        fieldId: 3935,
        tableId: 448,
        baseType: "type/Boolean"
      },
      // Display name: Lap
      lap: {
        type: "column",
        name: "lap",
        sourceName: "damage_events",
        jsType: "number",
        fieldId: 3925,
        tableId: 448,
        baseType: "type/Integer"
      },
      // Display name: Parts Replaced
      // Semantic type: type/Category
      partsReplaced: {
        type: "column",
        name: "parts_replaced",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3931,
        tableId: 448,
        baseType: "type/Text"
      },
      // Display name: Posted Month
      postedMonth: {
        type: "column",
        name: "posted_month",
        sourceName: "damage_events",
        jsType: "Date",
        fieldId: 3920,
        tableId: 448,
        baseType: "type/Date"
      },
      // Display name: Repair Cost Usd
      // Semantic type: type/Cost
      repairCostUsd: {
        type: "column",
        name: "repair_cost_usd",
        sourceName: "damage_events",
        jsType: "number",
        fieldId: 3933,
        tableId: 448,
        baseType: "type/Float"
      },
      // Display name: Round
      round: {
        type: "column",
        name: "round",
        sourceName: "damage_events",
        jsType: "number",
        fieldId: 3916,
        tableId: 448,
        baseType: "type/Integer"
      },
      // Display name: Season
      season: {
        type: "column",
        name: "season",
        sourceName: "damage_events",
        jsType: "number",
        fieldId: 3915,
        tableId: 448,
        baseType: "type/Integer"
      },
      // Display name: Session Date
      sessionDate: {
        type: "column",
        name: "session_date",
        sourceName: "damage_events",
        jsType: "Date",
        fieldId: 3919,
        tableId: 448,
        baseType: "type/Date"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "damage_events",
        jsType: "number",
        fieldId: 3914,
        tableId: 448,
        baseType: "type/Integer"
      },
      // Display name: Session Type
      // Semantic type: type/Category
      sessionType: {
        type: "column",
        name: "session_type",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3918,
        tableId: 448,
        baseType: "type/Text"
      },
      // Display name: Severity
      // Semantic type: type/Category
      severity: {
        type: "column",
        name: "severity",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3930,
        tableId: 448,
        baseType: "type/Text"
      },
      // Display name: Source
      // Semantic type: type/Source
      source: {
        type: "column",
        name: "source",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3926,
        tableId: 448,
        baseType: "type/Text"
      },
      // Display name: Stewards Message
      stewardsMessage: {
        type: "column",
        name: "stewards_message",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3934,
        tableId: 448,
        baseType: "type/Text"
      },
      // Display name: Team Name
      // Semantic type: type/Category
      teamName: {
        type: "column",
        name: "team_name",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3921,
        tableId: 448,
        baseType: "type/Text"
      },
      // Display name: Team Season ID
      // Semantic type: type/Category
      teamSeasonId: {
        type: "column",
        name: "team_season_id",
        sourceName: "damage_events",
        jsType: "string",
        fieldId: 3922,
        tableId: 448,
        baseType: "type/Text"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1_ops
  // Table: driver_mileage
  driverMileage: {
    type: "table",
    id: 449,
    name: "Driver Mileage",
    fields: {
      // Display name: Cumulative Season Km
      cumulativeSeasonKm: {
        type: "column",
        name: "cumulative_season_km",
        sourceName: "driver_mileage",
        jsType: "number",
        fieldId: 3952,
        tableId: 449,
        baseType: "type/Float"
      },
      // Display name: Did Start
      didStart: {
        type: "column",
        name: "did_start",
        sourceName: "driver_mileage",
        jsType: "boolean",
        fieldId: 3953,
        tableId: 449,
        baseType: "type/Boolean"
      },
      // Display name: Driver Code
      // Semantic type: type/Category
      driverCode: {
        type: "column",
        name: "driver_code",
        sourceName: "driver_mileage",
        jsType: "string",
        fieldId: 3943,
        tableId: 449,
        baseType: "type/Text"
      },
      // Display name: Driver Name
      // Semantic type: type/Category
      driverName: {
        type: "column",
        name: "driver_name",
        sourceName: "driver_mileage",
        jsType: "string",
        fieldId: 3944,
        tableId: 449,
        baseType: "type/Text"
      },
      // Display name: Event Label
      eventLabel: {
        type: "column",
        name: "event_label",
        sourceName: "driver_mileage",
        jsType: "string",
        fieldId: 3940,
        tableId: 449,
        baseType: "type/Text"
      },
      // Display name: Lap Length Km
      lapLengthKm: {
        type: "column",
        name: "lap_length_km",
        sourceName: "driver_mileage",
        jsType: "number",
        fieldId: 3947,
        tableId: 449,
        baseType: "type/Float"
      },
      // Display name: Mileage ID
      mileageId: {
        type: "column",
        name: "mileage_id",
        sourceName: "driver_mileage",
        jsType: "string",
        fieldId: 3936,
        tableId: 449,
        baseType: "type/Text"
      },
      // Display name: Race Km
      raceKm: {
        type: "column",
        name: "race_km",
        sourceName: "driver_mileage",
        jsType: "number",
        fieldId: 3949,
        tableId: 449,
        baseType: "type/Float"
      },
      // Display name: Race Laps
      raceLaps: {
        type: "column",
        name: "race_laps",
        sourceName: "driver_mileage",
        jsType: "number",
        fieldId: 3948,
        tableId: 449,
        baseType: "type/Integer"
      },
      // Display name: Round
      round: {
        type: "column",
        name: "round",
        sourceName: "driver_mileage",
        jsType: "number",
        fieldId: 3939,
        tableId: 449,
        baseType: "type/Integer"
      },
      // Display name: Season
      season: {
        type: "column",
        name: "season",
        sourceName: "driver_mileage",
        jsType: "number",
        fieldId: 3938,
        tableId: 449,
        baseType: "type/Integer"
      },
      // Display name: Session Date
      sessionDate: {
        type: "column",
        name: "session_date",
        sourceName: "driver_mileage",
        jsType: "Date",
        fieldId: 3942,
        tableId: 449,
        baseType: "type/Date"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "driver_mileage",
        jsType: "number",
        fieldId: 3937,
        tableId: 449,
        baseType: "type/Integer"
      },
      // Display name: Session Type
      // Semantic type: type/Category
      sessionType: {
        type: "column",
        name: "session_type",
        sourceName: "driver_mileage",
        jsType: "string",
        fieldId: 3941,
        tableId: 449,
        baseType: "type/Text"
      },
      // Display name: Team Name
      // Semantic type: type/Category
      teamName: {
        type: "column",
        name: "team_name",
        sourceName: "driver_mileage",
        jsType: "string",
        fieldId: 3945,
        tableId: 449,
        baseType: "type/Text"
      },
      // Display name: Team Season ID
      // Semantic type: type/Category
      teamSeasonId: {
        type: "column",
        name: "team_season_id",
        sourceName: "driver_mileage",
        jsType: "string",
        fieldId: 3946,
        tableId: 449,
        baseType: "type/Text"
      },
      // Display name: Total Km
      totalKm: {
        type: "column",
        name: "total_km",
        sourceName: "driver_mileage",
        jsType: "number",
        fieldId: 3951,
        tableId: 449,
        baseType: "type/Float"
      },
      // Display name: Weekend Running Km
      weekendRunningKm: {
        type: "column",
        name: "weekend_running_km",
        sourceName: "driver_mileage",
        jsType: "number",
        fieldId: 3950,
        tableId: 449,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1_analytics
  // Table: driver_results
  driverResults: {
    type: "table",
    id: 441,
    name: "Driver Results",
    fields: {
      // Display name: Beat Teammate
      beatTeammate: {
        type: "column",
        name: "beat_teammate",
        sourceName: "driver_results",
        jsType: "boolean",
        fieldId: 3726,
        tableId: 441,
        baseType: "type/Boolean"
      },
      // Display name: Best Quali S
      bestQualiS: {
        type: "column",
        name: "best_quali_s",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3717,
        tableId: 441,
        baseType: "type/Float"
      },
      // Display name: Classified Position
      // Semantic type: type/Category
      classifiedPosition: {
        type: "column",
        name: "classified_position",
        sourceName: "driver_results",
        jsType: "string",
        fieldId: 3702,
        tableId: 441,
        baseType: "type/Text"
      },
      // Display name: Driver Code
      // Semantic type: type/Category
      driverCode: {
        type: "column",
        name: "driver_code",
        sourceName: "driver_results",
        jsType: "string",
        fieldId: 3695,
        tableId: 441,
        baseType: "type/Text"
      },
      // Display name: Driver Name
      // Semantic type: type/Category
      driverName: {
        type: "column",
        name: "driver_name",
        sourceName: "driver_results",
        jsType: "string",
        fieldId: 3696,
        tableId: 441,
        baseType: "type/Text"
      },
      // Display name: Driver Number
      // Semantic type: type/Quantity
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3694,
        tableId: 441,
        baseType: "type/Integer"
      },
      // Display name: Event Label
      eventLabel: {
        type: "column",
        name: "event_label",
        sourceName: "driver_results",
        jsType: "string",
        fieldId: 3689,
        tableId: 441,
        baseType: "type/Text"
      },
      // Display name: Event Name
      // Semantic type: type/Category
      eventName: {
        type: "column",
        name: "event_name",
        sourceName: "driver_results",
        jsType: "string",
        fieldId: 3688,
        tableId: 441,
        baseType: "type/Text"
      },
      // Display name: Fastest Lap S
      fastestLapS: {
        type: "column",
        name: "fastest_lap_s",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3722,
        tableId: 441,
        baseType: "type/Float"
      },
      // Display name: Finish Position
      finishPosition: {
        type: "column",
        name: "finish_position",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3701,
        tableId: 441,
        baseType: "type/Integer"
      },
      // Display name: Gap To Pole S
      gapToPoleS: {
        type: "column",
        name: "gap_to_pole_s",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3718,
        tableId: 441,
        baseType: "type/Float"
      },
      // Display name: Gap To Winner S
      gapToWinnerS: {
        type: "column",
        name: "gap_to_winner_s",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3721,
        tableId: 441,
        baseType: "type/Float"
      },
      // Display name: Grid Position
      gridPosition: {
        type: "column",
        name: "grid_position",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3699,
        tableId: 441,
        baseType: "type/Integer"
      },
      // Display name: Is Dnf
      isDnf: {
        type: "column",
        name: "is_dnf",
        sourceName: "driver_results",
        jsType: "boolean",
        fieldId: 3707,
        tableId: 441,
        baseType: "type/Boolean"
      },
      // Display name: Is Dns
      isDns: {
        type: "column",
        name: "is_dns",
        sourceName: "driver_results",
        jsType: "boolean",
        fieldId: 3709,
        tableId: 441,
        baseType: "type/Boolean"
      },
      // Display name: Is Dsq
      isDsq: {
        type: "column",
        name: "is_dsq",
        sourceName: "driver_results",
        jsType: "boolean",
        fieldId: 3708,
        tableId: 441,
        baseType: "type/Boolean"
      },
      // Display name: Is Podium
      isPodium: {
        type: "column",
        name: "is_podium",
        sourceName: "driver_results",
        jsType: "boolean",
        fieldId: 3705,
        tableId: 441,
        baseType: "type/Boolean"
      },
      // Display name: Is Points Finish
      isPointsFinish: {
        type: "column",
        name: "is_points_finish",
        sourceName: "driver_results",
        jsType: "boolean",
        fieldId: 3706,
        tableId: 441,
        baseType: "type/Boolean"
      },
      // Display name: Is Points Session
      isPointsSession: {
        type: "column",
        name: "is_points_session",
        sourceName: "driver_results",
        jsType: "boolean",
        fieldId: 3692,
        tableId: 441,
        baseType: "type/Boolean"
      },
      // Display name: Is Pole
      isPole: {
        type: "column",
        name: "is_pole",
        sourceName: "driver_results",
        jsType: "boolean",
        fieldId: 3710,
        tableId: 441,
        baseType: "type/Boolean"
      },
      // Display name: Is Win
      isWin: {
        type: "column",
        name: "is_win",
        sourceName: "driver_results",
        jsType: "boolean",
        fieldId: 3704,
        tableId: 441,
        baseType: "type/Boolean"
      },
      // Display name: Laps Completed
      lapsCompleted: {
        type: "column",
        name: "laps_completed",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3723,
        tableId: 441,
        baseType: "type/Integer"
      },
      // Display name: Pit Stops
      pitStops: {
        type: "column",
        name: "pit_stops",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3724,
        tableId: 441,
        baseType: "type/Integer"
      },
      // Display name: Points
      points: {
        type: "column",
        name: "points",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3712,
        tableId: 441,
        baseType: "type/Float"
      },
      // Display name: Points Missing
      pointsMissing: {
        type: "column",
        name: "points_missing",
        sourceName: "driver_results",
        jsType: "boolean",
        fieldId: 3711,
        tableId: 441,
        baseType: "type/Boolean"
      },
      // Display name: Positions Gained
      positionsGained: {
        type: "column",
        name: "positions_gained",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3713,
        tableId: 441,
        baseType: "type/Integer"
      },
      // Display name: Q1 S
      q1S: {
        type: "column",
        name: "q1_s",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3714,
        tableId: 441,
        baseType: "type/Float"
      },
      // Display name: Q2 S
      q2S: {
        type: "column",
        name: "q2_s",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3715,
        tableId: 441,
        baseType: "type/Float"
      },
      // Display name: Q3 S
      q3S: {
        type: "column",
        name: "q3_s",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3716,
        tableId: 441,
        baseType: "type/Float"
      },
      // Display name: Quali Knockout Stage
      // Semantic type: type/Category
      qualiKnockoutStage: {
        type: "column",
        name: "quali_knockout_stage",
        sourceName: "driver_results",
        jsType: "string",
        fieldId: 3719,
        tableId: 441,
        baseType: "type/Text"
      },
      // Display name: Race Time S
      raceTimeS: {
        type: "column",
        name: "race_time_s",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3720,
        tableId: 441,
        baseType: "type/Float"
      },
      // Display name: Result Status
      // Semantic type: type/Category
      resultStatus: {
        type: "column",
        name: "result_status",
        sourceName: "driver_results",
        jsType: "string",
        fieldId: 3703,
        tableId: 441,
        baseType: "type/Text"
      },
      // Display name: Round
      round: {
        type: "column",
        name: "round",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3687,
        tableId: 441,
        baseType: "type/Integer"
      },
      // Display name: Season Points To Date
      seasonPointsToDate: {
        type: "column",
        name: "season_points_to_date",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3727,
        tableId: 441,
        baseType: "type/Float"
      },
      // Display name: Session Date
      sessionDate: {
        type: "column",
        name: "session_date",
        sourceName: "driver_results",
        jsType: "Date",
        fieldId: 3693,
        tableId: 441,
        baseType: "type/Date"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3685,
        tableId: 441,
        baseType: "type/Integer"
      },
      // Display name: Session Name
      // Semantic type: type/Category
      sessionName: {
        type: "column",
        name: "session_name",
        sourceName: "driver_results",
        jsType: "string",
        fieldId: 3690,
        tableId: 441,
        baseType: "type/Text"
      },
      // Display name: Session Type
      // Semantic type: type/Category
      sessionType: {
        type: "column",
        name: "session_type",
        sourceName: "driver_results",
        jsType: "string",
        fieldId: 3691,
        tableId: 441,
        baseType: "type/Text"
      },
      // Display name: Starting Position
      startingPosition: {
        type: "column",
        name: "starting_position",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3700,
        tableId: 441,
        baseType: "type/Integer"
      },
      // Display name: Team Color
      // Semantic type: type/Category
      teamColor: {
        type: "column",
        name: "team_color",
        sourceName: "driver_results",
        jsType: "string",
        fieldId: 3698,
        tableId: 441,
        baseType: "type/Text"
      },
      // Display name: Team Name
      // Semantic type: type/Category
      teamName: {
        type: "column",
        name: "team_name",
        sourceName: "driver_results",
        jsType: "string",
        fieldId: 3697,
        tableId: 441,
        baseType: "type/Text"
      },
      // Display name: Team Season Points To Date
      teamSeasonPointsToDate: {
        type: "column",
        name: "team_season_points_to_date",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3728,
        tableId: 441,
        baseType: "type/Float"
      },
      // Display name: Teammate Code
      // Semantic type: type/Category
      teammateCode: {
        type: "column",
        name: "teammate_code",
        sourceName: "driver_results",
        jsType: "string",
        fieldId: 3725,
        tableId: 441,
        baseType: "type/Text"
      },
      // Display name: Year
      year: {
        type: "column",
        name: "year",
        sourceName: "driver_results",
        jsType: "number",
        fieldId: 3686,
        tableId: 441,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: ac36
  events: {
    type: "table",
    id: 426,
    name: "Events",
    fields: {
      // Display name: Event Code
      // Semantic type: type/PK
      eventCode: {
        type: "column",
        name: "event_code",
        sourceName: "events",
        jsType: "string",
        fieldId: 3456,
        tableId: 426,
        baseType: "type/Text"
      },
      // Display name: Event Name
      // Semantic type: type/Category
      eventName: {
        type: "column",
        name: "event_name",
        sourceName: "events",
        jsType: "string",
        fieldId: 3457,
        tableId: 426,
        baseType: "type/Text"
      },
      // Display name: Race Count
      // Semantic type: type/Quantity
      raceCount: {
        type: "column",
        name: "race_count",
        sourceName: "events",
        jsType: "number",
        fieldId: 3459,
        tableId: 426,
        baseType: "type/Integer"
      },
      // Display name: Year
      year: {
        type: "column",
        name: "year",
        sourceName: "events",
        jsType: "number",
        fieldId: 3458,
        tableId: 426,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: lap_telemetry
  lapTelemetry: {
    type: "table",
    id: 414,
    name: "Lap Telemetry",
    fields: {
      // Display name: Brake
      brake: {
        type: "column",
        name: "brake",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3348,
        tableId: 414,
        baseType: "type/Integer"
      },
      // Display name: Corner Number
      // Semantic type: type/Quantity
      cornerNumber: {
        type: "column",
        name: "corner_number",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3356,
        tableId: 414,
        baseType: "type/Integer"
      },
      // Display name: Distance M
      distanceM: {
        type: "column",
        name: "distance_m",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3342,
        tableId: 414,
        baseType: "type/Float"
      },
      // Display name: Driver Number
      // Semantic type: type/PK
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3337,
        tableId: 414,
        baseType: "type/Integer"
      },
      // Display name: Drs
      drs: {
        type: "column",
        name: "drs",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3349,
        tableId: 414,
        baseType: "type/Integer"
      },
      // Display name: G Lat
      // Semantic type: type/Latitude
      gLat: {
        type: "column",
        name: "g_lat",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3354,
        tableId: 414,
        baseType: "type/Float"
      },
      // Display name: G Long
      // Semantic type: type/Longitude
      gLong: {
        type: "column",
        name: "g_long",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3353,
        tableId: 414,
        baseType: "type/Float"
      },
      // Display name: G Total
      gTotal: {
        type: "column",
        name: "g_total",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3355,
        tableId: 414,
        baseType: "type/Float"
      },
      // Display name: Gear
      gear: {
        type: "column",
        name: "gear",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3346,
        tableId: 414,
        baseType: "type/Integer"
      },
      // Display name: Lap Number
      // Semantic type: type/PK
      lapNumber: {
        type: "column",
        name: "lap_number",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3338,
        tableId: 414,
        baseType: "type/Integer"
      },
      // Display name: Rel Distance
      relDistance: {
        type: "column",
        name: "rel_distance",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3343,
        tableId: 414,
        baseType: "type/Float"
      },
      // Display name: Rpm
      rpm: {
        type: "column",
        name: "rpm",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3345,
        tableId: 414,
        baseType: "type/Float"
      },
      // Display name: Sample
      // Semantic type: type/PK
      sample: {
        type: "column",
        name: "sample",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3339,
        tableId: 414,
        baseType: "type/Integer"
      },
      // Display name: Session ID
      // Semantic type: type/PK
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3336,
        tableId: 414,
        baseType: "type/Integer"
      },
      // Display name: Session Time Ms
      sessionTimeMs: {
        type: "column",
        name: "session_time_ms",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3340,
        tableId: 414,
        baseType: "type/BigInteger"
      },
      // Display name: Speed
      speed: {
        type: "column",
        name: "speed",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3344,
        tableId: 414,
        baseType: "type/Float"
      },
      // Display name: Throttle
      throttle: {
        type: "column",
        name: "throttle",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3347,
        tableId: 414,
        baseType: "type/Float"
      },
      // Display name: Time In Lap Ms
      timeInLapMs: {
        type: "column",
        name: "time_in_lap_ms",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3341,
        tableId: 414,
        baseType: "type/BigInteger"
      },
      // Display name: X
      x: {
        type: "column",
        name: "x",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3350,
        tableId: 414,
        baseType: "type/Float"
      },
      // Display name: Y
      y: {
        type: "column",
        name: "y",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3351,
        tableId: 414,
        baseType: "type/Float"
      },
      // Display name: Z
      z: {
        type: "column",
        name: "z",
        sourceName: "lap_telemetry",
        jsType: "number",
        fieldId: 3352,
        tableId: 414,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1_analytics
  // Table: lap_times
  lapTimes: {
    type: "table",
    id: 442,
    name: "Lap Times",
    fields: {
      // Display name: Compound
      // Semantic type: type/Category
      compound: {
        type: "column",
        name: "compound",
        sourceName: "lap_times",
        jsType: "string",
        fieldId: 3753,
        tableId: 442,
        baseType: "type/Text"
      },
      // Display name: Driver Code
      // Semantic type: type/Category
      driverCode: {
        type: "column",
        name: "driver_code",
        sourceName: "lap_times",
        jsType: "string",
        fieldId: 3739,
        tableId: 442,
        baseType: "type/Text"
      },
      // Display name: Driver Name
      // Semantic type: type/Category
      driverName: {
        type: "column",
        name: "driver_name",
        sourceName: "lap_times",
        jsType: "string",
        fieldId: 3740,
        tableId: 442,
        baseType: "type/Text"
      },
      // Display name: Driver Number
      // Semantic type: type/Quantity
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3738,
        tableId: 442,
        baseType: "type/Integer"
      },
      // Display name: Event Label
      // Semantic type: type/Category
      eventLabel: {
        type: "column",
        name: "event_label",
        sourceName: "lap_times",
        jsType: "string",
        fieldId: 3733,
        tableId: 442,
        baseType: "type/Text"
      },
      // Display name: Event Name
      // Semantic type: type/Category
      eventName: {
        type: "column",
        name: "event_name",
        sourceName: "lap_times",
        jsType: "string",
        fieldId: 3732,
        tableId: 442,
        baseType: "type/Text"
      },
      // Display name: Is Accurate
      isAccurate: {
        type: "column",
        name: "is_accurate",
        sourceName: "lap_times",
        jsType: "boolean",
        fieldId: 3763,
        tableId: 442,
        baseType: "type/Boolean"
      },
      // Display name: Is Clean Lap
      isCleanLap: {
        type: "column",
        name: "is_clean_lap",
        sourceName: "lap_times",
        jsType: "boolean",
        fieldId: 3764,
        tableId: 442,
        baseType: "type/Boolean"
      },
      // Display name: Is Deleted
      isDeleted: {
        type: "column",
        name: "is_deleted",
        sourceName: "lap_times",
        jsType: "boolean",
        fieldId: 3762,
        tableId: 442,
        baseType: "type/Boolean"
      },
      // Display name: Is Fresh Tyre
      isFreshTyre: {
        type: "column",
        name: "is_fresh_tyre",
        sourceName: "lap_times",
        jsType: "boolean",
        fieldId: 3755,
        tableId: 442,
        baseType: "type/Boolean"
      },
      // Display name: Is Green Flag Lap
      isGreenFlagLap: {
        type: "column",
        name: "is_green_flag_lap",
        sourceName: "lap_times",
        jsType: "boolean",
        fieldId: 3761,
        tableId: 442,
        baseType: "type/Boolean"
      },
      // Display name: Is Personal Best
      isPersonalBest: {
        type: "column",
        name: "is_personal_best",
        sourceName: "lap_times",
        jsType: "boolean",
        fieldId: 3766,
        tableId: 442,
        baseType: "type/Boolean"
      },
      // Display name: Is Pit In Lap
      isPitInLap: {
        type: "column",
        name: "is_pit_in_lap",
        sourceName: "lap_times",
        jsType: "boolean",
        fieldId: 3757,
        tableId: 442,
        baseType: "type/Boolean"
      },
      // Display name: Is Pit Out Lap
      isPitOutLap: {
        type: "column",
        name: "is_pit_out_lap",
        sourceName: "lap_times",
        jsType: "boolean",
        fieldId: 3758,
        tableId: 442,
        baseType: "type/Boolean"
      },
      // Display name: Is Points Session
      isPointsSession: {
        type: "column",
        name: "is_points_session",
        sourceName: "lap_times",
        jsType: "boolean",
        fieldId: 3736,
        tableId: 442,
        baseType: "type/Boolean"
      },
      // Display name: Lap Number
      // Semantic type: type/Quantity
      lapNumber: {
        type: "column",
        name: "lap_number",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3743,
        tableId: 442,
        baseType: "type/Integer"
      },
      // Display name: Lap Time S
      lapTimeS: {
        type: "column",
        name: "lap_time_s",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3745,
        tableId: 442,
        baseType: "type/Float"
      },
      // Display name: Pace Delta S
      paceDeltaS: {
        type: "column",
        name: "pace_delta_s",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3765,
        tableId: 442,
        baseType: "type/Float"
      },
      // Display name: Position
      position: {
        type: "column",
        name: "position",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3756,
        tableId: 442,
        baseType: "type/Integer"
      },
      // Display name: Round
      round: {
        type: "column",
        name: "round",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3731,
        tableId: 442,
        baseType: "type/Integer"
      },
      // Display name: Sector1 S
      sector1S: {
        type: "column",
        name: "sector1_s",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3746,
        tableId: 442,
        baseType: "type/Float"
      },
      // Display name: Sector2 S
      sector2S: {
        type: "column",
        name: "sector2_s",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3747,
        tableId: 442,
        baseType: "type/Float"
      },
      // Display name: Sector3 S
      sector3S: {
        type: "column",
        name: "sector3_s",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3748,
        tableId: 442,
        baseType: "type/Float"
      },
      // Display name: Session Date
      sessionDate: {
        type: "column",
        name: "session_date",
        sourceName: "lap_times",
        jsType: "Date",
        fieldId: 3737,
        tableId: 442,
        baseType: "type/Date"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3729,
        tableId: 442,
        baseType: "type/Integer"
      },
      // Display name: Session Name
      // Semantic type: type/Category
      sessionName: {
        type: "column",
        name: "session_name",
        sourceName: "lap_times",
        jsType: "string",
        fieldId: 3734,
        tableId: 442,
        baseType: "type/Text"
      },
      // Display name: Session Type
      // Semantic type: type/Category
      sessionType: {
        type: "column",
        name: "session_type",
        sourceName: "lap_times",
        jsType: "string",
        fieldId: 3735,
        tableId: 442,
        baseType: "type/Text"
      },
      // Display name: Speed Finish Line Kph
      speedFinishLineKph: {
        type: "column",
        name: "speed_finish_line_kph",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3752,
        tableId: 442,
        baseType: "type/Float"
      },
      // Display name: Speed I1 Kph
      speedI1Kph: {
        type: "column",
        name: "speed_i1_kph",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3750,
        tableId: 442,
        baseType: "type/Float"
      },
      // Display name: Speed I2 Kph
      speedI2Kph: {
        type: "column",
        name: "speed_i2_kph",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3751,
        tableId: 442,
        baseType: "type/Float"
      },
      // Display name: Speed Trap Kph
      speedTrapKph: {
        type: "column",
        name: "speed_trap_kph",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3749,
        tableId: 442,
        baseType: "type/Float"
      },
      // Display name: Stint
      stint: {
        type: "column",
        name: "stint",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3744,
        tableId: 442,
        baseType: "type/Integer"
      },
      // Display name: Team Color
      // Semantic type: type/Category
      teamColor: {
        type: "column",
        name: "team_color",
        sourceName: "lap_times",
        jsType: "string",
        fieldId: 3742,
        tableId: 442,
        baseType: "type/Text"
      },
      // Display name: Team Name
      // Semantic type: type/Category
      teamName: {
        type: "column",
        name: "team_name",
        sourceName: "lap_times",
        jsType: "string",
        fieldId: 3741,
        tableId: 442,
        baseType: "type/Text"
      },
      // Display name: Track Condition
      // Semantic type: type/Category
      trackCondition: {
        type: "column",
        name: "track_condition",
        sourceName: "lap_times",
        jsType: "string",
        fieldId: 3760,
        tableId: 442,
        baseType: "type/Text"
      },
      // Display name: Track Status Code
      // Semantic type: type/Category
      trackStatusCode: {
        type: "column",
        name: "track_status_code",
        sourceName: "lap_times",
        jsType: "string",
        fieldId: 3759,
        tableId: 442,
        baseType: "type/Text"
      },
      // Display name: Tyre Age Laps
      tyreAgeLaps: {
        type: "column",
        name: "tyre_age_laps",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3754,
        tableId: 442,
        baseType: "type/Integer"
      },
      // Display name: Year
      year: {
        type: "column",
        name: "year",
        sourceName: "lap_times",
        jsType: "number",
        fieldId: 3730,
        tableId: 442,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  laps: {
    type: "table",
    id: 415,
    name: "Laps",
    fields: {
      // Display name: Compound
      // Semantic type: type/Category
      compound: {
        type: "column",
        name: "compound",
        sourceName: "laps",
        jsType: "string",
        fieldId: 3324,
        tableId: 415,
        baseType: "type/Text"
      },
      // Display name: Deleted
      deleted: {
        type: "column",
        name: "deleted",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3334,
        tableId: 415,
        baseType: "type/Integer"
      },
      // Display name: Driver
      // Semantic type: type/Category
      driver: {
        type: "column",
        name: "driver",
        sourceName: "laps",
        jsType: "string",
        fieldId: 3312,
        tableId: 415,
        baseType: "type/Text"
      },
      // Display name: Driver Number
      // Semantic type: type/PK
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3311,
        tableId: 415,
        baseType: "type/Integer"
      },
      // Display name: Fresh Tyre
      freshTyre: {
        type: "column",
        name: "fresh_tyre",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3326,
        tableId: 415,
        baseType: "type/Integer"
      },
      // Display name: Is Accurate
      isAccurate: {
        type: "column",
        name: "is_accurate",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3335,
        tableId: 415,
        baseType: "type/Integer"
      },
      // Display name: Is Personal Best
      isPersonalBest: {
        type: "column",
        name: "is_personal_best",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3333,
        tableId: 415,
        baseType: "type/Integer"
      },
      // Display name: Lap End Ms
      lapEndMs: {
        type: "column",
        name: "lap_end_ms",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3330,
        tableId: 415,
        baseType: "type/BigInteger"
      },
      // Display name: Lap Number
      // Semantic type: type/PK
      lapNumber: {
        type: "column",
        name: "lap_number",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3314,
        tableId: 415,
        baseType: "type/Integer"
      },
      // Display name: Lap Start Ms
      lapStartMs: {
        type: "column",
        name: "lap_start_ms",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3329,
        tableId: 415,
        baseType: "type/BigInteger"
      },
      // Display name: Lap Time Ms
      lapTimeMs: {
        type: "column",
        name: "lap_time_ms",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3316,
        tableId: 415,
        baseType: "type/BigInteger"
      },
      // Display name: Pit In Ms
      pitInMs: {
        type: "column",
        name: "pit_in_ms",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3327,
        tableId: 415,
        baseType: "type/BigInteger"
      },
      // Display name: Pit Out Ms
      pitOutMs: {
        type: "column",
        name: "pit_out_ms",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3328,
        tableId: 415,
        baseType: "type/BigInteger"
      },
      // Display name: Position
      position: {
        type: "column",
        name: "position",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3332,
        tableId: 415,
        baseType: "type/Float"
      },
      // Display name: Sector1 Ms
      sector1Ms: {
        type: "column",
        name: "sector1_ms",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3317,
        tableId: 415,
        baseType: "type/BigInteger"
      },
      // Display name: Sector2 Ms
      sector2Ms: {
        type: "column",
        name: "sector2_ms",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3318,
        tableId: 415,
        baseType: "type/BigInteger"
      },
      // Display name: Sector3 Ms
      sector3Ms: {
        type: "column",
        name: "sector3_ms",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3319,
        tableId: 415,
        baseType: "type/BigInteger"
      },
      // Display name: Session ID
      // Semantic type: type/PK
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3310,
        tableId: 415,
        baseType: "type/Integer"
      },
      // Display name: Speed Fl
      speedFl: {
        type: "column",
        name: "speed_fl",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3322,
        tableId: 415,
        baseType: "type/Float"
      },
      // Display name: Speed I1
      speedI1: {
        type: "column",
        name: "speed_i1",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3320,
        tableId: 415,
        baseType: "type/Float"
      },
      // Display name: Speed I2
      speedI2: {
        type: "column",
        name: "speed_i2",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3321,
        tableId: 415,
        baseType: "type/Float"
      },
      // Display name: Speed St
      speedSt: {
        type: "column",
        name: "speed_st",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3323,
        tableId: 415,
        baseType: "type/Float"
      },
      // Display name: Stint
      stint: {
        type: "column",
        name: "stint",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3315,
        tableId: 415,
        baseType: "type/Integer"
      },
      // Display name: Team
      // Semantic type: type/Category
      team: {
        type: "column",
        name: "team",
        sourceName: "laps",
        jsType: "string",
        fieldId: 3313,
        tableId: 415,
        baseType: "type/Text"
      },
      // Display name: Track Status
      // Semantic type: type/Category
      trackStatus: {
        type: "column",
        name: "track_status",
        sourceName: "laps",
        jsType: "string",
        fieldId: 3331,
        tableId: 415,
        baseType: "type/Text"
      },
      // Display name: Tyre Life
      tyreLife: {
        type: "column",
        name: "tyre_life",
        sourceName: "laps",
        jsType: "number",
        fieldId: 3325,
        tableId: 415,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: load_log
  loadLog: {
    type: "table",
    id: 416,
    name: "Load Log",
    fields: {
      // Display name: Car Rows
      carRows: {
        type: "column",
        name: "car_rows",
        sourceName: "load_log",
        jsType: "number",
        fieldId: 3360,
        tableId: 416,
        baseType: "type/BigInteger"
      },
      // Display name: Detail
      // Semantic type: type/Category
      detail: {
        type: "column",
        name: "detail",
        sourceName: "load_log",
        jsType: "string",
        fieldId: 3359,
        tableId: 416,
        baseType: "type/Text"
      },
      // Display name: Loaded At
      loadedAt: {
        type: "column",
        name: "loaded_at",
        sourceName: "load_log",
        jsType: "Date",
        fieldId: 3362,
        tableId: 416,
        baseType: "type/DateTime"
      },
      // Display name: Pos Rows
      posRows: {
        type: "column",
        name: "pos_rows",
        sourceName: "load_log",
        jsType: "number",
        fieldId: 3361,
        tableId: 416,
        baseType: "type/BigInteger"
      },
      // Display name: Session ID
      // Semantic type: type/PK
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "load_log",
        jsType: "number",
        fieldId: 3357,
        tableId: 416,
        baseType: "type/Integer"
      },
      // Display name: Status
      // Semantic type: type/State
      status: {
        type: "column",
        name: "status",
        sourceName: "load_log",
        jsType: "string",
        fieldId: 3358,
        tableId: 416,
        baseType: "type/Text"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: mimic_latest
  mimicLatest: {
    type: "table",
    id: 433,
    name: "Mimic Latest",
    fields: {
      // Display name: Brake
      brake: {
        type: "column",
        name: "brake",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3587,
        tableId: 433,
        baseType: "type/Integer"
      },
      // Display name: Driver Number
      // Semantic type: type/PK
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3579,
        tableId: 433,
        baseType: "type/Integer"
      },
      // Display name: Drs
      drs: {
        type: "column",
        name: "drs",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3588,
        tableId: 433,
        baseType: "type/Integer"
      },
      // Display name: Event Ts
      eventTs: {
        type: "column",
        name: "event_ts",
        sourceName: "mimic_latest",
        jsType: "Date",
        fieldId: 3576,
        tableId: 433,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Gear
      gear: {
        type: "column",
        name: "gear",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3585,
        tableId: 433,
        baseType: "type/Integer"
      },
      // Display name: Lap
      lap: {
        type: "column",
        name: "lap",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3581,
        tableId: 433,
        baseType: "type/Integer"
      },
      // Display name: Position
      position: {
        type: "column",
        name: "position",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3582,
        tableId: 433,
        baseType: "type/Integer"
      },
      // Display name: Rpm
      rpm: {
        type: "column",
        name: "rpm",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3584,
        tableId: 433,
        baseType: "type/Float"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3578,
        tableId: 433,
        baseType: "type/Integer"
      },
      // Display name: Session Key
      // Semantic type: type/PK
      sessionKey: {
        type: "column",
        name: "session_key",
        sourceName: "mimic_latest",
        jsType: "string",
        fieldId: 3577,
        tableId: 433,
        baseType: "type/Text"
      },
      // Display name: Session Time Ms
      sessionTimeMs: {
        type: "column",
        name: "session_time_ms",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3580,
        tableId: 433,
        baseType: "type/BigInteger"
      },
      // Display name: Speed
      speed: {
        type: "column",
        name: "speed",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3583,
        tableId: 433,
        baseType: "type/Float"
      },
      // Display name: Throttle
      throttle: {
        type: "column",
        name: "throttle",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3586,
        tableId: 433,
        baseType: "type/Float"
      },
      // Display name: X
      x: {
        type: "column",
        name: "x",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3589,
        tableId: 433,
        baseType: "type/Float"
      },
      // Display name: Y
      y: {
        type: "column",
        name: "y",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3590,
        tableId: 433,
        baseType: "type/Float"
      },
      // Display name: Z
      z: {
        type: "column",
        name: "z",
        sourceName: "mimic_latest",
        jsType: "number",
        fieldId: 3591,
        tableId: 433,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: mimic_latest_mv
  mimicLatestMv: {
    type: "table",
    id: 434,
    name: "Mimic Latest Mv",
    fields: {
      // Display name: Brake
      brake: {
        type: "column",
        name: "brake",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3603,
        tableId: 434,
        baseType: "type/Integer"
      },
      // Display name: Driver Number
      // Semantic type: type/Quantity
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3595,
        tableId: 434,
        baseType: "type/Integer"
      },
      // Display name: Drs
      drs: {
        type: "column",
        name: "drs",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3604,
        tableId: 434,
        baseType: "type/Integer"
      },
      // Display name: Event Ts
      eventTs: {
        type: "column",
        name: "event_ts",
        sourceName: "mimic_latest_mv",
        jsType: "Date",
        fieldId: 3592,
        tableId: 434,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Gear
      gear: {
        type: "column",
        name: "gear",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3601,
        tableId: 434,
        baseType: "type/Integer"
      },
      // Display name: Lap
      lap: {
        type: "column",
        name: "lap",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3597,
        tableId: 434,
        baseType: "type/Integer"
      },
      // Display name: Position
      position: {
        type: "column",
        name: "position",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3598,
        tableId: 434,
        baseType: "type/Integer"
      },
      // Display name: Rpm
      rpm: {
        type: "column",
        name: "rpm",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3600,
        tableId: 434,
        baseType: "type/Float"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3594,
        tableId: 434,
        baseType: "type/Integer"
      },
      // Display name: Session Key
      // Semantic type: type/Category
      sessionKey: {
        type: "column",
        name: "session_key",
        sourceName: "mimic_latest_mv",
        jsType: "string",
        fieldId: 3593,
        tableId: 434,
        baseType: "type/Text"
      },
      // Display name: Session Time Ms
      sessionTimeMs: {
        type: "column",
        name: "session_time_ms",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3596,
        tableId: 434,
        baseType: "type/BigInteger"
      },
      // Display name: Speed
      speed: {
        type: "column",
        name: "speed",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3599,
        tableId: 434,
        baseType: "type/Float"
      },
      // Display name: Throttle
      throttle: {
        type: "column",
        name: "throttle",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3602,
        tableId: 434,
        baseType: "type/Float"
      },
      // Display name: X
      x: {
        type: "column",
        name: "x",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3605,
        tableId: 434,
        baseType: "type/Float"
      },
      // Display name: Y
      y: {
        type: "column",
        name: "y",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3606,
        tableId: 434,
        baseType: "type/Float"
      },
      // Display name: Z
      z: {
        type: "column",
        name: "z",
        sourceName: "mimic_latest_mv",
        jsType: "number",
        fieldId: 3607,
        tableId: 434,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: mimic_session
  mimicSession: {
    type: "table",
    id: 435,
    name: "Mimic Session",
    fields: {
      // Display name: Current Lap
      currentLap: {
        type: "column",
        name: "current_lap",
        sourceName: "mimic_session",
        jsType: "number",
        fieldId: 3615,
        tableId: 435,
        baseType: "type/Integer"
      },
      // Display name: Event Name
      // Semantic type: type/Category
      eventName: {
        type: "column",
        name: "event_name",
        sourceName: "mimic_session",
        jsType: "string",
        fieldId: 3611,
        tableId: 435,
        baseType: "type/Text"
      },
      // Display name: Progress
      progress: {
        type: "column",
        name: "progress",
        sourceName: "mimic_session",
        jsType: "number",
        fieldId: 3617,
        tableId: 435,
        baseType: "type/Float"
      },
      // Display name: Rows Sent
      rowsSent: {
        type: "column",
        name: "rows_sent",
        sourceName: "mimic_session",
        jsType: "number",
        fieldId: 3618,
        tableId: 435,
        baseType: "type/BigInteger"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "mimic_session",
        jsType: "number",
        fieldId: 3609,
        tableId: 435,
        baseType: "type/Integer"
      },
      // Display name: Session Key
      // Semantic type: type/PK
      sessionKey: {
        type: "column",
        name: "session_key",
        sourceName: "mimic_session",
        jsType: "string",
        fieldId: 3608,
        tableId: 435,
        baseType: "type/Text"
      },
      // Display name: Session Name
      // Semantic type: type/Category
      sessionName: {
        type: "column",
        name: "session_name",
        sourceName: "mimic_session",
        jsType: "string",
        fieldId: 3612,
        tableId: 435,
        baseType: "type/Text"
      },
      // Display name: Speed
      speed: {
        type: "column",
        name: "speed",
        sourceName: "mimic_session",
        jsType: "number",
        fieldId: 3613,
        tableId: 435,
        baseType: "type/Float"
      },
      // Display name: Started At
      // Semantic type: type/CreationTimestamp
      startedAt: {
        type: "column",
        name: "started_at",
        sourceName: "mimic_session",
        jsType: "Date",
        fieldId: 3619,
        tableId: 435,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Status
      // Semantic type: type/Category
      status: {
        type: "column",
        name: "status",
        sourceName: "mimic_session",
        jsType: "string",
        fieldId: 3614,
        tableId: 435,
        baseType: "type/Text"
      },
      // Display name: Total Laps
      totalLaps: {
        type: "column",
        name: "total_laps",
        sourceName: "mimic_session",
        jsType: "number",
        fieldId: 3616,
        tableId: 435,
        baseType: "type/Integer"
      },
      // Display name: Updated At
      // Semantic type: type/UpdatedTimestamp
      updatedAt: {
        type: "column",
        name: "updated_at",
        sourceName: "mimic_session",
        jsType: "Date",
        fieldId: 3620,
        tableId: 435,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Year
      year: {
        type: "column",
        name: "year",
        sourceName: "mimic_session",
        jsType: "number",
        fieldId: 3610,
        tableId: 435,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: mimic_telemetry
  mimicTelemetry: {
    type: "table",
    id: 436,
    name: "Mimic Telemetry",
    fields: {
      // Display name: Brake
      brake: {
        type: "column",
        name: "brake",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3633,
        tableId: 436,
        baseType: "type/Integer"
      },
      // Display name: Driver Number
      // Semantic type: type/PK
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3625,
        tableId: 436,
        baseType: "type/Integer"
      },
      // Display name: Drs
      drs: {
        type: "column",
        name: "drs",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3634,
        tableId: 436,
        baseType: "type/Integer"
      },
      // Display name: Event Ts
      // Semantic type: type/PK
      eventTs: {
        type: "column",
        name: "event_ts",
        sourceName: "mimic_telemetry",
        jsType: "Date",
        fieldId: 3622,
        tableId: 436,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Gear
      gear: {
        type: "column",
        name: "gear",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3631,
        tableId: 436,
        baseType: "type/Integer"
      },
      // Display name: Ingest Ts
      ingestTs: {
        type: "column",
        name: "ingest_ts",
        sourceName: "mimic_telemetry",
        jsType: "Date",
        fieldId: 3621,
        tableId: 436,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Lap
      lap: {
        type: "column",
        name: "lap",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3627,
        tableId: 436,
        baseType: "type/Integer"
      },
      // Display name: Position
      position: {
        type: "column",
        name: "position",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3628,
        tableId: 436,
        baseType: "type/Integer"
      },
      // Display name: Rpm
      rpm: {
        type: "column",
        name: "rpm",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3630,
        tableId: 436,
        baseType: "type/Float"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3624,
        tableId: 436,
        baseType: "type/Integer"
      },
      // Display name: Session Key
      // Semantic type: type/PK
      sessionKey: {
        type: "column",
        name: "session_key",
        sourceName: "mimic_telemetry",
        jsType: "string",
        fieldId: 3623,
        tableId: 436,
        baseType: "type/Text"
      },
      // Display name: Session Time Ms
      sessionTimeMs: {
        type: "column",
        name: "session_time_ms",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3626,
        tableId: 436,
        baseType: "type/BigInteger"
      },
      // Display name: Speed
      speed: {
        type: "column",
        name: "speed",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3629,
        tableId: 436,
        baseType: "type/Float"
      },
      // Display name: Throttle
      throttle: {
        type: "column",
        name: "throttle",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3632,
        tableId: 436,
        baseType: "type/Float"
      },
      // Display name: X
      x: {
        type: "column",
        name: "x",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3635,
        tableId: 436,
        baseType: "type/Float"
      },
      // Display name: Y
      y: {
        type: "column",
        name: "y",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3636,
        tableId: 436,
        baseType: "type/Float"
      },
      // Display name: Z
      z: {
        type: "column",
        name: "z",
        sourceName: "mimic_telemetry",
        jsType: "number",
        fieldId: 3637,
        tableId: 436,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1_ops
  // Table: part_catalog
  partCatalog: {
    type: "table",
    id: 450,
    name: "Part Catalog",
    fields: {
      // Display name: Category
      // Semantic type: type/Category
      category: {
        type: "column",
        name: "category",
        sourceName: "part_catalog",
        jsType: "string",
        fieldId: 3956,
        tableId: 450,
        baseType: "type/Text"
      },
      // Display name: Expected Life Km
      expectedLifeKm: {
        type: "column",
        name: "expected_life_km",
        sourceName: "part_catalog",
        jsType: "number",
        fieldId: 3959,
        tableId: 450,
        baseType: "type/Integer"
      },
      // Display name: Is Simulated
      isSimulated: {
        type: "column",
        name: "is_simulated",
        sourceName: "part_catalog",
        jsType: "boolean",
        fieldId: 3960,
        tableId: 450,
        baseType: "type/Boolean"
      },
      // Display name: Notes
      // Semantic type: type/Category
      notes: {
        type: "column",
        name: "notes",
        sourceName: "part_catalog",
        jsType: "string",
        fieldId: 3961,
        tableId: 450,
        baseType: "type/Text"
      },
      // Display name: Part Name
      // Semantic type: type/Category
      partName: {
        type: "column",
        name: "part_name",
        sourceName: "part_catalog",
        jsType: "string",
        fieldId: 3955,
        tableId: 450,
        baseType: "type/Text"
      },
      // Display name: Part Type Code
      // Semantic type: type/Category
      partTypeCode: {
        type: "column",
        name: "part_type_code",
        sourceName: "part_catalog",
        jsType: "string",
        fieldId: 3954,
        tableId: 450,
        baseType: "type/Text"
      },
      // Display name: Season Allocation
      seasonAllocation: {
        type: "column",
        name: "season_allocation",
        sourceName: "part_catalog",
        jsType: "number",
        fieldId: 3957,
        tableId: 450,
        baseType: "type/Integer"
      },
      // Display name: Unit Cost Usd
      // Semantic type: type/Cost
      unitCostUsd: {
        type: "column",
        name: "unit_cost_usd",
        sourceName: "part_catalog",
        jsType: "number",
        fieldId: 3958,
        tableId: 450,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1_analytics
  // Table: pit_stops
  pitStops: {
    type: "table",
    id: 443,
    name: "Pit Stops",
    fields: {
      // Display name: Compound After
      // Semantic type: type/Category
      compoundAfter: {
        type: "column",
        name: "compound_after",
        sourceName: "pit_stops",
        jsType: "string",
        fieldId: 3785,
        tableId: 443,
        baseType: "type/Text"
      },
      // Display name: Compound Before
      // Semantic type: type/Category
      compoundBefore: {
        type: "column",
        name: "compound_before",
        sourceName: "pit_stops",
        jsType: "string",
        fieldId: 3784,
        tableId: 443,
        baseType: "type/Text"
      },
      // Display name: Driver Code
      // Semantic type: type/Category
      driverCode: {
        type: "column",
        name: "driver_code",
        sourceName: "pit_stops",
        jsType: "string",
        fieldId: 3777,
        tableId: 443,
        baseType: "type/Text"
      },
      // Display name: Driver Name
      // Semantic type: type/Category
      driverName: {
        type: "column",
        name: "driver_name",
        sourceName: "pit_stops",
        jsType: "string",
        fieldId: 3778,
        tableId: 443,
        baseType: "type/Text"
      },
      // Display name: Driver Number
      // Semantic type: type/Quantity
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "pit_stops",
        jsType: "number",
        fieldId: 3776,
        tableId: 443,
        baseType: "type/Integer"
      },
      // Display name: Event Label
      eventLabel: {
        type: "column",
        name: "event_label",
        sourceName: "pit_stops",
        jsType: "string",
        fieldId: 3771,
        tableId: 443,
        baseType: "type/Text"
      },
      // Display name: Event Name
      // Semantic type: type/Category
      eventName: {
        type: "column",
        name: "event_name",
        sourceName: "pit_stops",
        jsType: "string",
        fieldId: 3770,
        tableId: 443,
        baseType: "type/Text"
      },
      // Display name: In Lap
      inLap: {
        type: "column",
        name: "in_lap",
        sourceName: "pit_stops",
        jsType: "number",
        fieldId: 3782,
        tableId: 443,
        baseType: "type/Integer"
      },
      // Display name: Is Points Session
      isPointsSession: {
        type: "column",
        name: "is_points_session",
        sourceName: "pit_stops",
        jsType: "boolean",
        fieldId: 3774,
        tableId: 443,
        baseType: "type/Boolean"
      },
      // Display name: Is Red Flag Stop
      isRedFlagStop: {
        type: "column",
        name: "is_red_flag_stop",
        sourceName: "pit_stops",
        jsType: "boolean",
        fieldId: 3793,
        tableId: 443,
        baseType: "type/Boolean"
      },
      // Display name: Is Tyre Change
      isTyreChange: {
        type: "column",
        name: "is_tyre_change",
        sourceName: "pit_stops",
        jsType: "boolean",
        fieldId: 3786,
        tableId: 443,
        baseType: "type/Boolean"
      },
      // Display name: Pit Lane Time S
      pitLaneTimeS: {
        type: "column",
        name: "pit_lane_time_s",
        sourceName: "pit_stops",
        jsType: "number",
        fieldId: 3783,
        tableId: 443,
        baseType: "type/Float"
      },
      // Display name: Position After
      positionAfter: {
        type: "column",
        name: "position_after",
        sourceName: "pit_stops",
        jsType: "number",
        fieldId: 3789,
        tableId: 443,
        baseType: "type/Integer"
      },
      // Display name: Position Before
      positionBefore: {
        type: "column",
        name: "position_before",
        sourceName: "pit_stops",
        jsType: "number",
        fieldId: 3788,
        tableId: 443,
        baseType: "type/Integer"
      },
      // Display name: Positions Lost
      positionsLost: {
        type: "column",
        name: "positions_lost",
        sourceName: "pit_stops",
        jsType: "number",
        fieldId: 3790,
        tableId: 443,
        baseType: "type/Integer"
      },
      // Display name: Round
      round: {
        type: "column",
        name: "round",
        sourceName: "pit_stops",
        jsType: "number",
        fieldId: 3769,
        tableId: 443,
        baseType: "type/Integer"
      },
      // Display name: Session Date
      sessionDate: {
        type: "column",
        name: "session_date",
        sourceName: "pit_stops",
        jsType: "Date",
        fieldId: 3775,
        tableId: 443,
        baseType: "type/Date"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "pit_stops",
        jsType: "number",
        fieldId: 3767,
        tableId: 443,
        baseType: "type/Integer"
      },
      // Display name: Session Name
      // Semantic type: type/Category
      sessionName: {
        type: "column",
        name: "session_name",
        sourceName: "pit_stops",
        jsType: "string",
        fieldId: 3772,
        tableId: 443,
        baseType: "type/Text"
      },
      // Display name: Session Type
      // Semantic type: type/Category
      sessionType: {
        type: "column",
        name: "session_type",
        sourceName: "pit_stops",
        jsType: "string",
        fieldId: 3773,
        tableId: 443,
        baseType: "type/Text"
      },
      // Display name: Stop Number
      // Semantic type: type/Quantity
      stopNumber: {
        type: "column",
        name: "stop_number",
        sourceName: "pit_stops",
        jsType: "number",
        fieldId: 3781,
        tableId: 443,
        baseType: "type/Integer"
      },
      // Display name: Team Color
      // Semantic type: type/Category
      teamColor: {
        type: "column",
        name: "team_color",
        sourceName: "pit_stops",
        jsType: "string",
        fieldId: 3780,
        tableId: 443,
        baseType: "type/Text"
      },
      // Display name: Team Name
      // Semantic type: type/Category
      teamName: {
        type: "column",
        name: "team_name",
        sourceName: "pit_stops",
        jsType: "string",
        fieldId: 3779,
        tableId: 443,
        baseType: "type/Text"
      },
      // Display name: Track Condition In Lap
      // Semantic type: type/Category
      trackConditionInLap: {
        type: "column",
        name: "track_condition_in_lap",
        sourceName: "pit_stops",
        jsType: "string",
        fieldId: 3791,
        tableId: 443,
        baseType: "type/Text"
      },
      // Display name: Tyre Age Before
      tyreAgeBefore: {
        type: "column",
        name: "tyre_age_before",
        sourceName: "pit_stops",
        jsType: "number",
        fieldId: 3787,
        tableId: 443,
        baseType: "type/Integer"
      },
      // Display name: Under Caution
      underCaution: {
        type: "column",
        name: "under_caution",
        sourceName: "pit_stops",
        jsType: "boolean",
        fieldId: 3792,
        tableId: 443,
        baseType: "type/Boolean"
      },
      // Display name: Year
      year: {
        type: "column",
        name: "year",
        sourceName: "pit_stops",
        jsType: "number",
        fieldId: 3768,
        tableId: 443,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: position_data
  positionData: {
    type: "table",
    id: 417,
    name: "Position Data",
    fields: {
      // Display name: Driver Number
      // Semantic type: type/PK
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "position_data",
        jsType: "number",
        fieldId: 3364,
        tableId: 417,
        baseType: "type/Integer"
      },
      // Display name: On Track
      onTrack: {
        type: "column",
        name: "on_track",
        sourceName: "position_data",
        jsType: "number",
        fieldId: 3371,
        tableId: 417,
        baseType: "type/Integer"
      },
      // Display name: Session ID
      // Semantic type: type/PK
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "position_data",
        jsType: "number",
        fieldId: 3363,
        tableId: 417,
        baseType: "type/Integer"
      },
      // Display name: Session Time Ms
      // Semantic type: type/PK
      sessionTimeMs: {
        type: "column",
        name: "session_time_ms",
        sourceName: "position_data",
        jsType: "number",
        fieldId: 3367,
        tableId: 417,
        baseType: "type/BigInteger"
      },
      // Display name: Ts
      ts: {
        type: "column",
        name: "ts",
        sourceName: "position_data",
        jsType: "Date",
        fieldId: 3366,
        tableId: 417,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Ts Ms
      tsMs: {
        type: "column",
        name: "ts_ms",
        sourceName: "position_data",
        jsType: "number",
        fieldId: 3365,
        tableId: 417,
        baseType: "type/BigInteger"
      },
      // Display name: X
      x: {
        type: "column",
        name: "x",
        sourceName: "position_data",
        jsType: "number",
        fieldId: 3368,
        tableId: 417,
        baseType: "type/Float"
      },
      // Display name: Y
      y: {
        type: "column",
        name: "y",
        sourceName: "position_data",
        jsType: "number",
        fieldId: 3369,
        tableId: 417,
        baseType: "type/Float"
      },
      // Display name: Z
      z: {
        type: "column",
        name: "z",
        sourceName: "position_data",
        jsType: "number",
        fieldId: 3370,
        tableId: 417,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: ac36
  // Table: race_boats
  raceBoats: {
    type: "table",
    id: 427,
    name: "Race Boats",
    fields: {
      // Display name: Ave Speed Kn
      aveSpeedKn: {
        type: "column",
        name: "ave_speed_kn",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3469,
        tableId: 427,
        baseType: "type/Float"
      },
      // Display name: Boat Index
      // Semantic type: type/PK
      boatIndex: {
        type: "column",
        name: "boat_index",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3461,
        tableId: 427,
        baseType: "type/Integer"
      },
      // Display name: Country
      // Semantic type: type/Country
      country: {
        type: "column",
        name: "country",
        sourceName: "race_boats",
        jsType: "string",
        fieldId: 3463,
        tableId: 427,
        baseType: "type/Text"
      },
      // Display name: Delta Sec
      deltaSec: {
        type: "column",
        name: "delta_sec",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3467,
        tableId: 427,
        baseType: "type/Integer"
      },
      // Display name: Dist Sailed M
      distSailedM: {
        type: "column",
        name: "dist_sailed_m",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3468,
        tableId: 427,
        baseType: "type/Integer"
      },
      // Display name: Elapsed Sec
      elapsedSec: {
        type: "column",
        name: "elapsed_sec",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3466,
        tableId: 427,
        baseType: "type/Integer"
      },
      // Display name: Finish Ms
      finishMs: {
        type: "column",
        name: "finish_ms",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3475,
        tableId: 427,
        baseType: "type/Integer"
      },
      // Display name: Finish Time Utc
      finishTimeUtc: {
        type: "column",
        name: "finish_time_utc",
        sourceName: "race_boats",
        jsType: "Date",
        fieldId: 3476,
        tableId: 427,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Finished
      finished: {
        type: "column",
        name: "finished",
        sourceName: "race_boats",
        jsType: "boolean",
        fieldId: 3478,
        tableId: 427,
        baseType: "type/Boolean"
      },
      // Display name: Has Stats
      hasStats: {
        type: "column",
        name: "has_stats",
        sourceName: "race_boats",
        jsType: "boolean",
        fieldId: 3479,
        tableId: 427,
        baseType: "type/Boolean"
      },
      // Display name: Has Telemetry
      hasTelemetry: {
        type: "column",
        name: "has_telemetry",
        sourceName: "race_boats",
        jsType: "boolean",
        fieldId: 3480,
        tableId: 427,
        baseType: "type/Boolean"
      },
      // Display name: Legs Completed
      legsCompleted: {
        type: "column",
        name: "legs_completed",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3474,
        tableId: 427,
        baseType: "type/Integer"
      },
      // Display name: Max Speed Kn
      maxSpeedKn: {
        type: "column",
        name: "max_speed_kn",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3470,
        tableId: 427,
        baseType: "type/Float"
      },
      // Display name: Max Wind Speed Kn
      maxWindSpeedKn: {
        type: "column",
        name: "max_wind_speed_kn",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3471,
        tableId: 427,
        baseType: "type/Float"
      },
      // Display name: Min Wind Speed Kn
      minWindSpeedKn: {
        type: "column",
        name: "min_wind_speed_kn",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3472,
        tableId: 427,
        baseType: "type/Float"
      },
      // Display name: Place
      place: {
        type: "column",
        name: "place",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3465,
        tableId: 427,
        baseType: "type/Integer"
      },
      // Display name: Race ID
      // Semantic type: type/PK
      raceId: {
        type: "column",
        name: "race_id",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3460,
        tableId: 427,
        baseType: "type/Integer"
      },
      // Display name: Sample Count
      // Semantic type: type/Quantity
      sampleCount: {
        type: "column",
        name: "sample_count",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3477,
        tableId: 427,
        baseType: "type/Integer"
      },
      // Display name: Tacks Gybes
      tacksGybes: {
        type: "column",
        name: "tacks_gybes",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3473,
        tableId: 427,
        baseType: "type/Integer"
      },
      // Display name: Team Colour
      // Semantic type: type/Category
      teamColour: {
        type: "column",
        name: "team_colour",
        sourceName: "race_boats",
        jsType: "string",
        fieldId: 3464,
        tableId: 427,
        baseType: "type/Text"
      },
      // Display name: Team ID
      teamId: {
        type: "column",
        name: "team_id",
        sourceName: "race_boats",
        jsType: "number",
        fieldId: 3462,
        tableId: 427,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: race_control
  raceControl: {
    type: "table",
    id: 418,
    name: "Race Control",
    fields: {
      // Display name: Category
      // Semantic type: type/Category
      category: {
        type: "column",
        name: "category",
        sourceName: "race_control",
        jsType: "string",
        fieldId: 3374,
        tableId: 418,
        baseType: "type/Text"
      },
      // Display name: Driver Number
      // Semantic type: type/Category
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "race_control",
        jsType: "string",
        fieldId: 3380,
        tableId: 418,
        baseType: "type/Text"
      },
      // Display name: Flag
      // Semantic type: type/Category
      flag: {
        type: "column",
        name: "flag",
        sourceName: "race_control",
        jsType: "string",
        fieldId: 3377,
        tableId: 418,
        baseType: "type/Text"
      },
      // Display name: Lap
      lap: {
        type: "column",
        name: "lap",
        sourceName: "race_control",
        jsType: "number",
        fieldId: 3381,
        tableId: 418,
        baseType: "type/Float"
      },
      // Display name: Message
      message: {
        type: "column",
        name: "message",
        sourceName: "race_control",
        jsType: "string",
        fieldId: 3375,
        tableId: 418,
        baseType: "type/Text"
      },
      // Display name: Scope
      // Semantic type: type/Category
      scope: {
        type: "column",
        name: "scope",
        sourceName: "race_control",
        jsType: "string",
        fieldId: 3378,
        tableId: 418,
        baseType: "type/Text"
      },
      // Display name: Sector
      sector: {
        type: "column",
        name: "sector",
        sourceName: "race_control",
        jsType: "number",
        fieldId: 3379,
        tableId: 418,
        baseType: "type/Float"
      },
      // Display name: Session ID
      // Semantic type: type/PK
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "race_control",
        jsType: "number",
        fieldId: 3372,
        tableId: 418,
        baseType: "type/Integer"
      },
      // Display name: Status
      // Semantic type: type/Category
      status: {
        type: "column",
        name: "status",
        sourceName: "race_control",
        jsType: "string",
        fieldId: 3376,
        tableId: 418,
        baseType: "type/Text"
      },
      // Display name: Ts Ms
      tsMs: {
        type: "column",
        name: "ts_ms",
        sourceName: "race_control",
        jsType: "number",
        fieldId: 3373,
        tableId: 418,
        baseType: "type/BigInteger"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1_analytics
  // Table: race_control_events
  raceControlEvents: {
    type: "table",
    id: 444,
    name: "Race Control Events",
    fields: {
      // Display name: Category
      // Semantic type: type/Category
      category: {
        type: "column",
        name: "category",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3806,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Driver Code
      // Semantic type: type/Category
      driverCode: {
        type: "column",
        name: "driver_code",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3814,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Driver Name
      // Semantic type: type/Category
      driverName: {
        type: "column",
        name: "driver_name",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3815,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Driver Number
      // Semantic type: type/Quantity
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "race_control_events",
        jsType: "number",
        fieldId: 3813,
        tableId: 444,
        baseType: "type/Integer"
      },
      // Display name: Drivers Involved
      driversInvolved: {
        type: "column",
        name: "drivers_involved",
        sourceName: "race_control_events",
        jsType: "number",
        fieldId: 3818,
        tableId: 444,
        baseType: "type/Integer"
      },
      // Display name: Event Label
      eventLabel: {
        type: "column",
        name: "event_label",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3798,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Event Name
      // Semantic type: type/Category
      eventName: {
        type: "column",
        name: "event_name",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3797,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Event Type
      // Semantic type: type/Category
      eventType: {
        type: "column",
        name: "event_type",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3812,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Flag
      // Semantic type: type/Category
      flag: {
        type: "column",
        name: "flag",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3807,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Is Points Session
      isPointsSession: {
        type: "column",
        name: "is_points_session",
        sourceName: "race_control_events",
        jsType: "boolean",
        fieldId: 3801,
        tableId: 444,
        baseType: "type/Boolean"
      },
      // Display name: Lap
      lap: {
        type: "column",
        name: "lap",
        sourceName: "race_control_events",
        jsType: "number",
        fieldId: 3805,
        tableId: 444,
        baseType: "type/Integer"
      },
      // Display name: Message
      message: {
        type: "column",
        name: "message",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3811,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Message Time Ms
      messageTimeMs: {
        type: "column",
        name: "message_time_ms",
        sourceName: "race_control_events",
        jsType: "number",
        fieldId: 3803,
        tableId: 444,
        baseType: "type/BigInteger"
      },
      // Display name: Message Time Utc
      messageTimeUtc: {
        type: "column",
        name: "message_time_utc",
        sourceName: "race_control_events",
        jsType: "Date",
        fieldId: 3804,
        tableId: 444,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Penalty Kind
      // Semantic type: type/Category
      penaltyKind: {
        type: "column",
        name: "penalty_kind",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3819,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Penalty Seconds
      penaltySeconds: {
        type: "column",
        name: "penalty_seconds",
        sourceName: "race_control_events",
        jsType: "number",
        fieldId: 3820,
        tableId: 444,
        baseType: "type/Integer"
      },
      // Display name: Reason
      reason: {
        type: "column",
        name: "reason",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3821,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Round
      round: {
        type: "column",
        name: "round",
        sourceName: "race_control_events",
        jsType: "number",
        fieldId: 3796,
        tableId: 444,
        baseType: "type/Integer"
      },
      // Display name: Scope
      // Semantic type: type/Category
      scope: {
        type: "column",
        name: "scope",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3808,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Sector
      sector: {
        type: "column",
        name: "sector",
        sourceName: "race_control_events",
        jsType: "number",
        fieldId: 3809,
        tableId: 444,
        baseType: "type/Integer"
      },
      // Display name: Session Date
      sessionDate: {
        type: "column",
        name: "session_date",
        sourceName: "race_control_events",
        jsType: "Date",
        fieldId: 3802,
        tableId: 444,
        baseType: "type/Date"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "race_control_events",
        jsType: "number",
        fieldId: 3794,
        tableId: 444,
        baseType: "type/Integer"
      },
      // Display name: Session Name
      // Semantic type: type/Category
      sessionName: {
        type: "column",
        name: "session_name",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3799,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Session Type
      // Semantic type: type/Category
      sessionType: {
        type: "column",
        name: "session_type",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3800,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Status
      // Semantic type: type/Category
      status: {
        type: "column",
        name: "status",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3810,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Team Color
      // Semantic type: type/Category
      teamColor: {
        type: "column",
        name: "team_color",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3817,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Team Name
      // Semantic type: type/Category
      teamName: {
        type: "column",
        name: "team_name",
        sourceName: "race_control_events",
        jsType: "string",
        fieldId: 3816,
        tableId: 444,
        baseType: "type/Text"
      },
      // Display name: Turn Number
      // Semantic type: type/Quantity
      turnNumber: {
        type: "column",
        name: "turn_number",
        sourceName: "race_control_events",
        jsType: "number",
        fieldId: 3822,
        tableId: 444,
        baseType: "type/Integer"
      },
      // Display name: Year
      year: {
        type: "column",
        name: "year",
        sourceName: "race_control_events",
        jsType: "number",
        fieldId: 3795,
        tableId: 444,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: ac36
  // Table: race_videos
  raceVideos: {
    type: "table",
    id: 428,
    name: "Race Videos",
    fields: {
      // Display name: Camera
      // Semantic type: type/PK
      camera: {
        type: "column",
        name: "camera",
        sourceName: "race_videos",
        jsType: "string",
        fieldId: 3502,
        tableId: 428,
        baseType: "type/Text"
      },
      // Display name: Note
      note: {
        type: "column",
        name: "note",
        sourceName: "race_videos",
        jsType: "string",
        fieldId: 3506,
        tableId: 428,
        baseType: "type/Text"
      },
      // Display name: Published At
      publishedAt: {
        type: "column",
        name: "published_at",
        sourceName: "race_videos",
        jsType: "Date",
        fieldId: 3505,
        tableId: 428,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Race ID
      // Semantic type: type/PK
      raceId: {
        type: "column",
        name: "race_id",
        sourceName: "race_videos",
        jsType: "number",
        fieldId: 3501,
        tableId: 428,
        baseType: "type/Integer"
      },
      // Display name: Start Offset Sec
      startOffsetSec: {
        type: "column",
        name: "start_offset_sec",
        sourceName: "race_videos",
        jsType: "number",
        fieldId: 3504,
        tableId: 428,
        baseType: "type/Integer"
      },
      // Display name: Video ID
      videoId: {
        type: "column",
        name: "video_id",
        sourceName: "race_videos",
        jsType: "string",
        fieldId: 3503,
        tableId: 428,
        baseType: "type/Text"
      },
      // Display name: Youtube URL
      // Semantic type: type/URL
      youtubeUrl: {
        type: "column",
        name: "youtube_url",
        sourceName: "race_videos",
        jsType: "string",
        fieldId: 3507,
        tableId: 428,
        baseType: "type/Text"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: ac36
  races: {
    type: "table",
    id: 429,
    name: "Races",
    fields: {
      // Display name: Boat Type
      boatType: {
        type: "column",
        name: "boat_type",
        sourceName: "races",
        jsType: "number",
        fieldId: 3495,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Course Angle Deg
      courseAngleDeg: {
        type: "column",
        name: "course_angle_deg",
        sourceName: "races",
        jsType: "number",
        fieldId: 3493,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Event Code
      // Semantic type: type/Category
      eventCode: {
        type: "column",
        name: "event_code",
        sourceName: "races",
        jsType: "string",
        fieldId: 3482,
        tableId: 429,
        baseType: "type/Text"
      },
      // Display name: Finish Ms
      finishMs: {
        type: "column",
        name: "finish_ms",
        sourceName: "races",
        jsType: "number",
        fieldId: 3491,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Live Delay Secs
      liveDelaySecs: {
        type: "column",
        name: "live_delay_secs",
        sourceName: "races",
        jsType: "number",
        fieldId: 3496,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Num Legs
      // Semantic type: type/Quantity
      numLegs: {
        type: "column",
        name: "num_legs",
        sourceName: "races",
        jsType: "number",
        fieldId: 3492,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Race Date
      raceDate: {
        type: "column",
        name: "race_date",
        sourceName: "races",
        jsType: "Date",
        fieldId: 3487,
        tableId: 429,
        baseType: "type/Date"
      },
      // Display name: Race Dir
      raceDir: {
        type: "column",
        name: "race_dir",
        sourceName: "races",
        jsType: "number",
        fieldId: 3483,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Race ID
      // Semantic type: type/PK
      raceId: {
        type: "column",
        name: "race_id",
        sourceName: "races",
        jsType: "number",
        fieldId: 3481,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Race In Stage
      raceInStage: {
        type: "column",
        name: "race_in_stage",
        sourceName: "races",
        jsType: "number",
        fieldId: 3486,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Race Status
      raceStatus: {
        type: "column",
        name: "race_status",
        sourceName: "races",
        jsType: "number",
        fieldId: 3494,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Sample Count
      // Semantic type: type/Quantity
      sampleCount: {
        type: "column",
        name: "sample_count",
        sourceName: "races",
        jsType: "number",
        fieldId: 3500,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Scheduled Start Sec
      scheduledStartSec: {
        type: "column",
        name: "scheduled_start_sec",
        sourceName: "races",
        jsType: "number",
        fieldId: 3497,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Stage ID
      stageId: {
        type: "column",
        name: "stage_id",
        sourceName: "races",
        jsType: "number",
        fieldId: 3484,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Stage Name
      // Semantic type: type/Category
      stageName: {
        type: "column",
        name: "stage_name",
        sourceName: "races",
        jsType: "string",
        fieldId: 3485,
        tableId: 429,
        baseType: "type/Text"
      },
      // Display name: Start Ms
      startMs: {
        type: "column",
        name: "start_ms",
        sourceName: "races",
        jsType: "number",
        fieldId: 3490,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Start Time Local
      startTimeLocal: {
        type: "column",
        name: "start_time_local",
        sourceName: "races",
        jsType: "string",
        fieldId: 3488,
        tableId: 429,
        baseType: "type/Text"
      },
      // Display name: Start Time Utc
      // Semantic type: type/CreationTimestamp
      startTimeUtc: {
        type: "column",
        name: "start_time_utc",
        sourceName: "races",
        jsType: "Date",
        fieldId: 3489,
        tableId: 429,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Telemetry End Ms
      telemetryEndMs: {
        type: "column",
        name: "telemetry_end_ms",
        sourceName: "races",
        jsType: "number",
        fieldId: 3499,
        tableId: 429,
        baseType: "type/Integer"
      },
      // Display name: Telemetry Start Ms
      telemetryStartMs: {
        type: "column",
        name: "telemetry_start_ms",
        sourceName: "races",
        jsType: "number",
        fieldId: 3498,
        tableId: 429,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  results: {
    type: "table",
    id: 419,
    name: "Results",
    fields: {
      // Display name: Abbreviation
      // Semantic type: type/Category
      abbreviation: {
        type: "column",
        name: "abbreviation",
        sourceName: "results",
        jsType: "string",
        fieldId: 3384,
        tableId: 419,
        baseType: "type/Text"
      },
      // Display name: Broadcast Name
      // Semantic type: type/Category
      broadcastName: {
        type: "column",
        name: "broadcast_name",
        sourceName: "results",
        jsType: "string",
        fieldId: 3386,
        tableId: 419,
        baseType: "type/Text"
      },
      // Display name: Classified Position
      // Semantic type: type/Category
      classifiedPosition: {
        type: "column",
        name: "classified_position",
        sourceName: "results",
        jsType: "string",
        fieldId: 3392,
        tableId: 419,
        baseType: "type/Text"
      },
      // Display name: Country Code
      // Semantic type: type/Country
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "results",
        jsType: "string",
        fieldId: 3387,
        tableId: 419,
        baseType: "type/Text"
      },
      // Display name: Driver Number
      // Semantic type: type/PK
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "results",
        jsType: "number",
        fieldId: 3383,
        tableId: 419,
        baseType: "type/Integer"
      },
      // Display name: Full Name
      // Semantic type: type/Name
      fullName: {
        type: "column",
        name: "full_name",
        sourceName: "results",
        jsType: "string",
        fieldId: 3385,
        tableId: 419,
        baseType: "type/Text"
      },
      // Display name: Grid Position
      gridPosition: {
        type: "column",
        name: "grid_position",
        sourceName: "results",
        jsType: "number",
        fieldId: 3393,
        tableId: 419,
        baseType: "type/Float"
      },
      // Display name: Headshot URL
      // Semantic type: type/URL
      headshotUrl: {
        type: "column",
        name: "headshot_url",
        sourceName: "results",
        jsType: "string",
        fieldId: 3390,
        tableId: 419,
        baseType: "type/Text"
      },
      // Display name: Points
      points: {
        type: "column",
        name: "points",
        sourceName: "results",
        jsType: "number",
        fieldId: 3394,
        tableId: 419,
        baseType: "type/Float"
      },
      // Display name: Position
      position: {
        type: "column",
        name: "position",
        sourceName: "results",
        jsType: "number",
        fieldId: 3391,
        tableId: 419,
        baseType: "type/Float"
      },
      // Display name: Q1 Ms
      q1Ms: {
        type: "column",
        name: "q1_ms",
        sourceName: "results",
        jsType: "number",
        fieldId: 3396,
        tableId: 419,
        baseType: "type/BigInteger"
      },
      // Display name: Q2 Ms
      q2Ms: {
        type: "column",
        name: "q2_ms",
        sourceName: "results",
        jsType: "number",
        fieldId: 3397,
        tableId: 419,
        baseType: "type/BigInteger"
      },
      // Display name: Q3 Ms
      q3Ms: {
        type: "column",
        name: "q3_ms",
        sourceName: "results",
        jsType: "number",
        fieldId: 3398,
        tableId: 419,
        baseType: "type/BigInteger"
      },
      // Display name: Race Time Ms
      raceTimeMs: {
        type: "column",
        name: "race_time_ms",
        sourceName: "results",
        jsType: "number",
        fieldId: 3399,
        tableId: 419,
        baseType: "type/BigInteger"
      },
      // Display name: Session ID
      // Semantic type: type/PK
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "results",
        jsType: "number",
        fieldId: 3382,
        tableId: 419,
        baseType: "type/Integer"
      },
      // Display name: Status
      // Semantic type: type/Category
      status: {
        type: "column",
        name: "status",
        sourceName: "results",
        jsType: "string",
        fieldId: 3395,
        tableId: 419,
        baseType: "type/Text"
      },
      // Display name: Team Color
      // Semantic type: type/Category
      teamColor: {
        type: "column",
        name: "team_color",
        sourceName: "results",
        jsType: "string",
        fieldId: 3389,
        tableId: 419,
        baseType: "type/Text"
      },
      // Display name: Team Name
      // Semantic type: type/Category
      teamName: {
        type: "column",
        name: "team_name",
        sourceName: "results",
        jsType: "string",
        fieldId: 3388,
        tableId: 419,
        baseType: "type/Text"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1_analytics
  // Table: session_data_health
  sessionDataHealth: {
    type: "table",
    id: 445,
    name: "Session Data Health",
    fields: {
      // Display name: Car Telemetry Rows
      carTelemetryRows: {
        type: "column",
        name: "car_telemetry_rows",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3835,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Corner Rows
      cornerRows: {
        type: "column",
        name: "corner_rows",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3840,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Drivers In Results
      driversInResults: {
        type: "column",
        name: "drivers_in_results",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3841,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Drivers With Laps
      driversWithLaps: {
        type: "column",
        name: "drivers_with_laps",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3842,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Event Label
      eventLabel: {
        type: "column",
        name: "event_label",
        sourceName: "session_data_health",
        jsType: "string",
        fieldId: 3827,
        tableId: 445,
        baseType: "type/Text"
      },
      // Display name: Event Name
      // Semantic type: type/Category
      eventName: {
        type: "column",
        name: "event_name",
        sourceName: "session_data_health",
        jsType: "string",
        fieldId: 3826,
        tableId: 445,
        baseType: "type/Text"
      },
      // Display name: Expected Points Total
      expectedPointsTotal: {
        type: "column",
        name: "expected_points_total",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3844,
        tableId: 445,
        baseType: "type/Float"
      },
      // Display name: Has Car Telemetry
      hasCarTelemetry: {
        type: "column",
        name: "has_car_telemetry",
        sourceName: "session_data_health",
        jsType: "boolean",
        fieldId: 3849,
        tableId: 445,
        baseType: "type/Boolean"
      },
      // Display name: Has Corners
      hasCorners: {
        type: "column",
        name: "has_corners",
        sourceName: "session_data_health",
        jsType: "boolean",
        fieldId: 3851,
        tableId: 445,
        baseType: "type/Boolean"
      },
      // Display name: Has Lap Telemetry
      hasLapTelemetry: {
        type: "column",
        name: "has_lap_telemetry",
        sourceName: "session_data_health",
        jsType: "boolean",
        fieldId: 3848,
        tableId: 445,
        baseType: "type/Boolean"
      },
      // Display name: Has Weather
      hasWeather: {
        type: "column",
        name: "has_weather",
        sourceName: "session_data_health",
        jsType: "boolean",
        fieldId: 3850,
        tableId: 445,
        baseType: "type/Boolean"
      },
      // Display name: Is Complete
      isComplete: {
        type: "column",
        name: "is_complete",
        sourceName: "session_data_health",
        jsType: "boolean",
        fieldId: 3854,
        tableId: 445,
        baseType: "type/Boolean"
      },
      // Display name: Is Points Session
      isPointsSession: {
        type: "column",
        name: "is_points_session",
        sourceName: "session_data_health",
        jsType: "boolean",
        fieldId: 3830,
        tableId: 445,
        baseType: "type/Boolean"
      },
      // Display name: Issue Count
      // Semantic type: type/Quantity
      issueCount: {
        type: "column",
        name: "issue_count",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3852,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Issues
      // Semantic type: type/Category
      issues: {
        type: "column",
        name: "issues",
        sourceName: "session_data_health",
        jsType: "string",
        fieldId: 3853,
        tableId: 445,
        baseType: "type/Text"
      },
      // Display name: Lap Telemetry Drivers
      lapTelemetryDrivers: {
        type: "column",
        name: "lap_telemetry_drivers",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3834,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Laps Rows
      lapsRows: {
        type: "column",
        name: "laps_rows",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3833,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Load Status
      // Semantic type: type/State
      loadStatus: {
        type: "column",
        name: "load_status",
        sourceName: "session_data_health",
        jsType: "string",
        fieldId: 3846,
        tableId: 445,
        baseType: "type/Text"
      },
      // Display name: Loaded At
      loadedAt: {
        type: "column",
        name: "loaded_at",
        sourceName: "session_data_health",
        jsType: "Date",
        fieldId: 3847,
        tableId: 445,
        baseType: "type/DateTime"
      },
      // Display name: Points Check
      // Semantic type: type/Category
      pointsCheck: {
        type: "column",
        name: "points_check",
        sourceName: "session_data_health",
        jsType: "string",
        fieldId: 3845,
        tableId: 445,
        baseType: "type/Text"
      },
      // Display name: Points Total
      pointsTotal: {
        type: "column",
        name: "points_total",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3843,
        tableId: 445,
        baseType: "type/Float"
      },
      // Display name: Position Rows
      positionRows: {
        type: "column",
        name: "position_rows",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3836,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Race Control Messages
      raceControlMessages: {
        type: "column",
        name: "race_control_messages",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3838,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Results Rows
      resultsRows: {
        type: "column",
        name: "results_rows",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3832,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Round
      round: {
        type: "column",
        name: "round",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3825,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Session Date
      sessionDate: {
        type: "column",
        name: "session_date",
        sourceName: "session_data_health",
        jsType: "Date",
        fieldId: 3831,
        tableId: 445,
        baseType: "type/Date"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3823,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Session Name
      // Semantic type: type/Category
      sessionName: {
        type: "column",
        name: "session_name",
        sourceName: "session_data_health",
        jsType: "string",
        fieldId: 3828,
        tableId: 445,
        baseType: "type/Text"
      },
      // Display name: Session Type
      // Semantic type: type/Category
      sessionType: {
        type: "column",
        name: "session_type",
        sourceName: "session_data_health",
        jsType: "string",
        fieldId: 3829,
        tableId: 445,
        baseType: "type/Text"
      },
      // Display name: Track Status Changes
      trackStatusChanges: {
        type: "column",
        name: "track_status_changes",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3839,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Weather Samples
      weatherSamples: {
        type: "column",
        name: "weather_samples",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3837,
        tableId: 445,
        baseType: "type/Integer"
      },
      // Display name: Year
      year: {
        type: "column",
        name: "year",
        sourceName: "session_data_health",
        jsType: "number",
        fieldId: 3824,
        tableId: 445,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: sessions
  sessions420: {
    type: "table",
    id: 420,
    name: "Sessions",
    fields: {
      // Display name: Country
      // Semantic type: type/Country
      country: {
        type: "column",
        name: "country",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3407,
        tableId: 420,
        baseType: "type/Text"
      },
      // Display name: Era
      // Semantic type: type/Category
      era: {
        type: "column",
        name: "era",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3404,
        tableId: 420,
        baseType: "type/Text"
      },
      // Display name: Event Format
      // Semantic type: type/Category
      eventFormat: {
        type: "column",
        name: "event_format",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3409,
        tableId: 420,
        baseType: "type/Text"
      },
      // Display name: Event Name
      // Semantic type: type/Category
      eventName: {
        type: "column",
        name: "event_name",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3405,
        tableId: 420,
        baseType: "type/Text"
      },
      // Display name: Location
      // Semantic type: type/Category
      location: {
        type: "column",
        name: "location",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3408,
        tableId: 420,
        baseType: "type/Text"
      },
      // Display name: Official Name
      // Semantic type: type/Category
      officialName: {
        type: "column",
        name: "official_name",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3406,
        tableId: 420,
        baseType: "type/Text"
      },
      // Display name: Openf1 Session Key
      openf1SessionKey: {
        type: "column",
        name: "openf1_session_key",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3413,
        tableId: 420,
        baseType: "type/Integer"
      },
      // Display name: Round
      round: {
        type: "column",
        name: "round",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3402,
        tableId: 420,
        baseType: "type/Integer"
      },
      // Display name: Session ID
      // Semantic type: type/PK
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3400,
        tableId: 420,
        baseType: "type/Integer"
      },
      // Display name: Session Name
      // Semantic type: type/Category
      sessionName: {
        type: "column",
        name: "session_name",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3410,
        tableId: 420,
        baseType: "type/Text"
      },
      // Display name: Session Number
      // Semantic type: type/Quantity
      sessionNumber: {
        type: "column",
        name: "session_number",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3403,
        tableId: 420,
        baseType: "type/Integer"
      },
      // Display name: Start Ms
      startMs: {
        type: "column",
        name: "start_ms",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3411,
        tableId: 420,
        baseType: "type/BigInteger"
      },
      // Display name: Start Utc
      // Semantic type: type/CreationTimestamp
      startUtc: {
        type: "column",
        name: "start_utc",
        sourceName: "sessions",
        jsType: "Date",
        fieldId: 3412,
        tableId: 420,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Year
      year: {
        type: "column",
        name: "year",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3401,
        tableId: 420,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1_analytics
  // Table: sessions
  sessions446: {
    type: "table",
    id: 446,
    name: "Sessions",
    fields: {
      // Display name: Avg Air Temp C
      avgAirTempC: {
        type: "column",
        name: "avg_air_temp_c",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3879,
        tableId: 446,
        baseType: "type/Float"
      },
      // Display name: Avg Humidity Pct
      avgHumidityPct: {
        type: "column",
        name: "avg_humidity_pct",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3882,
        tableId: 446,
        baseType: "type/Float"
      },
      // Display name: Avg Track Temp C
      avgTrackTempC: {
        type: "column",
        name: "avg_track_temp_c",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3880,
        tableId: 446,
        baseType: "type/Float"
      },
      // Display name: Avg Wind Speed Ms
      avgWindSpeedMs: {
        type: "column",
        name: "avg_wind_speed_ms",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3883,
        tableId: 446,
        baseType: "type/Float"
      },
      // Display name: Country
      // Semantic type: type/Country
      country: {
        type: "column",
        name: "country",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3860,
        tableId: 446,
        baseType: "type/Text"
      },
      // Display name: Drivers With Laps
      driversWithLaps: {
        type: "column",
        name: "drivers_with_laps",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3870,
        tableId: 446,
        baseType: "type/Integer"
      },
      // Display name: Event Label
      eventLabel: {
        type: "column",
        name: "event_label",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3868,
        tableId: 446,
        baseType: "type/Text"
      },
      // Display name: Event Name
      // Semantic type: type/Category
      eventName: {
        type: "column",
        name: "event_name",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3858,
        tableId: 446,
        baseType: "type/Text"
      },
      // Display name: Had Rain
      hadRain: {
        type: "column",
        name: "had_rain",
        sourceName: "sessions",
        jsType: "boolean",
        fieldId: 3884,
        tableId: 446,
        baseType: "type/Boolean"
      },
      // Display name: Is Points Session
      isPointsSession: {
        type: "column",
        name: "is_points_session",
        sourceName: "sessions",
        jsType: "boolean",
        fieldId: 3865,
        tableId: 446,
        baseType: "type/Boolean"
      },
      // Display name: Laps Completed
      lapsCompleted: {
        type: "column",
        name: "laps_completed",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3869,
        tableId: 446,
        baseType: "type/Integer"
      },
      // Display name: Location
      // Semantic type: type/Category
      location: {
        type: "column",
        name: "location",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3861,
        tableId: 446,
        baseType: "type/Text"
      },
      // Display name: Max Track Temp C
      maxTrackTempC: {
        type: "column",
        name: "max_track_temp_c",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3881,
        tableId: 446,
        baseType: "type/Float"
      },
      // Display name: Official Name
      officialName: {
        type: "column",
        name: "official_name",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3859,
        tableId: 446,
        baseType: "type/Text"
      },
      // Display name: P1 Driver Code
      // Semantic type: type/Category
      p1DriverCode: {
        type: "column",
        name: "p1_driver_code",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3871,
        tableId: 446,
        baseType: "type/Text"
      },
      // Display name: P1 Driver Name
      // Semantic type: type/Category
      p1DriverName: {
        type: "column",
        name: "p1_driver_name",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3872,
        tableId: 446,
        baseType: "type/Text"
      },
      // Display name: P1 Team
      // Semantic type: type/Category
      p1Team: {
        type: "column",
        name: "p1_team",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3873,
        tableId: 446,
        baseType: "type/Text"
      },
      // Display name: Pole Driver Code
      // Semantic type: type/Category
      poleDriverCode: {
        type: "column",
        name: "pole_driver_code",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3874,
        tableId: 446,
        baseType: "type/Text"
      },
      // Display name: Red Flags
      redFlags: {
        type: "column",
        name: "red_flags",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3877,
        tableId: 446,
        baseType: "type/Integer"
      },
      // Display name: Round
      round: {
        type: "column",
        name: "round",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3857,
        tableId: 446,
        baseType: "type/Integer"
      },
      // Display name: Safety Cars
      safetyCars: {
        type: "column",
        name: "safety_cars",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3875,
        tableId: 446,
        baseType: "type/Integer"
      },
      // Display name: Session Date
      sessionDate: {
        type: "column",
        name: "session_date",
        sourceName: "sessions",
        jsType: "Date",
        fieldId: 3867,
        tableId: 446,
        baseType: "type/Date"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3855,
        tableId: 446,
        baseType: "type/Integer"
      },
      // Display name: Session Name
      // Semantic type: type/Category
      sessionName: {
        type: "column",
        name: "session_name",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3863,
        tableId: 446,
        baseType: "type/Text"
      },
      // Display name: Session Start Utc
      // Semantic type: type/CreationTimestamp
      sessionStartUtc: {
        type: "column",
        name: "session_start_utc",
        sourceName: "sessions",
        jsType: "Date",
        fieldId: 3866,
        tableId: 446,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Session Type
      // Semantic type: type/Category
      sessionType: {
        type: "column",
        name: "session_type",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3864,
        tableId: 446,
        baseType: "type/Text"
      },
      // Display name: Virtual Safety Cars
      virtualSafetyCars: {
        type: "column",
        name: "virtual_safety_cars",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3876,
        tableId: 446,
        baseType: "type/Integer"
      },
      // Display name: Weekend Format
      // Semantic type: type/Category
      weekendFormat: {
        type: "column",
        name: "weekend_format",
        sourceName: "sessions",
        jsType: "string",
        fieldId: 3862,
        tableId: 446,
        baseType: "type/Text"
      },
      // Display name: Year
      year: {
        type: "column",
        name: "year",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3856,
        tableId: 446,
        baseType: "type/Integer"
      },
      // Display name: Yellow Flags
      yellowFlags: {
        type: "column",
        name: "yellow_flags",
        sourceName: "sessions",
        jsType: "number",
        fieldId: 3878,
        tableId: 446,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1_analytics
  stints: {
    type: "table",
    id: 447,
    name: "Stints",
    fields: {
      // Display name: Best Clean Lap S
      bestCleanLapS: {
        type: "column",
        name: "best_clean_lap_s",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3908,
        tableId: 447,
        baseType: "type/Float"
      },
      // Display name: Clean Laps
      cleanLaps: {
        type: "column",
        name: "clean_laps",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3906,
        tableId: 447,
        baseType: "type/Integer"
      },
      // Display name: Compound
      // Semantic type: type/Category
      compound: {
        type: "column",
        name: "compound",
        sourceName: "stints",
        jsType: "string",
        fieldId: 3900,
        tableId: 447,
        baseType: "type/Text"
      },
      // Display name: Degradation S Per Lap
      degradationSPerLap: {
        type: "column",
        name: "degradation_s_per_lap",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3909,
        tableId: 447,
        baseType: "type/Float"
      },
      // Display name: Driver Code
      // Semantic type: type/Category
      driverCode: {
        type: "column",
        name: "driver_code",
        sourceName: "stints",
        jsType: "string",
        fieldId: 3895,
        tableId: 447,
        baseType: "type/Text"
      },
      // Display name: Driver Name
      // Semantic type: type/Category
      driverName: {
        type: "column",
        name: "driver_name",
        sourceName: "stints",
        jsType: "string",
        fieldId: 3896,
        tableId: 447,
        baseType: "type/Text"
      },
      // Display name: Driver Number
      // Semantic type: type/Quantity
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3894,
        tableId: 447,
        baseType: "type/Integer"
      },
      // Display name: End Lap
      endLap: {
        type: "column",
        name: "end_lap",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3902,
        tableId: 447,
        baseType: "type/Integer"
      },
      // Display name: Ended In Pit
      endedInPit: {
        type: "column",
        name: "ended_in_pit",
        sourceName: "stints",
        jsType: "boolean",
        fieldId: 3911,
        tableId: 447,
        baseType: "type/Boolean"
      },
      // Display name: Event Label
      eventLabel: {
        type: "column",
        name: "event_label",
        sourceName: "stints",
        jsType: "string",
        fieldId: 3889,
        tableId: 447,
        baseType: "type/Text"
      },
      // Display name: Event Name
      // Semantic type: type/Category
      eventName: {
        type: "column",
        name: "event_name",
        sourceName: "stints",
        jsType: "string",
        fieldId: 3888,
        tableId: 447,
        baseType: "type/Text"
      },
      // Display name: Fuel Corrected Degradation S Per Lap
      fuelCorrectedDegradationSPerLap: {
        type: "column",
        name: "fuel_corrected_degradation_s_per_lap",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3910,
        tableId: 447,
        baseType: "type/Float"
      },
      // Display name: Is Final Stint
      isFinalStint: {
        type: "column",
        name: "is_final_stint",
        sourceName: "stints",
        jsType: "boolean",
        fieldId: 3912,
        tableId: 447,
        baseType: "type/Boolean"
      },
      // Display name: Is Fresh Tyre
      isFreshTyre: {
        type: "column",
        name: "is_fresh_tyre",
        sourceName: "stints",
        jsType: "boolean",
        fieldId: 3905,
        tableId: 447,
        baseType: "type/Boolean"
      },
      // Display name: Is Points Session
      isPointsSession: {
        type: "column",
        name: "is_points_session",
        sourceName: "stints",
        jsType: "boolean",
        fieldId: 3892,
        tableId: 447,
        baseType: "type/Boolean"
      },
      // Display name: Median Clean Lap S
      medianCleanLapS: {
        type: "column",
        name: "median_clean_lap_s",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3907,
        tableId: 447,
        baseType: "type/Float"
      },
      // Display name: Round
      round: {
        type: "column",
        name: "round",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3887,
        tableId: 447,
        baseType: "type/Integer"
      },
      // Display name: Session Date
      sessionDate: {
        type: "column",
        name: "session_date",
        sourceName: "stints",
        jsType: "Date",
        fieldId: 3893,
        tableId: 447,
        baseType: "type/Date"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3885,
        tableId: 447,
        baseType: "type/Integer"
      },
      // Display name: Session Name
      // Semantic type: type/Category
      sessionName: {
        type: "column",
        name: "session_name",
        sourceName: "stints",
        jsType: "string",
        fieldId: 3890,
        tableId: 447,
        baseType: "type/Text"
      },
      // Display name: Session Type
      // Semantic type: type/Category
      sessionType: {
        type: "column",
        name: "session_type",
        sourceName: "stints",
        jsType: "string",
        fieldId: 3891,
        tableId: 447,
        baseType: "type/Text"
      },
      // Display name: Start Lap
      startLap: {
        type: "column",
        name: "start_lap",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3901,
        tableId: 447,
        baseType: "type/Integer"
      },
      // Display name: Stint Laps
      stintLaps: {
        type: "column",
        name: "stint_laps",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3903,
        tableId: 447,
        baseType: "type/Integer"
      },
      // Display name: Stint Number
      // Semantic type: type/Quantity
      stintNumber: {
        type: "column",
        name: "stint_number",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3899,
        tableId: 447,
        baseType: "type/Integer"
      },
      // Display name: Team Color
      // Semantic type: type/Category
      teamColor: {
        type: "column",
        name: "team_color",
        sourceName: "stints",
        jsType: "string",
        fieldId: 3898,
        tableId: 447,
        baseType: "type/Text"
      },
      // Display name: Team Name
      // Semantic type: type/Category
      teamName: {
        type: "column",
        name: "team_name",
        sourceName: "stints",
        jsType: "string",
        fieldId: 3897,
        tableId: 447,
        baseType: "type/Text"
      },
      // Display name: Tyre Age At Start
      tyreAgeAtStart: {
        type: "column",
        name: "tyre_age_at_start",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3904,
        tableId: 447,
        baseType: "type/Integer"
      },
      // Display name: Year
      year: {
        type: "column",
        name: "year",
        sourceName: "stints",
        jsType: "number",
        fieldId: 3886,
        tableId: 447,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: team_radio
  teamRadio: {
    type: "table",
    id: 421,
    name: "Team Radio",
    fields: {
      // Display name: Driver Number
      // Semantic type: type/PK
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "team_radio",
        jsType: "number",
        fieldId: 3415,
        tableId: 421,
        baseType: "type/Integer"
      },
      // Display name: Recording URL
      recordingUrl: {
        type: "column",
        name: "recording_url",
        sourceName: "team_radio",
        jsType: "string",
        fieldId: 3418,
        tableId: 421,
        baseType: "type/Text"
      },
      // Display name: Session ID
      // Semantic type: type/PK
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "team_radio",
        jsType: "number",
        fieldId: 3414,
        tableId: 421,
        baseType: "type/Integer"
      },
      // Display name: Ts
      ts: {
        type: "column",
        name: "ts",
        sourceName: "team_radio",
        jsType: "Date",
        fieldId: 3417,
        tableId: 421,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Ts Ms
      // Semantic type: type/PK
      tsMs: {
        type: "column",
        name: "ts_ms",
        sourceName: "team_radio",
        jsType: "number",
        fieldId: 3416,
        tableId: 421,
        baseType: "type/BigInteger"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1_ops
  // Table: team_seasons
  teamSeasons: {
    type: "table",
    id: 451,
    name: "Team Seasons",
    fields: {
      // Display name: Constructor Position
      constructorPosition: {
        type: "column",
        name: "constructor_position",
        sourceName: "team_seasons",
        jsType: "number",
        fieldId: 3971,
        tableId: 451,
        baseType: "type/Integer"
      },
      // Display name: Cost Cap Usd
      // Semantic type: type/Cost
      costCapUsd: {
        type: "column",
        name: "cost_cap_usd",
        sourceName: "team_seasons",
        jsType: "number",
        fieldId: 3970,
        tableId: 451,
        baseType: "type/Float"
      },
      // Display name: Dnfs
      dnfs: {
        type: "column",
        name: "dnfs",
        sourceName: "team_seasons",
        jsType: "number",
        fieldId: 3975,
        tableId: 451,
        baseType: "type/Integer"
      },
      // Display name: Drivers
      // Semantic type: type/Category
      drivers: {
        type: "column",
        name: "drivers",
        sourceName: "team_seasons",
        jsType: "string",
        fieldId: 3968,
        tableId: 451,
        baseType: "type/Text"
      },
      // Display name: Engine Supplier
      // Semantic type: type/Category
      engineSupplier: {
        type: "column",
        name: "engine_supplier",
        sourceName: "team_seasons",
        jsType: "string",
        fieldId: 3966,
        tableId: 451,
        baseType: "type/Text"
      },
      // Display name: Grand Prix Count
      // Semantic type: type/Quantity
      grandPrixCount: {
        type: "column",
        name: "grand_prix_count",
        sourceName: "team_seasons",
        jsType: "number",
        fieldId: 3969,
        tableId: 451,
        baseType: "type/Integer"
      },
      // Display name: Is Works Pu Team
      isWorksPuTeam: {
        type: "column",
        name: "is_works_pu_team",
        sourceName: "team_seasons",
        jsType: "boolean",
        fieldId: 3967,
        tableId: 451,
        baseType: "type/Boolean"
      },
      // Display name: Podiums
      podiums: {
        type: "column",
        name: "podiums",
        sourceName: "team_seasons",
        jsType: "number",
        fieldId: 3974,
        tableId: 451,
        baseType: "type/Integer"
      },
      // Display name: Points
      points: {
        type: "column",
        name: "points",
        sourceName: "team_seasons",
        jsType: "number",
        fieldId: 3972,
        tableId: 451,
        baseType: "type/Float"
      },
      // Display name: Season
      season: {
        type: "column",
        name: "season",
        sourceName: "team_seasons",
        jsType: "number",
        fieldId: 3963,
        tableId: 451,
        baseType: "type/Integer"
      },
      // Display name: Spend Target Ratio
      spendTargetRatio: {
        type: "column",
        name: "spend_target_ratio",
        sourceName: "team_seasons",
        jsType: "number",
        fieldId: 3976,
        tableId: 451,
        baseType: "type/Float"
      },
      // Display name: Spend Target Usd
      spendTargetUsd: {
        type: "column",
        name: "spend_target_usd",
        sourceName: "team_seasons",
        jsType: "number",
        fieldId: 3977,
        tableId: 451,
        baseType: "type/Float"
      },
      // Display name: Team Color
      // Semantic type: type/Category
      teamColor: {
        type: "column",
        name: "team_color",
        sourceName: "team_seasons",
        jsType: "string",
        fieldId: 3965,
        tableId: 451,
        baseType: "type/Text"
      },
      // Display name: Team Name
      // Semantic type: type/Category
      teamName: {
        type: "column",
        name: "team_name",
        sourceName: "team_seasons",
        jsType: "string",
        fieldId: 3964,
        tableId: 451,
        baseType: "type/Text"
      },
      // Display name: Team Season ID
      // Semantic type: type/Category
      teamSeasonId: {
        type: "column",
        name: "team_season_id",
        sourceName: "team_seasons",
        jsType: "string",
        fieldId: 3962,
        tableId: 451,
        baseType: "type/Text"
      },
      // Display name: Wins
      wins: {
        type: "column",
        name: "wins",
        sourceName: "team_seasons",
        jsType: "number",
        fieldId: 3973,
        tableId: 451,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: ac36
  teams: {
    type: "table",
    id: 430,
    name: "Teams",
    fields: {
      // Display name: Country
      // Semantic type: type/Country
      country: {
        type: "column",
        name: "country",
        sourceName: "teams",
        jsType: "string",
        fieldId: 3509,
        tableId: 430,
        baseType: "type/Text"
      },
      // Display name: Team ID
      // Semantic type: type/PK
      teamId: {
        type: "column",
        name: "team_id",
        sourceName: "teams",
        jsType: "number",
        fieldId: 3508,
        tableId: 430,
        baseType: "type/Integer"
      },
      // Display name: Team Name
      // Semantic type: type/Category
      teamName: {
        type: "column",
        name: "team_name",
        sourceName: "teams",
        jsType: "string",
        fieldId: 3510,
        tableId: 430,
        baseType: "type/Text"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: ac36
  telemetry: {
    type: "table",
    id: 431,
    name: "Telemetry",
    fields: {
      // Display name: Boat Index
      // Semantic type: type/PK
      boatIndex: {
        type: "column",
        name: "boat_index",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3512,
        tableId: 431,
        baseType: "type/Integer"
      },
      // Display name: Both Foils
      bothFoils: {
        type: "column",
        name: "both_foils",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3525,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Country
      // Semantic type: type/Country
      country: {
        type: "column",
        name: "country",
        sourceName: "telemetry",
        jsType: "string",
        fieldId: 3513,
        tableId: 431,
        baseType: "type/Text"
      },
      // Display name: Cvmg Kn
      cvmgKn: {
        type: "column",
        name: "cvmg_kn",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3531,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Elapsed Sec
      elapsedSec: {
        type: "column",
        name: "elapsed_sec",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3516,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Heading Deg
      headingDeg: {
        type: "column",
        name: "heading_deg",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3520,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Heel Deg
      heelDeg: {
        type: "column",
        name: "heel_deg",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3521,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Latitude
      // Semantic type: type/Latitude
      latitude: {
        type: "column",
        name: "latitude",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3536,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Leg Number
      // Semantic type: type/Quantity
      legNumber: {
        type: "column",
        name: "leg_number",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3517,
        tableId: 431,
        baseType: "type/Integer"
      },
      // Display name: Longitude
      // Semantic type: type/Longitude
      longitude: {
        type: "column",
        name: "longitude",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3535,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Phase
      // Semantic type: type/Category
      phase: {
        type: "column",
        name: "phase",
        sourceName: "telemetry",
        jsType: "string",
        fieldId: 3518,
        tableId: 431,
        baseType: "type/Text"
      },
      // Display name: Pitch Deg
      pitchDeg: {
        type: "column",
        name: "pitch_deg",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3522,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Port Foil
      portFoil: {
        type: "column",
        name: "port_foil",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3523,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Race ID
      // Semantic type: type/PK
      raceId: {
        type: "column",
        name: "race_id",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3511,
        tableId: 431,
        baseType: "type/Integer"
      },
      // Display name: Speed Kn
      speedKn: {
        type: "column",
        name: "speed_kn",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3519,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Stbd Foil
      stbdFoil: {
        type: "column",
        name: "stbd_foil",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3524,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: T Ms
      // Semantic type: type/PK
      tMs: {
        type: "column",
        name: "t_ms",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3514,
        tableId: 431,
        baseType: "type/Integer"
      },
      // Display name: Timestamp Utc
      timestampUtc: {
        type: "column",
        name: "timestamp_utc",
        sourceName: "telemetry",
        jsType: "Date",
        fieldId: 3515,
        tableId: 431,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Twa Abs Deg
      twaAbsDeg: {
        type: "column",
        name: "twa_abs_deg",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3529,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Twa Deg
      twaDeg: {
        type: "column",
        name: "twa_deg",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3528,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Twd Deg
      twdDeg: {
        type: "column",
        name: "twd_deg",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3527,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Tws Kn
      twsKn: {
        type: "column",
        name: "tws_kn",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3526,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Vmg Kn
      vmgKn: {
        type: "column",
        name: "vmg_kn",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3530,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Vmg Tws Ratio
      vmgTwsRatio: {
        type: "column",
        name: "vmg_tws_ratio",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3532,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: X 3857
      x3857: {
        type: "column",
        name: "x_3857",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3533,
        tableId: 431,
        baseType: "type/Float"
      },
      // Display name: Y 3857
      y3857: {
        type: "column",
        name: "y_3857",
        sourceName: "telemetry",
        jsType: "number",
        fieldId: 3534,
        tableId: 431,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: track_status
  trackStatus: {
    type: "table",
    id: 422,
    name: "Track Status",
    fields: {
      // Display name: Message
      // Semantic type: type/Category
      message: {
        type: "column",
        name: "message",
        sourceName: "track_status",
        jsType: "string",
        fieldId: 3422,
        tableId: 422,
        baseType: "type/Text"
      },
      // Display name: Session ID
      // Semantic type: type/PK
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "track_status",
        jsType: "number",
        fieldId: 3419,
        tableId: 422,
        baseType: "type/Integer"
      },
      // Display name: Session Time Ms
      // Semantic type: type/PK
      sessionTimeMs: {
        type: "column",
        name: "session_time_ms",
        sourceName: "track_status",
        jsType: "number",
        fieldId: 3420,
        tableId: 422,
        baseType: "type/BigInteger"
      },
      // Display name: Status
      // Semantic type: type/Category
      status: {
        type: "column",
        name: "status",
        sourceName: "track_status",
        jsType: "string",
        fieldId: 3421,
        tableId: 422,
        baseType: "type/Text"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: v_mimic_leaderboard
  vMimicLeaderboard: {
    type: "table",
    id: 437,
    name: "V Mimic Leaderboard",
    fields: {
      // Display name: Brake
      brake: {
        type: "column",
        name: "brake",
        sourceName: "v_mimic_leaderboard",
        jsType: "number",
        fieldId: 3649,
        tableId: 437,
        baseType: "type/Integer"
      },
      // Display name: Driver
      // Semantic type: type/Category
      driver: {
        type: "column",
        name: "driver",
        sourceName: "v_mimic_leaderboard",
        jsType: "string",
        fieldId: 3640,
        tableId: 437,
        baseType: "type/Text"
      },
      // Display name: Driver Full
      // Semantic type: type/Category
      driverFull: {
        type: "column",
        name: "driver_full",
        sourceName: "v_mimic_leaderboard",
        jsType: "string",
        fieldId: 3641,
        tableId: 437,
        baseType: "type/Text"
      },
      // Display name: Driver Number
      // Semantic type: type/Quantity
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "v_mimic_leaderboard",
        jsType: "number",
        fieldId: 3639,
        tableId: 437,
        baseType: "type/Integer"
      },
      // Display name: Drs Open
      drsOpen: {
        type: "column",
        name: "drs_open",
        sourceName: "v_mimic_leaderboard",
        jsType: "number",
        fieldId: 3650,
        tableId: 437,
        baseType: "type/Integer"
      },
      // Display name: Gear
      gear: {
        type: "column",
        name: "gear",
        sourceName: "v_mimic_leaderboard",
        jsType: "number",
        fieldId: 3646,
        tableId: 437,
        baseType: "type/Integer"
      },
      // Display name: Lap
      lap: {
        type: "column",
        name: "lap",
        sourceName: "v_mimic_leaderboard",
        jsType: "number",
        fieldId: 3644,
        tableId: 437,
        baseType: "type/Integer"
      },
      // Display name: Last Update
      // Semantic type: type/UpdatedTimestamp
      lastUpdate: {
        type: "column",
        name: "last_update",
        sourceName: "v_mimic_leaderboard",
        jsType: "Date",
        fieldId: 3653,
        tableId: 437,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Position
      position: {
        type: "column",
        name: "position",
        sourceName: "v_mimic_leaderboard",
        jsType: "number",
        fieldId: 3638,
        tableId: 437,
        baseType: "type/Integer"
      },
      // Display name: Rpm
      rpm: {
        type: "column",
        name: "rpm",
        sourceName: "v_mimic_leaderboard",
        jsType: "number",
        fieldId: 3647,
        tableId: 437,
        baseType: "type/Float"
      },
      // Display name: Seconds Since Update
      secondsSinceUpdate: {
        type: "column",
        name: "seconds_since_update",
        sourceName: "v_mimic_leaderboard",
        jsType: "number",
        fieldId: 3654,
        tableId: 437,
        baseType: "type/Float"
      },
      // Display name: Session Key
      // Semantic type: type/Category
      sessionKey: {
        type: "column",
        name: "session_key",
        sourceName: "v_mimic_leaderboard",
        jsType: "string",
        fieldId: 3655,
        tableId: 437,
        baseType: "type/Text"
      },
      // Display name: Speed
      speed: {
        type: "column",
        name: "speed",
        sourceName: "v_mimic_leaderboard",
        jsType: "number",
        fieldId: 3645,
        tableId: 437,
        baseType: "type/Float"
      },
      // Display name: Team
      // Semantic type: type/Category
      team: {
        type: "column",
        name: "team",
        sourceName: "v_mimic_leaderboard",
        jsType: "string",
        fieldId: 3642,
        tableId: 437,
        baseType: "type/Text"
      },
      // Display name: Team Color
      // Semantic type: type/Category
      teamColor: {
        type: "column",
        name: "team_color",
        sourceName: "v_mimic_leaderboard",
        jsType: "string",
        fieldId: 3643,
        tableId: 437,
        baseType: "type/Text"
      },
      // Display name: Throttle
      throttle: {
        type: "column",
        name: "throttle",
        sourceName: "v_mimic_leaderboard",
        jsType: "number",
        fieldId: 3648,
        tableId: 437,
        baseType: "type/Float"
      },
      // Display name: X
      x: {
        type: "column",
        name: "x",
        sourceName: "v_mimic_leaderboard",
        jsType: "number",
        fieldId: 3651,
        tableId: 437,
        baseType: "type/Float"
      },
      // Display name: Y
      y: {
        type: "column",
        name: "y",
        sourceName: "v_mimic_leaderboard",
        jsType: "number",
        fieldId: 3652,
        tableId: 437,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: v_mimic_recent
  vMimicRecent: {
    type: "table",
    id: 438,
    name: "V Mimic Recent",
    fields: {
      // Display name: Brake
      brake: {
        type: "column",
        name: "brake",
        sourceName: "v_mimic_recent",
        jsType: "number",
        fieldId: 3665,
        tableId: 438,
        baseType: "type/Integer"
      },
      // Display name: Driver
      // Semantic type: type/Category
      driver: {
        type: "column",
        name: "driver",
        sourceName: "v_mimic_recent",
        jsType: "string",
        fieldId: 3658,
        tableId: 438,
        baseType: "type/Text"
      },
      // Display name: Driver Number
      // Semantic type: type/Quantity
      driverNumber: {
        type: "column",
        name: "driver_number",
        sourceName: "v_mimic_recent",
        jsType: "number",
        fieldId: 3657,
        tableId: 438,
        baseType: "type/Integer"
      },
      // Display name: Event Ts
      eventTs: {
        type: "column",
        name: "event_ts",
        sourceName: "v_mimic_recent",
        jsType: "Date",
        fieldId: 3656,
        tableId: 438,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Gear
      gear: {
        type: "column",
        name: "gear",
        sourceName: "v_mimic_recent",
        jsType: "number",
        fieldId: 3663,
        tableId: 438,
        baseType: "type/Integer"
      },
      // Display name: Lap
      lap: {
        type: "column",
        name: "lap",
        sourceName: "v_mimic_recent",
        jsType: "number",
        fieldId: 3660,
        tableId: 438,
        baseType: "type/Integer"
      },
      // Display name: Position
      position: {
        type: "column",
        name: "position",
        sourceName: "v_mimic_recent",
        jsType: "number",
        fieldId: 3661,
        tableId: 438,
        baseType: "type/Integer"
      },
      // Display name: Speed
      speed: {
        type: "column",
        name: "speed",
        sourceName: "v_mimic_recent",
        jsType: "number",
        fieldId: 3662,
        tableId: 438,
        baseType: "type/Float"
      },
      // Display name: Team Color
      // Semantic type: type/Category
      teamColor: {
        type: "column",
        name: "team_color",
        sourceName: "v_mimic_recent",
        jsType: "string",
        fieldId: 3659,
        tableId: 438,
        baseType: "type/Text"
      },
      // Display name: Throttle
      throttle: {
        type: "column",
        name: "throttle",
        sourceName: "v_mimic_recent",
        jsType: "number",
        fieldId: 3664,
        tableId: 438,
        baseType: "type/Float"
      },
      // Display name: X
      x: {
        type: "column",
        name: "x",
        sourceName: "v_mimic_recent",
        jsType: "number",
        fieldId: 3666,
        tableId: 438,
        baseType: "type/Float"
      },
      // Display name: Y
      y: {
        type: "column",
        name: "y",
        sourceName: "v_mimic_recent",
        jsType: "number",
        fieldId: 3667,
        tableId: 438,
        baseType: "type/Float"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: v_mimic_status
  vMimicStatus: {
    type: "table",
    id: 439,
    name: "V Mimic Status",
    fields: {
      // Display name: Current Lap
      currentLap: {
        type: "column",
        name: "current_lap",
        sourceName: "v_mimic_status",
        jsType: "number",
        fieldId: 3675,
        tableId: 439,
        baseType: "type/Integer"
      },
      // Display name: Event Name
      // Semantic type: type/Category
      eventName: {
        type: "column",
        name: "event_name",
        sourceName: "v_mimic_status",
        jsType: "string",
        fieldId: 3671,
        tableId: 439,
        baseType: "type/Text"
      },
      // Display name: Last Data Ts
      lastDataTs: {
        type: "column",
        name: "last_data_ts",
        sourceName: "v_mimic_status",
        jsType: "Date",
        fieldId: 3681,
        tableId: 439,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Progress
      progress: {
        type: "column",
        name: "progress",
        sourceName: "v_mimic_status",
        jsType: "number",
        fieldId: 3677,
        tableId: 439,
        baseType: "type/Float"
      },
      // Display name: Rows Sent
      rowsSent: {
        type: "column",
        name: "rows_sent",
        sourceName: "v_mimic_status",
        jsType: "number",
        fieldId: 3678,
        tableId: 439,
        baseType: "type/BigInteger"
      },
      // Display name: Seconds Since Data
      secondsSinceData: {
        type: "column",
        name: "seconds_since_data",
        sourceName: "v_mimic_status",
        jsType: "number",
        fieldId: 3682,
        tableId: 439,
        baseType: "type/Float"
      },
      // Display name: Session ID
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "v_mimic_status",
        jsType: "number",
        fieldId: 3669,
        tableId: 439,
        baseType: "type/Integer"
      },
      // Display name: Session Key
      // Semantic type: type/Category
      sessionKey: {
        type: "column",
        name: "session_key",
        sourceName: "v_mimic_status",
        jsType: "string",
        fieldId: 3668,
        tableId: 439,
        baseType: "type/Text"
      },
      // Display name: Session Name
      // Semantic type: type/Category
      sessionName: {
        type: "column",
        name: "session_name",
        sourceName: "v_mimic_status",
        jsType: "string",
        fieldId: 3672,
        tableId: 439,
        baseType: "type/Text"
      },
      // Display name: Speed
      speed: {
        type: "column",
        name: "speed",
        sourceName: "v_mimic_status",
        jsType: "number",
        fieldId: 3673,
        tableId: 439,
        baseType: "type/Float"
      },
      // Display name: Started At
      // Semantic type: type/CreationTimestamp
      startedAt: {
        type: "column",
        name: "started_at",
        sourceName: "v_mimic_status",
        jsType: "Date",
        fieldId: 3679,
        tableId: 439,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Status
      // Semantic type: type/Category
      status: {
        type: "column",
        name: "status",
        sourceName: "v_mimic_status",
        jsType: "string",
        fieldId: 3674,
        tableId: 439,
        baseType: "type/Text"
      },
      // Display name: Total Laps
      totalLaps: {
        type: "column",
        name: "total_laps",
        sourceName: "v_mimic_status",
        jsType: "number",
        fieldId: 3676,
        tableId: 439,
        baseType: "type/Integer"
      },
      // Display name: Updated At
      // Semantic type: type/UpdatedTimestamp
      updatedAt: {
        type: "column",
        name: "updated_at",
        sourceName: "v_mimic_status",
        jsType: "Date",
        fieldId: 3680,
        tableId: 439,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Year
      year: {
        type: "column",
        name: "year",
        sourceName: "v_mimic_status",
        jsType: "number",
        fieldId: 3670,
        tableId: 439,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  // Table: v_mimic_throughput
  vMimicThroughput: {
    type: "table",
    id: 440,
    name: "V Mimic Throughput",
    fields: {
      // Display name: Rows
      rows: {
        type: "column",
        name: "rows",
        sourceName: "v_mimic_throughput",
        jsType: "number",
        fieldId: 3684,
        tableId: 440,
        baseType: "type/BigInteger"
      },
      // Display name: Second
      second: {
        type: "column",
        name: "second",
        sourceName: "v_mimic_throughput",
        jsType: "Date",
        fieldId: 3683,
        tableId: 440,
        baseType: "type/DateTimeWithLocalTZ"
      }
    }
  },
  // Database: Hack2026_Bob
  // Schema: f1
  weather: {
    type: "table",
    id: 423,
    name: "Weather",
    fields: {
      // Display name: Air Temp
      airTemp: {
        type: "column",
        name: "air_temp",
        sourceName: "weather",
        jsType: "number",
        fieldId: 3425,
        tableId: 423,
        baseType: "type/Float"
      },
      // Display name: Humidity
      humidity: {
        type: "column",
        name: "humidity",
        sourceName: "weather",
        jsType: "number",
        fieldId: 3427,
        tableId: 423,
        baseType: "type/Float"
      },
      // Display name: Pressure
      pressure: {
        type: "column",
        name: "pressure",
        sourceName: "weather",
        jsType: "number",
        fieldId: 3428,
        tableId: 423,
        baseType: "type/Float"
      },
      // Display name: Rainfall
      rainfall: {
        type: "column",
        name: "rainfall",
        sourceName: "weather",
        jsType: "number",
        fieldId: 3429,
        tableId: 423,
        baseType: "type/Integer"
      },
      // Display name: Session ID
      // Semantic type: type/PK
      sessionId: {
        type: "column",
        name: "session_id",
        sourceName: "weather",
        jsType: "number",
        fieldId: 3423,
        tableId: 423,
        baseType: "type/Integer"
      },
      // Display name: Session Time Ms
      // Semantic type: type/PK
      sessionTimeMs: {
        type: "column",
        name: "session_time_ms",
        sourceName: "weather",
        jsType: "number",
        fieldId: 3424,
        tableId: 423,
        baseType: "type/BigInteger"
      },
      // Display name: Track Temp
      trackTemp: {
        type: "column",
        name: "track_temp",
        sourceName: "weather",
        jsType: "number",
        fieldId: 3426,
        tableId: 423,
        baseType: "type/Float"
      },
      // Display name: Wind Direction
      windDirection: {
        type: "column",
        name: "wind_direction",
        sourceName: "weather",
        jsType: "number",
        fieldId: 3430,
        tableId: 423,
        baseType: "type/Float"
      },
      // Display name: Wind Speed
      windSpeed: {
        type: "column",
        name: "wind_speed",
        sourceName: "weather",
        jsType: "number",
        fieldId: 3431,
        tableId: 423,
        baseType: "type/Float"
      }
    }
  }
} as const;

const metrics = { } as const;

const schema = {
  schemaVersion: 2,
  generatedAt: "2026-10-02T10:49:43.055146478Z",
  metabase: {
    instanceUrl: "https://olden-midship.hosted.staging.metabase.com"
  },
  models: models,
  tables: tables,
  metrics: metrics
} as const;

export default schema;

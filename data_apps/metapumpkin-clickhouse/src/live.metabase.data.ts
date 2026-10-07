function pickFields<TFields extends object, TKey extends keyof TFields>(
  fields: TFields,
  keys: readonly TKey[],
  options?: { sourceFieldId?: number },
): Pick<TFields, TKey> {
  return Object.fromEntries(keys.map((key) => {
    const field = fields[key] as { tableId?: number };
    if (options?.sourceFieldId == null) {
      return [key, field];
    }
    const { tableId, ...joinedField } = field;

    return [key, { ...joinedField, sourceFieldId: options.sourceFieldId }];
  })) as Pick<TFields, TKey>;
}

const models = { } as const;

const tables = {
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: business_events
  businessEvents: {
    type: "table",
    id: 511,
    name: "Business Events",
    fields: {
      // Display name: City Key
      // Semantic type: type/FK
      cityKey: {
        type: "column",
        name: "city_key",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4669,
        tableId: 511,
        baseType: "type/Text"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4663,
        tableId: 511,
        baseType: "type/Text"
      },
      // Display name: Days Ago
      daysAgo: {
        type: "column",
        name: "days_ago",
        sourceName: "business_events",
        jsType: "number",
        fieldId: 4662,
        tableId: 511,
        baseType: "type/Integer"
      },
      // Display name: Detail
      // Semantic type: type/Category
      detail: {
        type: "column",
        name: "detail",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4671,
        tableId: 511,
        baseType: "type/Text"
      },
      // Display name: Ended At
      endedAt: {
        type: "column",
        name: "ended_at",
        sourceName: "business_events",
        jsType: "Date",
        fieldId: 4660,
        tableId: 511,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Event ID
      // Semantic type: type/PK
      eventId: {
        type: "column",
        name: "event_id",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4657,
        tableId: 511,
        baseType: "type/Text"
      },
      // Display name: Hub ID
      // Semantic type: type/FK
      hubId: {
        type: "column",
        name: "hub_id",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4665,
        tableId: 511,
        baseType: "type/Text"
      },
      // Display name: Kind
      // Semantic type: type/Category
      kind: {
        type: "column",
        name: "kind",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4658,
        tableId: 511,
        baseType: "type/Text"
      },
      // Display name: Local Date
      localDate: {
        type: "column",
        name: "local_date",
        sourceName: "business_events",
        jsType: "Date",
        fieldId: 4661,
        tableId: 511,
        baseType: "type/Date"
      },
      // Display name: Lost Revenue Usd
      // Semantic type: type/Currency
      lostRevenueUsd: {
        type: "column",
        name: "lost_revenue_usd",
        sourceName: "business_events",
        jsType: "number",
        fieldId: 4674,
        tableId: 511,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4664,
        tableId: 511,
        baseType: "type/Text"
      },
      // Display name: Runs Affected
      runsAffected: {
        type: "column",
        name: "runs_affected",
        sourceName: "business_events",
        jsType: "number",
        fieldId: 4672,
        tableId: 511,
        baseType: "type/Integer"
      },
      // Display name: Started At
      // Semantic type: type/CreationTimestamp
      startedAt: {
        type: "column",
        name: "started_at",
        sourceName: "business_events",
        jsType: "Date",
        fieldId: 4659,
        tableId: 511,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Store ID
      // Semantic type: type/FK
      storeId: {
        type: "column",
        name: "store_id",
        sourceName: "business_events",
        jsType: "number",
        fieldId: 4668,
        tableId: 511,
        baseType: "type/Integer"
      },
      // Display name: Title
      // Semantic type: type/Title
      title: {
        type: "column",
        name: "title",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4670,
        tableId: 511,
        baseType: "type/Text"
      },
      // Display name: Trip ID
      // Semantic type: type/Category
      tripId: {
        type: "column",
        name: "trip_id",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4667,
        tableId: 511,
        baseType: "type/Text"
      },
      // Display name: Truck ID
      // Semantic type: type/FK
      truckId: {
        type: "column",
        name: "truck_id",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4666,
        tableId: 511,
        baseType: "type/Text"
      },
      // Display name: Units
      units: {
        type: "column",
        name: "units",
        sourceName: "business_events",
        jsType: "number",
        fieldId: 4673,
        tableId: 511,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  cities: {
    type: "table",
    id: 512,
    name: "Cities",
    fields: {
      // Display name: City Key
      // Semantic type: type/PK
      cityKey: {
        type: "column",
        name: "city_key",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4675,
        tableId: 512,
        baseType: "type/Text"
      },
      // Display name: City Name
      // Semantic type: type/City
      cityName: {
        type: "column",
        name: "city_name",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4676,
        tableId: 512,
        baseType: "type/Text"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4677,
        tableId: 512,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4678,
        tableId: 512,
        baseType: "type/Text"
      },
      // Display name: Drive Min
      driveMin: {
        type: "column",
        name: "drive_min",
        sourceName: "cities",
        jsType: "number",
        fieldId: 4687,
        tableId: 512,
        baseType: "type/Integer"
      },
      // Display name: Hub ID
      // Semantic type: type/FK
      hubId: {
        type: "column",
        name: "hub_id",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4681,
        tableId: 512,
        baseType: "type/Text"
      },
      // Display name: Hub Name
      // Semantic type: type/Category
      hubName: {
        type: "column",
        name: "hub_name",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4682,
        tableId: 512,
        baseType: "type/Text"
      },
      // Display name: Latitude
      // Semantic type: type/Latitude
      latitude: {
        type: "column",
        name: "latitude",
        sourceName: "cities",
        jsType: "number",
        fieldId: 4684,
        tableId: 512,
        baseType: "type/Decimal"
      },
      // Display name: Longitude
      // Semantic type: type/Longitude
      longitude: {
        type: "column",
        name: "longitude",
        sourceName: "cities",
        jsType: "number",
        fieldId: 4685,
        tableId: 512,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4679,
        tableId: 512,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4680,
        tableId: 512,
        baseType: "type/Text"
      },
      // Display name: Road Km
      roadKm: {
        type: "column",
        name: "road_km",
        sourceName: "cities",
        jsType: "number",
        fieldId: 4686,
        tableId: 512,
        baseType: "type/Integer"
      },
      // Display name: Tz
      // Semantic type: type/Category
      tz: {
        type: "column",
        name: "tz",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4683,
        tableId: 512,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  countries: {
    type: "table",
    id: 513,
    name: "Countries",
    fields: {
      // Display name: Country Code
      // Semantic type: type/PK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "countries",
        jsType: "string",
        fieldId: 4688,
        tableId: 513,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "countries",
        jsType: "string",
        fieldId: 4689,
        tableId: 513,
        baseType: "type/Text"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "countries",
        jsType: "string",
        fieldId: 4690,
        tableId: 513,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "countries",
        jsType: "string",
        fieldId: 4691,
        tableId: 513,
        baseType: "type/Text"
      },
      // Display name: Sort
      sort: {
        type: "column",
        name: "sort",
        sourceName: "countries",
        jsType: "number",
        fieldId: 4693,
        tableId: 513,
        baseType: "type/Integer"
      },
      // Display name: Tz
      // Semantic type: type/Category
      tz: {
        type: "column",
        name: "tz",
        sourceName: "countries",
        jsType: "string",
        fieldId: 4692,
        tableId: 513,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: daily_store_sales
  dailyStoreSales: {
    type: "table",
    id: 514,
    name: "Daily Store Sales",
    fields: {
      // Display name: City Key
      // Semantic type: type/FK
      cityKey: {
        type: "column",
        name: "city_key",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4702,
        tableId: 514,
        baseType: "type/Text"
      },
      // Display name: City Name
      // Semantic type: type/City
      cityName: {
        type: "column",
        name: "city_name",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4703,
        tableId: 514,
        baseType: "type/Text"
      },
      // Display name: Cogs Usd
      // Semantic type: type/Currency
      cogsUsd: {
        type: "column",
        name: "cogs_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4714,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4700,
        tableId: 514,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4701,
        tableId: 514,
        baseType: "type/Text"
      },
      // Display name: Days Ago
      daysAgo: {
        type: "column",
        name: "days_ago",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4695,
        tableId: 514,
        baseType: "type/Integer"
      },
      // Display name: Delivery Cost Usd
      // Semantic type: type/Currency
      deliveryCostUsd: {
        type: "column",
        name: "delivery_cost_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4730,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Gross Margin Usd
      // Semantic type: type/Currency
      grossMarginUsd: {
        type: "column",
        name: "gross_margin_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4715,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Is Weekend
      isWeekend: {
        type: "column",
        name: "is_weekend",
        sourceName: "daily_store_sales",
        jsType: "boolean",
        fieldId: 4697,
        tableId: 514,
        baseType: "type/Boolean"
      },
      // Display name: List Revenue Usd
      // Semantic type: type/Currency
      listRevenueUsd: {
        type: "column",
        name: "list_revenue_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4712,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Local Date
      localDate: {
        type: "column",
        name: "local_date",
        sourceName: "daily_store_sales",
        jsType: "Date",
        fieldId: 4694,
        tableId: 514,
        baseType: "type/Date"
      },
      // Display name: Lost Demand Usd
      // Semantic type: type/Currency
      lostDemandUsd: {
        type: "column",
        name: "lost_demand_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4720,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Lost Late Usd
      // Semantic type: type/Currency
      lostLateUsd: {
        type: "column",
        name: "lost_late_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4718,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Lost Revenue Usd
      // Semantic type: type/Currency
      lostRevenueUsd: {
        type: "column",
        name: "lost_revenue_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4717,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Lost Shortage Usd
      // Semantic type: type/Currency
      lostShortageUsd: {
        type: "column",
        name: "lost_shortage_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4719,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Ly Gross Margin Usd
      // Semantic type: type/Currency
      lyGrossMarginUsd: {
        type: "column",
        name: "ly_gross_margin_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4734,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Ly Revenue Full Usd
      // Semantic type: type/Currency
      lyRevenueFullUsd: {
        type: "column",
        name: "ly_revenue_full_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4726,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Ly Revenue Usd
      // Semantic type: type/Currency
      lyRevenueUsd: {
        type: "column",
        name: "ly_revenue_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4725,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Ly Units
      lyUnits: {
        type: "column",
        name: "ly_units",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4724,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Markdown Usd
      // Semantic type: type/Currency
      markdownUsd: {
        type: "column",
        name: "markdown_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4713,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Online Revenue Usd
      // Semantic type: type/Currency
      onlineRevenueUsd: {
        type: "column",
        name: "online_revenue_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4716,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Open Minutes
      openMinutes: {
        type: "column",
        name: "open_minutes",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4732,
        tableId: 514,
        baseType: "type/Integer"
      },
      // Display name: Plan Gross Margin Usd
      // Semantic type: type/Currency
      planGrossMarginUsd: {
        type: "column",
        name: "plan_gross_margin_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4733,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Plan Revenue Full Usd
      // Semantic type: type/Currency
      planRevenueFullUsd: {
        type: "column",
        name: "plan_revenue_full_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4723,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Plan Revenue Usd
      // Semantic type: type/Currency
      planRevenueUsd: {
        type: "column",
        name: "plan_revenue_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4722,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Plan Units
      planUnits: {
        type: "column",
        name: "plan_units",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4721,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4698,
        tableId: 514,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4699,
        tableId: 514,
        baseType: "type/Text"
      },
      // Display name: Revenue Usd
      // Semantic type: type/Currency
      revenueUsd: {
        type: "column",
        name: "revenue_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4711,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Season Day
      seasonDay: {
        type: "column",
        name: "season_day",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4696,
        tableId: 514,
        baseType: "type/Integer"
      },
      // Display name: Shrink Shelf Usd
      // Semantic type: type/Currency
      shrinkShelfUsd: {
        type: "column",
        name: "shrink_shelf_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4728,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Shrink Transit Usd
      // Semantic type: type/Currency
      shrinkTransitUsd: {
        type: "column",
        name: "shrink_transit_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4727,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Shrink Usd
      // Semantic type: type/Currency
      shrinkUsd: {
        type: "column",
        name: "shrink_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4729,
        tableId: 514,
        baseType: "type/Decimal"
      },
      // Display name: Stockout Minutes
      stockoutMinutes: {
        type: "column",
        name: "stockout_minutes",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4731,
        tableId: 514,
        baseType: "type/Integer"
      },
      // Display name: Store Format
      // Semantic type: type/Category
      storeFormat: {
        type: "column",
        name: "store_format",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4706,
        tableId: 514,
        baseType: "type/Text"
      },
      // Display name: Store ID
      // Semantic type: type/FK
      storeId: {
        type: "column",
        name: "store_id",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4704,
        tableId: 514,
        baseType: "type/Integer"
      },
      // Display name: Store Name
      storeName: {
        type: "column",
        name: "store_name",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4705,
        tableId: 514,
        baseType: "type/Text"
      },
      // Display name: Units Lost
      unitsLost: {
        type: "column",
        name: "units_lost",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4710,
        tableId: 514,
        baseType: "type/Integer"
      },
      // Display name: Units Requested
      unitsRequested: {
        type: "column",
        name: "units_requested",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4708,
        tableId: 514,
        baseType: "type/Integer"
      },
      // Display name: Units Sold
      unitsSold: {
        type: "column",
        name: "units_sold",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4709,
        tableId: 514,
        baseType: "type/Integer"
      },
      // Display name: Variety Name
      // Semantic type: type/Category
      varietyName: {
        type: "column",
        name: "variety_name",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4707,
        tableId: 514,
        baseType: "type/Text"
      }
    },
    segments: {
      // Entity ID: NzfTLjSwTatd5AaQYc6C5
      // Description: Today and the six days before, on the simulated clock.
      last7Days: {
        type: "segment",
        id: 34,
        tableId: 514,
        name: "Last 7 days"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  deliveries: {
    type: "table",
    id: 515,
    name: "Deliveries",
    fields: {
      // Display name: Arrived At
      arrivedAt: {
        type: "column",
        name: "arrived_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4759,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Bins
      bins: {
        type: "column",
        name: "bins",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4775,
        tableId: 515,
        baseType: "type/Decimal"
      },
      // Display name: Capacity Bins
      capacityBins: {
        type: "column",
        name: "capacity_bins",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4776,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: Cargo Value Usd
      // Semantic type: type/Currency
      cargoValueUsd: {
        type: "column",
        name: "cargo_value_usd",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4780,
        tableId: 515,
        baseType: "type/Decimal"
      },
      // Display name: Carving Units
      carvingUnits: {
        type: "column",
        name: "carving_units",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4772,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: City Key
      // Semantic type: type/FK
      cityKey: {
        type: "column",
        name: "city_key",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4748,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: City Name
      // Semantic type: type/City
      cityName: {
        type: "column",
        name: "city_name",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4749,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Cooking Units
      cookingUnits: {
        type: "column",
        name: "cooking_units",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4773,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4746,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4747,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Damaged Units
      damagedUnits: {
        type: "column",
        name: "damaged_units",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4781,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: Days Ago
      daysAgo: {
        type: "column",
        name: "days_ago",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4737,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: Delay Cause
      // Semantic type: type/Category
      delayCause: {
        type: "column",
        name: "delay_cause",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4766,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Delay Note
      delayNote: {
        type: "column",
        name: "delay_note",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4767,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Delivery Cost Usd
      // Semantic type: type/Currency
      deliveryCostUsd: {
        type: "column",
        name: "delivery_cost_usd",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4782,
        tableId: 515,
        baseType: "type/Decimal"
      },
      // Display name: Departed At
      departedAt: {
        type: "column",
        name: "departed_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4756,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Driver Name
      driverName: {
        type: "column",
        name: "driver_name",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4741,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Eta At
      etaAt: {
        type: "column",
        name: "eta_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4758,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Fill Pct
      fillPct: {
        type: "column",
        name: "fill_pct",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4777,
        tableId: 515,
        baseType: "type/Decimal"
      },
      // Display name: Hub ID
      // Semantic type: type/FK
      hubId: {
        type: "column",
        name: "hub_id",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4742,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Hub Name
      // Semantic type: type/Category
      hubName: {
        type: "column",
        name: "hub_name",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4743,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Is Active
      isActive: {
        type: "column",
        name: "is_active",
        sourceName: "deliveries",
        jsType: "boolean",
        fieldId: 4753,
        tableId: 515,
        baseType: "type/Boolean"
      },
      // Display name: Is Delivered
      isDelivered: {
        type: "column",
        name: "is_delivered",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4764,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: Is Heading To Store
      isHeadingToStore: {
        type: "column",
        name: "is_heading_to_store",
        sourceName: "deliveries",
        jsType: "boolean",
        fieldId: 4754,
        tableId: 515,
        baseType: "type/Boolean"
      },
      // Display name: Is Late
      isLate: {
        type: "column",
        name: "is_late",
        sourceName: "deliveries",
        jsType: "boolean",
        fieldId: 4763,
        tableId: 515,
        baseType: "type/Boolean"
      },
      // Display name: Is On Time
      isOnTime: {
        type: "column",
        name: "is_on_time",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4765,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: Kg
      kg: {
        type: "column",
        name: "kg",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4778,
        tableId: 515,
        baseType: "type/Decimal"
      },
      // Display name: Km Done
      kmDone: {
        type: "column",
        name: "km_done",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4770,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: Km Total
      kmTotal: {
        type: "column",
        name: "km_total",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4769,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: Late Minutes
      lateMinutes: {
        type: "column",
        name: "late_minutes",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4762,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: Local Date
      localDate: {
        type: "column",
        name: "local_date",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4736,
        tableId: 515,
        baseType: "type/Date"
      },
      // Display name: Mini Units
      miniUnits: {
        type: "column",
        name: "mini_units",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4774,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: Payload Kg
      payloadKg: {
        type: "column",
        name: "payload_kg",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4779,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: Planned Arrive At
      plannedArriveAt: {
        type: "column",
        name: "planned_arrive_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4757,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Planned Depart At
      plannedDepartAt: {
        type: "column",
        name: "planned_depart_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4755,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Progress Pct
      progressPct: {
        type: "column",
        name: "progress_pct",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4768,
        tableId: 515,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4744,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4745,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Returned At
      returnedAt: {
        type: "column",
        name: "returned_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4761,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Status
      // Semantic type: type/Category
      status: {
        type: "column",
        name: "status",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4752,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Store ID
      // Semantic type: type/FK
      storeId: {
        type: "column",
        name: "store_id",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4750,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: Store Name
      storeName: {
        type: "column",
        name: "store_name",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4751,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Trip ID
      tripId: {
        type: "column",
        name: "trip_id",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4735,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Truck ID
      // Semantic type: type/FK
      truckId: {
        type: "column",
        name: "truck_id",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4739,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Truck Label
      truckLabel: {
        type: "column",
        name: "truck_label",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4740,
        tableId: 515,
        baseType: "type/Text"
      },
      // Display name: Units Total
      unitsTotal: {
        type: "column",
        name: "units_total",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4771,
        tableId: 515,
        baseType: "type/Integer"
      },
      // Display name: Unloaded At
      unloadedAt: {
        type: "column",
        name: "unloaded_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4760,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Wave
      wave: {
        type: "column",
        name: "wave",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4738,
        tableId: 515,
        baseType: "type/Integer"
      }
    },
    segments: {
      // Entity ID: 2x4dKoJ6RKh5JZUahnl85
      // Description: Today and the six days before, on the simulated clock.
      last7Days: {
        type: "segment",
        id: 35,
        tableId: 515,
        name: "Last 7 days"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: fleet_now
  fleetNow: {
    type: "table",
    id: 516,
    name: "Fleet Now",
    fields: {
      // Display name: Bins Aboard
      binsAboard: {
        type: "column",
        name: "bins_aboard",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4818,
        tableId: 516,
        baseType: "type/Decimal"
      },
      // Display name: Body
      // Semantic type: type/Category
      body: {
        type: "column",
        name: "body",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4794,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Capacity Bins
      capacityBins: {
        type: "column",
        name: "capacity_bins",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4819,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Cargo Temp C
      cargoTempC: {
        type: "column",
        name: "cargo_temp_c",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4841,
        tableId: 516,
        baseType: "type/Decimal"
      },
      // Display name: Cargo Value Usd
      // Semantic type: type/Currency
      cargoValueUsd: {
        type: "column",
        name: "cargo_value_usd",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4823,
        tableId: 516,
        baseType: "type/Decimal"
      },
      // Display name: Carving Aboard
      carvingAboard: {
        type: "column",
        name: "carving_aboard",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4815,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Cooking Aboard
      cookingAboard: {
        type: "column",
        name: "cooking_aboard",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4816,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Coolant C
      coolantC: {
        type: "column",
        name: "coolant_c",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4840,
        tableId: 516,
        baseType: "type/Decimal"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4790,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4791,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Delay Cause
      delayCause: {
        type: "column",
        name: "delay_cause",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4809,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Delay Note
      delayNote: {
        type: "column",
        name: "delay_note",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4810,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Delivered 7d
      delivered7d: {
        type: "column",
        name: "delivered_7d",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4845,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Departed At
      departedAt: {
        type: "column",
        name: "departed_at",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4804,
        tableId: 516,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Dest City Key
      // Semantic type: type/Category
      destCityKey: {
        type: "column",
        name: "dest_city_key",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4801,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Dest City Name
      // Semantic type: type/City
      destCityName: {
        type: "column",
        name: "dest_city_name",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4802,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Dest Store ID
      destStoreId: {
        type: "column",
        name: "dest_store_id",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4799,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Dest Store Name
      // Semantic type: type/Category
      destStoreName: {
        type: "column",
        name: "dest_store_name",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4800,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Driver Name
      driverName: {
        type: "column",
        name: "driver_name",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4796,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Eta At
      etaAt: {
        type: "column",
        name: "eta_at",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4806,
        tableId: 516,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Fill Pct
      fillPct: {
        type: "column",
        name: "fill_pct",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4820,
        tableId: 516,
        baseType: "type/Decimal"
      },
      // Display name: Fleet No
      fleetNo: {
        type: "column",
        name: "fleet_no",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4784,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Fuel Pct
      fuelPct: {
        type: "column",
        name: "fuel_pct",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4839,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Hub ID
      // Semantic type: type/FK
      hubId: {
        type: "column",
        name: "hub_id",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4786,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Hub Name
      // Semantic type: type/Category
      hubName: {
        type: "column",
        name: "hub_name",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4787,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Is Late
      isLate: {
        type: "column",
        name: "is_late",
        sourceName: "fleet_now",
        jsType: "boolean",
        fieldId: 4808,
        tableId: 516,
        baseType: "type/Boolean"
      },
      // Display name: Kg Aboard
      kgAboard: {
        type: "column",
        name: "kg_aboard",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4821,
        tableId: 516,
        baseType: "type/Decimal"
      },
      // Display name: Km 7d
      km7d: {
        type: "column",
        name: "km_7d",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4844,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Km Done
      kmDone: {
        type: "column",
        name: "km_done",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4813,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Km Since Service
      kmSinceService: {
        type: "column",
        name: "km_since_service",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4828,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Km To Service
      kmToService: {
        type: "column",
        name: "km_to_service",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4830,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Km Total
      kmTotal: {
        type: "column",
        name: "km_total",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4812,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Last Ping At
      lastPingAt: {
        type: "column",
        name: "last_ping_at",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4842,
        tableId: 516,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Last Service Km
      lastServiceKm: {
        type: "column",
        name: "last_service_km",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4833,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Last Service On
      lastServiceOn: {
        type: "column",
        name: "last_service_on",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4832,
        tableId: 516,
        baseType: "type/Date"
      },
      // Display name: Late Minutes
      lateMinutes: {
        type: "column",
        name: "late_minutes",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4807,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Latitude
      // Semantic type: type/Latitude
      latitude: {
        type: "column",
        name: "latitude",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4824,
        tableId: 516,
        baseType: "type/Float"
      },
      // Display name: Longitude
      // Semantic type: type/Longitude
      longitude: {
        type: "column",
        name: "longitude",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4825,
        tableId: 516,
        baseType: "type/Float"
      },
      // Display name: Make Model
      // Semantic type: type/Category
      makeModel: {
        type: "column",
        name: "make_model",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4793,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Mini Aboard
      miniAboard: {
        type: "column",
        name: "mini_aboard",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4817,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Odometer Km
      odometerKm: {
        type: "column",
        name: "odometer_km",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4827,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: On Time 7d
      onTime7d: {
        type: "column",
        name: "on_time_7d",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4846,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Open Fault Code
      // Semantic type: type/Category
      openFaultCode: {
        type: "column",
        name: "open_fault_code",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4835,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Open Fault Desc
      // Semantic type: type/Category
      openFaultDesc: {
        type: "column",
        name: "open_fault_desc",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4836,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Open Fault Severity
      // Semantic type: type/Category
      openFaultSeverity: {
        type: "column",
        name: "open_fault_severity",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4837,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Open Fault Since
      openFaultSince: {
        type: "column",
        name: "open_fault_since",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4838,
        tableId: 516,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Payload Kg
      payloadKg: {
        type: "column",
        name: "payload_kg",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4822,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Planned Arrive At
      plannedArriveAt: {
        type: "column",
        name: "planned_arrive_at",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4805,
        tableId: 516,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Planned Depart At
      plannedDepartAt: {
        type: "column",
        name: "planned_depart_at",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4803,
        tableId: 516,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Plate
      plate: {
        type: "column",
        name: "plate",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4795,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Progress Pct
      progressPct: {
        type: "column",
        name: "progress_pct",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4811,
        tableId: 516,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4788,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4789,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Service Booked On
      serviceBookedOn: {
        type: "column",
        name: "service_booked_on",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4834,
        tableId: 516,
        baseType: "type/Date"
      },
      // Display name: Service Interval Km
      serviceIntervalKm: {
        type: "column",
        name: "service_interval_km",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4829,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Service Status
      // Semantic type: type/State
      serviceStatus: {
        type: "column",
        name: "service_status",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4831,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Speed Kmh
      speedKmh: {
        type: "column",
        name: "speed_kmh",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4826,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Status
      // Semantic type: type/Category
      status: {
        type: "column",
        name: "status",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4797,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Trip ID
      // Semantic type: type/Category
      tripId: {
        type: "column",
        name: "trip_id",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4798,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Trips 7d
      trips7d: {
        type: "column",
        name: "trips_7d",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4843,
        tableId: 516,
        baseType: "type/Integer"
      },
      // Display name: Truck ID
      // Semantic type: type/FK
      truckId: {
        type: "column",
        name: "truck_id",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4783,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Truck Label
      truckLabel: {
        type: "column",
        name: "truck_label",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4785,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Tz
      // Semantic type: type/Category
      tz: {
        type: "column",
        name: "tz",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4792,
        tableId: 516,
        baseType: "type/Text"
      },
      // Display name: Units Aboard
      unitsAboard: {
        type: "column",
        name: "units_aboard",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4814,
        tableId: 516,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: harvest_daily
  harvestDaily: {
    type: "table",
    id: 517,
    name: "Harvest Daily",
    fields: {
      // Display name: Bins
      bins: {
        type: "column",
        name: "bins",
        sourceName: "harvest_daily",
        jsType: "number",
        fieldId: 4858,
        tableId: 517,
        baseType: "type/Decimal"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4851,
        tableId: 517,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4852,
        tableId: 517,
        baseType: "type/Text"
      },
      // Display name: Days Ago
      daysAgo: {
        type: "column",
        name: "days_ago",
        sourceName: "harvest_daily",
        jsType: "number",
        fieldId: 4857,
        tableId: 517,
        baseType: "type/Integer"
      },
      // Display name: Field ID
      // Semantic type: type/Category
      fieldId: {
        type: "column",
        name: "field_id",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4847,
        tableId: 517,
        baseType: "type/Text"
      },
      // Display name: Field Name
      // Semantic type: type/Category
      fieldName: {
        type: "column",
        name: "field_name",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4848,
        tableId: 517,
        baseType: "type/Text"
      },
      // Display name: Hub ID
      // Semantic type: type/FK
      hubId: {
        type: "column",
        name: "hub_id",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4849,
        tableId: 517,
        baseType: "type/Text"
      },
      // Display name: Hub Name
      // Semantic type: type/Category
      hubName: {
        type: "column",
        name: "hub_name",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4850,
        tableId: 517,
        baseType: "type/Text"
      },
      // Display name: Is Rain Stop
      isRainStop: {
        type: "column",
        name: "is_rain_stop",
        sourceName: "harvest_daily",
        jsType: "boolean",
        fieldId: 4861,
        tableId: 517,
        baseType: "type/Boolean"
      },
      // Display name: Local Date
      localDate: {
        type: "column",
        name: "local_date",
        sourceName: "harvest_daily",
        jsType: "Date",
        fieldId: 4856,
        tableId: 517,
        baseType: "type/Date"
      },
      // Display name: Plan Bins
      planBins: {
        type: "column",
        name: "plan_bins",
        sourceName: "harvest_daily",
        jsType: "number",
        fieldId: 4859,
        tableId: 517,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4853,
        tableId: 517,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4854,
        tableId: 517,
        baseType: "type/Text"
      },
      // Display name: Units
      units: {
        type: "column",
        name: "units",
        sourceName: "harvest_daily",
        jsType: "number",
        fieldId: 4860,
        tableId: 517,
        baseType: "type/Integer"
      },
      // Display name: Variety Name
      // Semantic type: type/Category
      varietyName: {
        type: "column",
        name: "variety_name",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4855,
        tableId: 517,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: hourly_store_sales
  hourlyStoreSales: {
    type: "table",
    id: 518,
    name: "Hourly Store Sales",
    fields: {
      // Display name: City Key
      // Semantic type: type/FK
      cityKey: {
        type: "column",
        name: "city_key",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4870,
        tableId: 518,
        baseType: "type/Text"
      },
      // Display name: City Name
      // Semantic type: type/City
      cityName: {
        type: "column",
        name: "city_name",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4871,
        tableId: 518,
        baseType: "type/Text"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4868,
        tableId: 518,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4869,
        tableId: 518,
        baseType: "type/Text"
      },
      // Display name: Days Ago
      daysAgo: {
        type: "column",
        name: "days_ago",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4863,
        tableId: 518,
        baseType: "type/Integer"
      },
      // Display name: Is Current Hour
      isCurrentHour: {
        type: "column",
        name: "is_current_hour",
        sourceName: "hourly_store_sales",
        jsType: "boolean",
        fieldId: 4865,
        tableId: 518,
        baseType: "type/Boolean"
      },
      // Display name: Local Date
      localDate: {
        type: "column",
        name: "local_date",
        sourceName: "hourly_store_sales",
        jsType: "Date",
        fieldId: 4862,
        tableId: 518,
        baseType: "type/Date"
      },
      // Display name: Local Hour
      localHour: {
        type: "column",
        name: "local_hour",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4864,
        tableId: 518,
        baseType: "type/Integer"
      },
      // Display name: Lost Revenue Usd
      // Semantic type: type/Currency
      lostRevenueUsd: {
        type: "column",
        name: "lost_revenue_usd",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4877,
        tableId: 518,
        baseType: "type/Decimal"
      },
      // Display name: Plan Revenue Usd
      // Semantic type: type/Currency
      planRevenueUsd: {
        type: "column",
        name: "plan_revenue_usd",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4878,
        tableId: 518,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4866,
        tableId: 518,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4867,
        tableId: 518,
        baseType: "type/Text"
      },
      // Display name: Revenue Usd
      // Semantic type: type/Currency
      revenueUsd: {
        type: "column",
        name: "revenue_usd",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4876,
        tableId: 518,
        baseType: "type/Decimal"
      },
      // Display name: Store ID
      // Semantic type: type/FK
      storeId: {
        type: "column",
        name: "store_id",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4872,
        tableId: 518,
        baseType: "type/Integer"
      },
      // Display name: Store Name
      storeName: {
        type: "column",
        name: "store_name",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4873,
        tableId: 518,
        baseType: "type/Text"
      },
      // Display name: Units Lost
      unitsLost: {
        type: "column",
        name: "units_lost",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4875,
        tableId: 518,
        baseType: "type/Integer"
      },
      // Display name: Units Sold
      unitsSold: {
        type: "column",
        name: "units_sold",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4874,
        tableId: 518,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: hub_now
  hubNow: {
    type: "table",
    id: 519,
    name: "Hub Now",
    fields: {
      // Display name: Bins Today
      binsToday: {
        type: "column",
        name: "bins_today",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4889,
        tableId: 519,
        baseType: "type/Decimal"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4881,
        tableId: 519,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4882,
        tableId: 519,
        baseType: "type/Text"
      },
      // Display name: Fields Picking
      fieldsPicking: {
        type: "column",
        name: "fields_picking",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4888,
        tableId: 519,
        baseType: "type/Integer"
      },
      // Display name: Harvest Note
      // Semantic type: type/Category
      harvestNote: {
        type: "column",
        name: "harvest_note",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4887,
        tableId: 519,
        baseType: "type/Text"
      },
      // Display name: Harvest Status
      // Semantic type: type/Category
      harvestStatus: {
        type: "column",
        name: "harvest_status",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4886,
        tableId: 519,
        baseType: "type/Text"
      },
      // Display name: Hub ID
      // Semantic type: type/FK
      hubId: {
        type: "column",
        name: "hub_id",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4879,
        tableId: 519,
        baseType: "type/Text"
      },
      // Display name: Hub Name
      // Semantic type: type/Category
      hubName: {
        type: "column",
        name: "hub_name",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4880,
        tableId: 519,
        baseType: "type/Text"
      },
      // Display name: Hub Stock Days
      hubStockDays: {
        type: "column",
        name: "hub_stock_days",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4892,
        tableId: 519,
        baseType: "type/Decimal"
      },
      // Display name: Hub Stock Units
      hubStockUnits: {
        type: "column",
        name: "hub_stock_units",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4891,
        tableId: 519,
        baseType: "type/Integer"
      },
      // Display name: Next Wave At
      nextWaveAt: {
        type: "column",
        name: "next_wave_at",
        sourceName: "hub_now",
        jsType: "Date",
        fieldId: 4902,
        tableId: 519,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Plan Bins Today
      planBinsToday: {
        type: "column",
        name: "plan_bins_today",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4890,
        tableId: 519,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4883,
        tableId: 519,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4884,
        tableId: 519,
        baseType: "type/Text"
      },
      // Display name: Tz
      // Semantic type: type/Category
      tz: {
        type: "column",
        name: "tz",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4885,
        tableId: 519,
        baseType: "type/Text"
      },
      // Display name: Vans At Hub
      vansAtHub: {
        type: "column",
        name: "vans_at_hub",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4894,
        tableId: 519,
        baseType: "type/Integer"
      },
      // Display name: Vans Heading
      vansHeading: {
        type: "column",
        name: "vans_heading",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4900,
        tableId: 519,
        baseType: "type/Integer"
      },
      // Display name: Vans Late
      vansLate: {
        type: "column",
        name: "vans_late",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4901,
        tableId: 519,
        baseType: "type/Integer"
      },
      // Display name: Vans Loading
      vansLoading: {
        type: "column",
        name: "vans_loading",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4895,
        tableId: 519,
        baseType: "type/Integer"
      },
      // Display name: Vans On Road
      vansOnRoad: {
        type: "column",
        name: "vans_on_road",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4896,
        tableId: 519,
        baseType: "type/Integer"
      },
      // Display name: Vans Returning
      vansReturning: {
        type: "column",
        name: "vans_returning",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4898,
        tableId: 519,
        baseType: "type/Integer"
      },
      // Display name: Vans Total
      vansTotal: {
        type: "column",
        name: "vans_total",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4893,
        tableId: 519,
        baseType: "type/Integer"
      },
      // Display name: Vans Unloading
      vansUnloading: {
        type: "column",
        name: "vans_unloading",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4897,
        tableId: 519,
        baseType: "type/Integer"
      },
      // Display name: Vans Workshop
      vansWorkshop: {
        type: "column",
        name: "vans_workshop",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4899,
        tableId: 519,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  hubs: {
    type: "table",
    id: 520,
    name: "Hubs",
    fields: {
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "hubs",
        jsType: "string",
        fieldId: 4905,
        tableId: 520,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "hubs",
        jsType: "string",
        fieldId: 4906,
        tableId: 520,
        baseType: "type/Text"
      },
      // Display name: Hub ID
      // Semantic type: type/PK
      hubId: {
        type: "column",
        name: "hub_id",
        sourceName: "hubs",
        jsType: "string",
        fieldId: 4903,
        tableId: 520,
        baseType: "type/Text"
      },
      // Display name: Hub Name
      // Semantic type: type/Category
      hubName: {
        type: "column",
        name: "hub_name",
        sourceName: "hubs",
        jsType: "string",
        fieldId: 4904,
        tableId: 520,
        baseType: "type/Text"
      },
      // Display name: Latitude
      // Semantic type: type/Latitude
      latitude: {
        type: "column",
        name: "latitude",
        sourceName: "hubs",
        jsType: "number",
        fieldId: 4910,
        tableId: 520,
        baseType: "type/Decimal"
      },
      // Display name: Longitude
      // Semantic type: type/Longitude
      longitude: {
        type: "column",
        name: "longitude",
        sourceName: "hubs",
        jsType: "number",
        fieldId: 4911,
        tableId: 520,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "hubs",
        jsType: "string",
        fieldId: 4907,
        tableId: 520,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "hubs",
        jsType: "string",
        fieldId: 4908,
        tableId: 520,
        baseType: "type/Text"
      },
      // Display name: Tz
      // Semantic type: type/Category
      tz: {
        type: "column",
        name: "tz",
        sourceName: "hubs",
        jsType: "string",
        fieldId: 4909,
        tableId: 520,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: ops_part_events
  opsPartEvents: {
    type: "table",
    id: 521,
    name: "Ops Part Events",
    fields: {
      // Display name: Duration Ms
      // Semantic type: type/Duration
      durationMs: {
        type: "column",
        name: "duration_ms",
        sourceName: "ops_part_events",
        jsType: "number",
        fieldId: 4918,
        tableId: 521,
        baseType: "type/BigInteger"
      },
      // Display name: Event At
      eventAt: {
        type: "column",
        name: "event_at",
        sourceName: "ops_part_events",
        jsType: "Date",
        fieldId: 4912,
        tableId: 521,
        baseType: "type/DateTime"
      },
      // Display name: Event Type
      // Semantic type: type/Category
      eventType: {
        type: "column",
        name: "event_type",
        sourceName: "ops_part_events",
        jsType: "string",
        fieldId: 4913,
        tableId: 521,
        baseType: "type/Text"
      },
      // Display name: Merge Reason
      // Semantic type: type/Category
      mergeReason: {
        type: "column",
        name: "merge_reason",
        sourceName: "ops_part_events",
        jsType: "string",
        fieldId: 4920,
        tableId: 521,
        baseType: "type/Text"
      },
      // Display name: Merged From
      mergedFrom: {
        type: "column",
        name: "merged_from",
        sourceName: "ops_part_events",
        jsType: "string",
        fieldId: 4919,
        tableId: 521,
        baseType: "type/Text"
      },
      // Display name: Part Name
      partName: {
        type: "column",
        name: "part_name",
        sourceName: "ops_part_events",
        jsType: "string",
        fieldId: 4915,
        tableId: 521,
        baseType: "type/Text"
      },
      // Display name: Rows
      rows: {
        type: "column",
        name: "rows",
        sourceName: "ops_part_events",
        jsType: "number",
        fieldId: 4916,
        tableId: 521,
        baseType: "type/BigInteger"
      },
      // Display name: Size In Bytes
      sizeInBytes: {
        type: "column",
        name: "size_in_bytes",
        sourceName: "ops_part_events",
        jsType: "number",
        fieldId: 4917,
        tableId: 521,
        baseType: "type/BigInteger"
      },
      // Display name: Table Name
      // Semantic type: type/Category
      tableName: {
        type: "column",
        name: "table_name",
        sourceName: "ops_part_events",
        jsType: "string",
        fieldId: 4914,
        tableId: 521,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: ops_parts
  opsParts: {
    type: "table",
    id: 522,
    name: "Ops Parts",
    fields: {
      // Display name: Bytes On Disk
      bytesOnDisk: {
        type: "column",
        name: "bytes_on_disk",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4928,
        tableId: 522,
        baseType: "type/BigInteger"
      },
      // Display name: Data Compressed Bytes
      dataCompressedBytes: {
        type: "column",
        name: "data_compressed_bytes",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4929,
        tableId: 522,
        baseType: "type/BigInteger"
      },
      // Display name: Data Uncompressed Bytes
      dataUncompressedBytes: {
        type: "column",
        name: "data_uncompressed_bytes",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4930,
        tableId: 522,
        baseType: "type/BigInteger"
      },
      // Display name: Level
      level: {
        type: "column",
        name: "level",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4926,
        tableId: 522,
        baseType: "type/Integer"
      },
      // Display name: Max Block Number
      // Semantic type: type/Quantity
      maxBlockNumber: {
        type: "column",
        name: "max_block_number",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4925,
        tableId: 522,
        baseType: "type/BigInteger"
      },
      // Display name: Min Block Number
      // Semantic type: type/Quantity
      minBlockNumber: {
        type: "column",
        name: "min_block_number",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4924,
        tableId: 522,
        baseType: "type/BigInteger"
      },
      // Display name: Modified At
      modifiedAt: {
        type: "column",
        name: "modified_at",
        sourceName: "ops_parts",
        jsType: "Date",
        fieldId: 4931,
        tableId: 522,
        baseType: "type/DateTime"
      },
      // Display name: Part Name
      partName: {
        type: "column",
        name: "part_name",
        sourceName: "ops_parts",
        jsType: "string",
        fieldId: 4922,
        tableId: 522,
        baseType: "type/Text"
      },
      // Display name: Partition ID
      // Semantic type: type/Category
      partitionId: {
        type: "column",
        name: "partition_id",
        sourceName: "ops_parts",
        jsType: "string",
        fieldId: 4923,
        tableId: 522,
        baseType: "type/Text"
      },
      // Display name: Rows
      rows: {
        type: "column",
        name: "rows",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4927,
        tableId: 522,
        baseType: "type/BigInteger"
      },
      // Display name: Table Name
      tableName: {
        type: "column",
        name: "table_name",
        sourceName: "ops_parts",
        jsType: "string",
        fieldId: 4921,
        tableId: 522,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: ops_queries
  opsQueries: {
    type: "table",
    id: 523,
    name: "Ops Queries",
    fields: {
      // Display name: Duration Ms
      // Semantic type: type/Duration
      durationMs: {
        type: "column",
        name: "duration_ms",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4936,
        tableId: 523,
        baseType: "type/Integer"
      },
      // Display name: Memory Bytes
      memoryBytes: {
        type: "column",
        name: "memory_bytes",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4940,
        tableId: 523,
        baseType: "type/BigInteger"
      },
      // Display name: Query Hash
      queryHash: {
        type: "column",
        name: "query_hash",
        sourceName: "ops_queries",
        jsType: "string",
        fieldId: 4935,
        tableId: 523,
        baseType: "type/Text"
      },
      // Display name: Ran At
      ranAt: {
        type: "column",
        name: "ran_at",
        sourceName: "ops_queries",
        jsType: "Date",
        fieldId: 4932,
        tableId: 523,
        baseType: "type/DateTime"
      },
      // Display name: Read Bytes
      readBytes: {
        type: "column",
        name: "read_bytes",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4938,
        tableId: 523,
        baseType: "type/BigInteger"
      },
      // Display name: Read Rows
      readRows: {
        type: "column",
        name: "read_rows",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4937,
        tableId: 523,
        baseType: "type/BigInteger"
      },
      // Display name: Result Rows
      resultRows: {
        type: "column",
        name: "result_rows",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4939,
        tableId: 523,
        baseType: "type/BigInteger"
      },
      // Display name: Selected Granules
      selectedGranules: {
        type: "column",
        name: "selected_granules",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4942,
        tableId: 523,
        baseType: "type/BigInteger"
      },
      // Display name: Selected Parts
      selectedParts: {
        type: "column",
        name: "selected_parts",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4941,
        tableId: 523,
        baseType: "type/BigInteger"
      },
      // Display name: Sql Text
      sqlText: {
        type: "column",
        name: "sql_text",
        sourceName: "ops_queries",
        jsType: "string",
        fieldId: 4943,
        tableId: 523,
        baseType: "type/Text"
      },
      // Display name: View Name
      // Semantic type: type/Category
      viewName: {
        type: "column",
        name: "view_name",
        sourceName: "ops_queries",
        jsType: "string",
        fieldId: 4933,
        tableId: 523,
        baseType: "type/Text"
      },
      // Display name: Views
      // Semantic type: type/Category
      views: {
        type: "column",
        name: "views",
        sourceName: "ops_queries",
        jsType: "string",
        fieldId: 4934,
        tableId: 523,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: recent_sales
  recentSales: {
    type: "table",
    id: 524,
    name: "Recent Sales",
    fields: {
      // Display name: Amount Usd
      // Semantic type: type/Currency
      amountUsd: {
        type: "column",
        name: "amount_usd",
        sourceName: "recent_sales",
        jsType: "number",
        fieldId: 4956,
        tableId: 524,
        baseType: "type/Decimal"
      },
      // Display name: Channel
      // Semantic type: type/Source
      channel: {
        type: "column",
        name: "channel",
        sourceName: "recent_sales",
        jsType: "string",
        fieldId: 4954,
        tableId: 524,
        baseType: "type/Text"
      },
      // Display name: City Key
      // Semantic type: type/FK
      cityKey: {
        type: "column",
        name: "city_key",
        sourceName: "recent_sales",
        jsType: "string",
        fieldId: 4949,
        tableId: 524,
        baseType: "type/Text"
      },
      // Display name: City Name
      // Semantic type: type/City
      cityName: {
        type: "column",
        name: "city_name",
        sourceName: "recent_sales",
        jsType: "string",
        fieldId: 4950,
        tableId: 524,
        baseType: "type/Text"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "recent_sales",
        jsType: "string",
        fieldId: 4951,
        tableId: 524,
        baseType: "type/Text"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "recent_sales",
        jsType: "string",
        fieldId: 4952,
        tableId: 524,
        baseType: "type/Text"
      },
      // Display name: Sale ID
      // Semantic type: type/PK
      saleId: {
        type: "column",
        name: "sale_id",
        sourceName: "recent_sales",
        jsType: "number",
        fieldId: 4944,
        tableId: 524,
        baseType: "type/BigInteger"
      },
      // Display name: Seconds Ago
      secondsAgo: {
        type: "column",
        name: "seconds_ago",
        sourceName: "recent_sales",
        jsType: "number",
        fieldId: 4946,
        tableId: 524,
        baseType: "type/Integer"
      },
      // Display name: Sold At
      soldAt: {
        type: "column",
        name: "sold_at",
        sourceName: "recent_sales",
        jsType: "Date",
        fieldId: 4945,
        tableId: 524,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Store ID
      // Semantic type: type/FK
      storeId: {
        type: "column",
        name: "store_id",
        sourceName: "recent_sales",
        jsType: "number",
        fieldId: 4947,
        tableId: 524,
        baseType: "type/Integer"
      },
      // Display name: Store Name
      storeName: {
        type: "column",
        name: "store_name",
        sourceName: "recent_sales",
        jsType: "string",
        fieldId: 4948,
        tableId: 524,
        baseType: "type/Text"
      },
      // Display name: Unit Price Usd
      // Semantic type: type/Currency
      unitPriceUsd: {
        type: "column",
        name: "unit_price_usd",
        sourceName: "recent_sales",
        jsType: "number",
        fieldId: 4957,
        tableId: 524,
        baseType: "type/Decimal"
      },
      // Display name: Units
      units: {
        type: "column",
        name: "units",
        sourceName: "recent_sales",
        jsType: "number",
        fieldId: 4955,
        tableId: 524,
        baseType: "type/Integer"
      },
      // Display name: Variety Name
      // Semantic type: type/Category
      varietyName: {
        type: "column",
        name: "variety_name",
        sourceName: "recent_sales",
        jsType: "string",
        fieldId: 4953,
        tableId: 524,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: sales_pulse
  salesPulse: {
    type: "table",
    id: 525,
    name: "Sales Pulse",
    fields: {
      // Display name: As Of
      asOf: {
        type: "column",
        name: "as_of",
        sourceName: "sales_pulse",
        jsType: "Date",
        fieldId: 4963,
        tableId: 525,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "sales_pulse",
        jsType: "string",
        fieldId: 4958,
        tableId: 525,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "sales_pulse",
        jsType: "string",
        fieldId: 4959,
        tableId: 525,
        baseType: "type/Text"
      },
      // Display name: Last Sale At
      lastSaleAt: {
        type: "column",
        name: "last_sale_at",
        sourceName: "sales_pulse",
        jsType: "Date",
        fieldId: 4969,
        tableId: 525,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Local Date
      localDate: {
        type: "column",
        name: "local_date",
        sourceName: "sales_pulse",
        jsType: "Date",
        fieldId: 4962,
        tableId: 525,
        baseType: "type/Date"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "sales_pulse",
        jsType: "string",
        fieldId: 4960,
        tableId: 525,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "sales_pulse",
        jsType: "string",
        fieldId: 4961,
        tableId: 525,
        baseType: "type/Text"
      },
      // Display name: Revenue Last Hour Usd
      // Semantic type: type/Currency
      revenueLastHourUsd: {
        type: "column",
        name: "revenue_last_hour_usd",
        sourceName: "sales_pulse",
        jsType: "number",
        fieldId: 4967,
        tableId: 525,
        baseType: "type/Decimal"
      },
      // Display name: Revenue Today Usd
      // Semantic type: type/Currency
      revenueTodayUsd: {
        type: "column",
        name: "revenue_today_usd",
        sourceName: "sales_pulse",
        jsType: "number",
        fieldId: 4964,
        tableId: 525,
        baseType: "type/Decimal"
      },
      // Display name: Sales Last Hour
      salesLastHour: {
        type: "column",
        name: "sales_last_hour",
        sourceName: "sales_pulse",
        jsType: "number",
        fieldId: 4968,
        tableId: 525,
        baseType: "type/Integer"
      },
      // Display name: Sales Today
      salesToday: {
        type: "column",
        name: "sales_today",
        sourceName: "sales_pulse",
        jsType: "number",
        fieldId: 4966,
        tableId: 525,
        baseType: "type/Integer"
      },
      // Display name: Seconds Since Last Sale
      secondsSinceLastSale: {
        type: "column",
        name: "seconds_since_last_sale",
        sourceName: "sales_pulse",
        jsType: "number",
        fieldId: 4970,
        tableId: 525,
        baseType: "type/Integer"
      },
      // Display name: Units Today
      unitsToday: {
        type: "column",
        name: "units_today",
        sourceName: "sales_pulse",
        jsType: "number",
        fieldId: 4965,
        tableId: 525,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: season_daily
  seasonDaily: {
    type: "table",
    id: 526,
    name: "Season Daily",
    fields: {
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "season_daily",
        jsType: "string",
        fieldId: 4971,
        tableId: 526,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "season_daily",
        jsType: "string",
        fieldId: 4972,
        tableId: 526,
        baseType: "type/Text"
      },
      // Display name: Cum Ly Revenue Usd
      // Semantic type: type/Currency
      cumLyRevenueUsd: {
        type: "column",
        name: "cum_ly_revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4989,
        tableId: 526,
        baseType: "type/Decimal"
      },
      // Display name: Cum Plan Revenue Usd
      // Semantic type: type/Currency
      cumPlanRevenueUsd: {
        type: "column",
        name: "cum_plan_revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4988,
        tableId: 526,
        baseType: "type/Decimal"
      },
      // Display name: Cum Revenue Usd
      // Semantic type: type/Currency
      cumRevenueUsd: {
        type: "column",
        name: "cum_revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4990,
        tableId: 526,
        baseType: "type/Decimal"
      },
      // Display name: Days Ago
      daysAgo: {
        type: "column",
        name: "days_ago",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4978,
        tableId: 526,
        baseType: "type/Integer"
      },
      // Display name: Days To Halloween
      daysToHalloween: {
        type: "column",
        name: "days_to_halloween",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4977,
        tableId: 526,
        baseType: "type/Integer"
      },
      // Display name: Gross Margin Usd
      // Semantic type: type/Currency
      grossMarginUsd: {
        type: "column",
        name: "gross_margin_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4986,
        tableId: 526,
        baseType: "type/Decimal"
      },
      // Display name: Is Future
      isFuture: {
        type: "column",
        name: "is_future",
        sourceName: "season_daily",
        jsType: "boolean",
        fieldId: 4979,
        tableId: 526,
        baseType: "type/Boolean"
      },
      // Display name: Is Today
      isToday: {
        type: "column",
        name: "is_today",
        sourceName: "season_daily",
        jsType: "boolean",
        fieldId: 4980,
        tableId: 526,
        baseType: "type/Boolean"
      },
      // Display name: Local Date
      localDate: {
        type: "column",
        name: "local_date",
        sourceName: "season_daily",
        jsType: "Date",
        fieldId: 4975,
        tableId: 526,
        baseType: "type/Date"
      },
      // Display name: Lost Revenue Usd
      // Semantic type: type/Currency
      lostRevenueUsd: {
        type: "column",
        name: "lost_revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4987,
        tableId: 526,
        baseType: "type/Decimal"
      },
      // Display name: Ly Revenue Full Usd
      // Semantic type: type/Currency
      lyRevenueFullUsd: {
        type: "column",
        name: "ly_revenue_full_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4982,
        tableId: 526,
        baseType: "type/Decimal"
      },
      // Display name: Ly Revenue Usd
      // Semantic type: type/Currency
      lyRevenueUsd: {
        type: "column",
        name: "ly_revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4984,
        tableId: 526,
        baseType: "type/Decimal"
      },
      // Display name: Plan Revenue Full Usd
      // Semantic type: type/Currency
      planRevenueFullUsd: {
        type: "column",
        name: "plan_revenue_full_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4981,
        tableId: 526,
        baseType: "type/Decimal"
      },
      // Display name: Plan Revenue Usd
      // Semantic type: type/Currency
      planRevenueUsd: {
        type: "column",
        name: "plan_revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4983,
        tableId: 526,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "season_daily",
        jsType: "string",
        fieldId: 4973,
        tableId: 526,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "season_daily",
        jsType: "string",
        fieldId: 4974,
        tableId: 526,
        baseType: "type/Text"
      },
      // Display name: Revenue Usd
      // Semantic type: type/Currency
      revenueUsd: {
        type: "column",
        name: "revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4985,
        tableId: 526,
        baseType: "type/Decimal"
      },
      // Display name: Season Day
      seasonDay: {
        type: "column",
        name: "season_day",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4976,
        tableId: 526,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: season_landing
  seasonLanding: {
    type: "table",
    id: 527,
    name: "Season Landing",
    fields: {
      // Display name: Attainment 14d
      attainment14d: {
        type: "column",
        name: "attainment_14d",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5001,
        tableId: 527,
        baseType: "type/Decimal"
      },
      // Display name: Attainment 7d
      attainment7d: {
        type: "column",
        name: "attainment_7d",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5000,
        tableId: 527,
        baseType: "type/Decimal"
      },
      // Display name: Attainment High
      attainmentHigh: {
        type: "column",
        name: "attainment_high",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5003,
        tableId: 527,
        baseType: "type/Decimal"
      },
      // Display name: Attainment Low
      attainmentLow: {
        type: "column",
        name: "attainment_low",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5002,
        tableId: 527,
        baseType: "type/Decimal"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "season_landing",
        jsType: "string",
        fieldId: 4991,
        tableId: 527,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "season_landing",
        jsType: "string",
        fieldId: 4992,
        tableId: 527,
        baseType: "type/Text"
      },
      // Display name: Landing High Usd
      // Semantic type: type/Currency
      landingHighUsd: {
        type: "column",
        name: "landing_high_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5006,
        tableId: 527,
        baseType: "type/Decimal"
      },
      // Display name: Landing Low Usd
      // Semantic type: type/Currency
      landingLowUsd: {
        type: "column",
        name: "landing_low_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5005,
        tableId: 527,
        baseType: "type/Decimal"
      },
      // Display name: Landing Usd
      // Semantic type: type/Currency
      landingUsd: {
        type: "column",
        name: "landing_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5004,
        tableId: 527,
        baseType: "type/Decimal"
      },
      // Display name: Ly Season Revenue Usd
      // Semantic type: type/Currency
      lySeasonRevenueUsd: {
        type: "column",
        name: "ly_season_revenue_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 4996,
        tableId: 527,
        baseType: "type/Decimal"
      },
      // Display name: Plan Remaining Usd
      // Semantic type: type/Currency
      planRemainingUsd: {
        type: "column",
        name: "plan_remaining_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 4999,
        tableId: 527,
        baseType: "type/Decimal"
      },
      // Display name: Plan To Date Revenue Usd
      // Semantic type: type/Currency
      planToDateRevenueUsd: {
        type: "column",
        name: "plan_to_date_revenue_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 4998,
        tableId: 527,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "season_landing",
        jsType: "string",
        fieldId: 4993,
        tableId: 527,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "season_landing",
        jsType: "string",
        fieldId: 4994,
        tableId: 527,
        baseType: "type/Text"
      },
      // Display name: Revenue To Date Usd
      // Semantic type: type/Currency
      revenueToDateUsd: {
        type: "column",
        name: "revenue_to_date_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 4997,
        tableId: 527,
        baseType: "type/Decimal"
      },
      // Display name: Season Plan Revenue Usd
      // Semantic type: type/Currency
      seasonPlanRevenueUsd: {
        type: "column",
        name: "season_plan_revenue_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 4995,
        tableId: 527,
        baseType: "type/Decimal"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: season_plan
  seasonPlan: {
    type: "table",
    id: 528,
    name: "Season Plan",
    fields: {
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "season_plan",
        jsType: "string",
        fieldId: 5007,
        tableId: 528,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "season_plan",
        jsType: "string",
        fieldId: 5008,
        tableId: 528,
        baseType: "type/Text"
      },
      // Display name: Days Left
      daysLeft: {
        type: "column",
        name: "days_left",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5018,
        tableId: 528,
        baseType: "type/Integer"
      },
      // Display name: Ly Season Revenue Usd
      // Semantic type: type/Currency
      lySeasonRevenueUsd: {
        type: "column",
        name: "ly_season_revenue_usd",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5014,
        tableId: 528,
        baseType: "type/Decimal"
      },
      // Display name: Ly To Date Revenue Usd
      // Semantic type: type/Currency
      lyToDateRevenueUsd: {
        type: "column",
        name: "ly_to_date_revenue_usd",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5015,
        tableId: 528,
        baseType: "type/Decimal"
      },
      // Display name: Plan To Date Revenue Usd
      // Semantic type: type/Currency
      planToDateRevenueUsd: {
        type: "column",
        name: "plan_to_date_revenue_usd",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5012,
        tableId: 528,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "season_plan",
        jsType: "string",
        fieldId: 5009,
        tableId: 528,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "season_plan",
        jsType: "string",
        fieldId: 5010,
        tableId: 528,
        baseType: "type/Text"
      },
      // Display name: Revenue To Date Usd
      // Semantic type: type/Currency
      revenueToDateUsd: {
        type: "column",
        name: "revenue_to_date_usd",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5013,
        tableId: 528,
        baseType: "type/Decimal"
      },
      // Display name: Season Days Elapsed
      seasonDaysElapsed: {
        type: "column",
        name: "season_days_elapsed",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5017,
        tableId: 528,
        baseType: "type/Integer"
      },
      // Display name: Season Days Total
      seasonDaysTotal: {
        type: "column",
        name: "season_days_total",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5016,
        tableId: 528,
        baseType: "type/Integer"
      },
      // Display name: Season Plan Revenue Usd
      // Semantic type: type/Currency
      seasonPlanRevenueUsd: {
        type: "column",
        name: "season_plan_revenue_usd",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5011,
        tableId: 528,
        baseType: "type/Decimal"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: sim_status
  simStatus: {
    type: "table",
    id: 529,
    name: "Sim Status",
    fields: {
      // Display name: Days To Halloween
      daysToHalloween: {
        type: "column",
        name: "days_to_halloween",
        sourceName: "sim_status",
        jsType: "number",
        fieldId: 5023,
        tableId: 529,
        baseType: "type/Integer"
      },
      // Display name: Last Tick At
      lastTickAt: {
        type: "column",
        name: "last_tick_at",
        sourceName: "sim_status",
        jsType: "Date",
        fieldId: 5024,
        tableId: 529,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Mode
      // Semantic type: type/Category
      mode: {
        type: "column",
        name: "mode",
        sourceName: "sim_status",
        jsType: "string",
        fieldId: 5020,
        tableId: 529,
        baseType: "type/Text"
      },
      // Display name: Offset Minutes
      offsetMinutes: {
        type: "column",
        name: "offset_minutes",
        sourceName: "sim_status",
        jsType: "number",
        fieldId: 5021,
        tableId: 529,
        baseType: "type/Integer"
      },
      // Display name: Season Day
      seasonDay: {
        type: "column",
        name: "season_day",
        sourceName: "sim_status",
        jsType: "number",
        fieldId: 5022,
        tableId: 529,
        baseType: "type/Integer"
      },
      // Display name: Sim Now
      simNow: {
        type: "column",
        name: "sim_now",
        sourceName: "sim_status",
        jsType: "Date",
        fieldId: 5019,
        tableId: 529,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Tick Lag Seconds
      tickLagSeconds: {
        type: "column",
        name: "tick_lag_seconds",
        sourceName: "sim_status",
        jsType: "number",
        fieldId: 5025,
        tableId: 529,
        baseType: "type/Integer"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: stock_outlook
  stockOutlook: {
    type: "table",
    id: 530,
    name: "Stock Outlook",
    fields: {
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "stock_outlook",
        jsType: "string",
        fieldId: 5026,
        tableId: 530,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "stock_outlook",
        jsType: "string",
        fieldId: 5027,
        tableId: 530,
        baseType: "type/Text"
      },
      // Display name: Demand Plan Units
      demandPlanUnits: {
        type: "column",
        name: "demand_plan_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5038,
        tableId: 530,
        baseType: "type/Integer"
      },
      // Display name: Harvest Attainment High
      harvestAttainmentHigh: {
        type: "column",
        name: "harvest_attainment_high",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5037,
        tableId: 530,
        baseType: "type/Decimal"
      },
      // Display name: Harvest Attainment Low
      harvestAttainmentLow: {
        type: "column",
        name: "harvest_attainment_low",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5036,
        tableId: 530,
        baseType: "type/Decimal"
      },
      // Display name: Harvest Plan Units
      harvestPlanUnits: {
        type: "column",
        name: "harvest_plan_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5035,
        tableId: 530,
        baseType: "type/Integer"
      },
      // Display name: Hub Units
      hubUnits: {
        type: "column",
        name: "hub_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5032,
        tableId: 530,
        baseType: "type/Integer"
      },
      // Display name: Leftover Nov1 Cost Usd
      // Semantic type: type/Currency
      leftoverNov1CostUsd: {
        type: "column",
        name: "leftover_nov1_cost_usd",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5044,
        tableId: 530,
        baseType: "type/Decimal"
      },
      // Display name: Leftover Nov1 High Units
      leftoverNov1HighUnits: {
        type: "column",
        name: "leftover_nov1_high_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5043,
        tableId: 530,
        baseType: "type/Integer"
      },
      // Display name: Leftover Nov1 Low Units
      leftoverNov1LowUnits: {
        type: "column",
        name: "leftover_nov1_low_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5041,
        tableId: 530,
        baseType: "type/Integer"
      },
      // Display name: Leftover Nov1 Retail Usd
      // Semantic type: type/Currency
      leftoverNov1RetailUsd: {
        type: "column",
        name: "leftover_nov1_retail_usd",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5045,
        tableId: 530,
        baseType: "type/Decimal"
      },
      // Display name: Leftover Nov1 Units
      leftoverNov1Units: {
        type: "column",
        name: "leftover_nov1_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5042,
        tableId: 530,
        baseType: "type/Integer"
      },
      // Display name: Markdown Exposure Usd
      // Semantic type: type/Currency
      markdownExposureUsd: {
        type: "column",
        name: "markdown_exposure_usd",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5047,
        tableId: 530,
        baseType: "type/Decimal"
      },
      // Display name: November Demand Units
      novemberDemandUnits: {
        type: "column",
        name: "november_demand_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5046,
        tableId: 530,
        baseType: "type/Integer"
      },
      // Display name: On Hand Units
      onHandUnits: {
        type: "column",
        name: "on_hand_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5034,
        tableId: 530,
        baseType: "type/Integer"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "stock_outlook",
        jsType: "string",
        fieldId: 5028,
        tableId: 530,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "stock_outlook",
        jsType: "string",
        fieldId: 5029,
        tableId: 530,
        baseType: "type/Text"
      },
      // Display name: Season End Leftover Cost Usd
      // Semantic type: type/Currency
      seasonEndLeftoverCostUsd: {
        type: "column",
        name: "season_end_leftover_cost_usd",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5049,
        tableId: 530,
        baseType: "type/Decimal"
      },
      // Display name: Season End Leftover Units
      seasonEndLeftoverUnits: {
        type: "column",
        name: "season_end_leftover_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5048,
        tableId: 530,
        baseType: "type/Integer"
      },
      // Display name: Sold Expected Units
      soldExpectedUnits: {
        type: "column",
        name: "sold_expected_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5040,
        tableId: 530,
        baseType: "type/Integer"
      },
      // Display name: Sold Vs Plan
      soldVsPlan: {
        type: "column",
        name: "sold_vs_plan",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5039,
        tableId: 530,
        baseType: "type/Decimal"
      },
      // Display name: Store Units
      storeUnits: {
        type: "column",
        name: "store_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5031,
        tableId: 530,
        baseType: "type/Integer"
      },
      // Display name: Transit Units
      transitUnits: {
        type: "column",
        name: "transit_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5033,
        tableId: 530,
        baseType: "type/Integer"
      },
      // Display name: Variety Name
      // Semantic type: type/Category
      varietyName: {
        type: "column",
        name: "variety_name",
        sourceName: "stock_outlook",
        jsType: "string",
        fieldId: 5030,
        tableId: 530,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  stockouts: {
    type: "table",
    id: 531,
    name: "Stockouts",
    fields: {
      // Display name: Cause
      // Semantic type: type/Category
      cause: {
        type: "column",
        name: "cause",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5062,
        tableId: 531,
        baseType: "type/Text"
      },
      // Display name: City Key
      // Semantic type: type/FK
      cityKey: {
        type: "column",
        name: "city_key",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5052,
        tableId: 531,
        baseType: "type/Text"
      },
      // Display name: City Name
      // Semantic type: type/City
      cityName: {
        type: "column",
        name: "city_name",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5053,
        tableId: 531,
        baseType: "type/Text"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5054,
        tableId: 531,
        baseType: "type/Text"
      },
      // Display name: Days Ago
      daysAgo: {
        type: "column",
        name: "days_ago",
        sourceName: "stockouts",
        jsType: "number",
        fieldId: 5066,
        tableId: 531,
        baseType: "type/Integer"
      },
      // Display name: Ended At
      endedAt: {
        type: "column",
        name: "ended_at",
        sourceName: "stockouts",
        jsType: "Date",
        fieldId: 5058,
        tableId: 531,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Is Ongoing
      isOngoing: {
        type: "column",
        name: "is_ongoing",
        sourceName: "stockouts",
        jsType: "boolean",
        fieldId: 5059,
        tableId: 531,
        baseType: "type/Boolean"
      },
      // Display name: Lost Revenue Usd
      // Semantic type: type/Currency
      lostRevenueUsd: {
        type: "column",
        name: "lost_revenue_usd",
        sourceName: "stockouts",
        jsType: "number",
        fieldId: 5061,
        tableId: 531,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5055,
        tableId: 531,
        baseType: "type/Text"
      },
      // Display name: Started At
      // Semantic type: type/CreationTimestamp
      startedAt: {
        type: "column",
        name: "started_at",
        sourceName: "stockouts",
        jsType: "Date",
        fieldId: 5057,
        tableId: 531,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Store ID
      // Semantic type: type/FK
      storeId: {
        type: "column",
        name: "store_id",
        sourceName: "stockouts",
        jsType: "number",
        fieldId: 5050,
        tableId: 531,
        baseType: "type/Integer"
      },
      // Display name: Store Name
      storeName: {
        type: "column",
        name: "store_name",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5051,
        tableId: 531,
        baseType: "type/Text"
      },
      // Display name: Trip ID
      tripId: {
        type: "column",
        name: "trip_id",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5063,
        tableId: 531,
        baseType: "type/Text"
      },
      // Display name: Truck ID
      // Semantic type: type/FK
      truckId: {
        type: "column",
        name: "truck_id",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5064,
        tableId: 531,
        baseType: "type/Text"
      },
      // Display name: Truck Label
      truckLabel: {
        type: "column",
        name: "truck_label",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5065,
        tableId: 531,
        baseType: "type/Text"
      },
      // Display name: Units Lost
      unitsLost: {
        type: "column",
        name: "units_lost",
        sourceName: "stockouts",
        jsType: "number",
        fieldId: 5060,
        tableId: 531,
        baseType: "type/Integer"
      },
      // Display name: Variety Name
      // Semantic type: type/Category
      varietyName: {
        type: "column",
        name: "variety_name",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5056,
        tableId: 531,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: store_now
  storeNow: {
    type: "table",
    id: 532,
    name: "Store Now",
    fields: {
      // Display name: Availability 7d
      availability7d: {
        type: "column",
        name: "availability_7d",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5115,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Availability Season
      availabilitySeason: {
        type: "column",
        name: "availability_season",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5121,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Cap Carving
      capCarving: {
        type: "column",
        name: "cap_carving",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5093,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: Cap Cooking
      capCooking: {
        type: "column",
        name: "cap_cooking",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5094,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: Cap Mini
      capMini: {
        type: "column",
        name: "cap_mini",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5095,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: City Key
      // Semantic type: type/FK
      cityKey: {
        type: "column",
        name: "city_key",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5080,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: City Name
      // Semantic type: type/City
      cityName: {
        type: "column",
        name: "city_name",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5081,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Closes At
      closesAt: {
        type: "column",
        name: "closes_at",
        sourceName: "store_now",
        jsType: "Date",
        fieldId: 5089,
        tableId: 532,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5082,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5083,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Cover Hours Carving
      coverHoursCarving: {
        type: "column",
        name: "cover_hours_carving",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5097,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Cover Hours Cooking
      coverHoursCooking: {
        type: "column",
        name: "cover_hours_cooking",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5098,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Cover Hours Mini
      coverHoursMini: {
        type: "column",
        name: "cover_hours_mini",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5099,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Fill Rate 7d
      fillRate7d: {
        type: "column",
        name: "fill_rate_7d",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5114,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Fill Rate Season
      fillRateSeason: {
        type: "column",
        name: "fill_rate_season",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5120,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Is Open
      isOpen: {
        type: "column",
        name: "is_open",
        sourceName: "store_now",
        jsType: "boolean",
        fieldId: 5087,
        tableId: 532,
        baseType: "type/Boolean"
      },
      // Display name: Lost 7d Usd
      // Semantic type: type/Currency
      lost7dUsd: {
        type: "column",
        name: "lost_7d_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5113,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Lost Today Units
      lostTodayUnits: {
        type: "column",
        name: "lost_today_units",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5108,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: Lost Today Usd
      // Semantic type: type/Currency
      lostTodayUsd: {
        type: "column",
        name: "lost_today_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5109,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Low Variety
      // Semantic type: type/Category
      lowVariety: {
        type: "column",
        name: "low_variety",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5105,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Ly 7d Usd
      // Semantic type: type/Currency
      ly7dUsd: {
        type: "column",
        name: "ly_7d_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5112,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Ly Season Usd
      // Semantic type: type/Currency
      lySeasonUsd: {
        type: "column",
        name: "ly_season_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5119,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Min Cover Hours
      minCoverHours: {
        type: "column",
        name: "min_cover_hours",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5100,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Next Carving
      nextCarving: {
        type: "column",
        name: "next_carving",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5134,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: Next Cooking
      nextCooking: {
        type: "column",
        name: "next_cooking",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5135,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: Next Delay Cause
      nextDelayCause: {
        type: "column",
        name: "next_delay_cause",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5131,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Next Delay Note
      nextDelayNote: {
        type: "column",
        name: "next_delay_note",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5132,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Next Driver Name
      // Semantic type: type/Category
      nextDriverName: {
        type: "column",
        name: "next_driver_name",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5126,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Next Eta At
      nextEtaAt: {
        type: "column",
        name: "next_eta_at",
        sourceName: "store_now",
        jsType: "Date",
        fieldId: 5128,
        tableId: 532,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Next Late Minutes
      nextLateMinutes: {
        type: "column",
        name: "next_late_minutes",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5130,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: Next Mini
      nextMini: {
        type: "column",
        name: "next_mini",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5136,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: Next Planned At
      nextPlannedAt: {
        type: "column",
        name: "next_planned_at",
        sourceName: "store_now",
        jsType: "Date",
        fieldId: 5129,
        tableId: 532,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Next Planned Delivery At
      nextPlannedDeliveryAt: {
        type: "column",
        name: "next_planned_delivery_at",
        sourceName: "store_now",
        jsType: "Date",
        fieldId: 5137,
        tableId: 532,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Next Status
      // Semantic type: type/Category
      nextStatus: {
        type: "column",
        name: "next_status",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5127,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Next Trip ID
      // Semantic type: type/Category
      nextTripId: {
        type: "column",
        name: "next_trip_id",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5123,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Next Truck ID
      // Semantic type: type/Category
      nextTruckId: {
        type: "column",
        name: "next_truck_id",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5124,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Next Truck Label
      // Semantic type: type/Category
      nextTruckLabel: {
        type: "column",
        name: "next_truck_label",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5125,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Next Units
      nextUnits: {
        type: "column",
        name: "next_units",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5133,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: On Hand Carving
      onHandCarving: {
        type: "column",
        name: "on_hand_carving",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5090,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: On Hand Cooking
      onHandCooking: {
        type: "column",
        name: "on_hand_cooking",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5091,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: On Hand Mini
      onHandMini: {
        type: "column",
        name: "on_hand_mini",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5092,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: On Hand Units
      onHandUnits: {
        type: "column",
        name: "on_hand_units",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5096,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: Open Hours To Next Delivery
      openHoursToNextDelivery: {
        type: "column",
        name: "open_hours_to_next_delivery",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5138,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Opens At
      opensAt: {
        type: "column",
        name: "opens_at",
        sourceName: "store_now",
        jsType: "Date",
        fieldId: 5088,
        tableId: 532,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Out Cause
      // Semantic type: type/Category
      outCause: {
        type: "column",
        name: "out_cause",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5104,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Out Since
      outSince: {
        type: "column",
        name: "out_since",
        sourceName: "store_now",
        jsType: "Date",
        fieldId: 5103,
        tableId: 532,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Out Variety
      // Semantic type: type/Category
      outVariety: {
        type: "column",
        name: "out_variety",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5102,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Plan 7d Usd
      // Semantic type: type/Currency
      plan7dUsd: {
        type: "column",
        name: "plan_7d_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5111,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Plan Season Usd
      // Semantic type: type/Currency
      planSeasonUsd: {
        type: "column",
        name: "plan_season_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5118,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5084,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5085,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Revenue 7d Usd
      // Semantic type: type/Currency
      revenue7dUsd: {
        type: "column",
        name: "revenue_7d_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5110,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Revenue Season Usd
      // Semantic type: type/Currency
      revenueSeasonUsd: {
        type: "column",
        name: "revenue_season_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5117,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Revenue Today Usd
      // Semantic type: type/Currency
      revenueTodayUsd: {
        type: "column",
        name: "revenue_today_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5107,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Shrink 7d Usd
      // Semantic type: type/Currency
      shrink7dUsd: {
        type: "column",
        name: "shrink_7d_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5116,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Shrink Season Usd
      // Semantic type: type/Currency
      shrinkSeasonUsd: {
        type: "column",
        name: "shrink_season_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5122,
        tableId: 532,
        baseType: "type/Decimal"
      },
      // Display name: Sold Today Units
      soldTodayUnits: {
        type: "column",
        name: "sold_today_units",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5106,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: Stock Status
      // Semantic type: type/State
      stockStatus: {
        type: "column",
        name: "stock_status",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5101,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Store Format
      // Semantic type: type/Category
      storeFormat: {
        type: "column",
        name: "store_format",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5079,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Store ID
      // Semantic type: type/FK
      storeId: {
        type: "column",
        name: "store_id",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5077,
        tableId: 532,
        baseType: "type/Integer"
      },
      // Display name: Store Name
      storeName: {
        type: "column",
        name: "store_name",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5078,
        tableId: 532,
        baseType: "type/Text"
      },
      // Display name: Tz
      // Semantic type: type/Category
      tz: {
        type: "column",
        name: "tz",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5086,
        tableId: 532,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  stores: {
    type: "table",
    id: 533,
    name: "Stores",
    fields: {
      // Display name: Cap Carving
      capCarving: {
        type: "column",
        name: "cap_carving",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5153,
        tableId: 533,
        baseType: "type/Integer"
      },
      // Display name: Cap Cooking
      capCooking: {
        type: "column",
        name: "cap_cooking",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5154,
        tableId: 533,
        baseType: "type/Integer"
      },
      // Display name: Cap Mini
      capMini: {
        type: "column",
        name: "cap_mini",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5155,
        tableId: 533,
        baseType: "type/Integer"
      },
      // Display name: City Key
      // Semantic type: type/FK
      cityKey: {
        type: "column",
        name: "city_key",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5142,
        tableId: 533,
        baseType: "type/Text"
      },
      // Display name: City Name
      // Semantic type: type/City
      cityName: {
        type: "column",
        name: "city_name",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5143,
        tableId: 533,
        baseType: "type/Text"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5144,
        tableId: 533,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5145,
        tableId: 533,
        baseType: "type/Text"
      },
      // Display name: Hub ID
      // Semantic type: type/FK
      hubId: {
        type: "column",
        name: "hub_id",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5148,
        tableId: 533,
        baseType: "type/Text"
      },
      // Display name: Hub Name
      // Semantic type: type/Category
      hubName: {
        type: "column",
        name: "hub_name",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5149,
        tableId: 533,
        baseType: "type/Text"
      },
      // Display name: Latitude
      // Semantic type: type/Latitude
      latitude: {
        type: "column",
        name: "latitude",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5159,
        tableId: 533,
        baseType: "type/Decimal"
      },
      // Display name: Longitude
      // Semantic type: type/Longitude
      longitude: {
        type: "column",
        name: "longitude",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5160,
        tableId: 533,
        baseType: "type/Decimal"
      },
      // Display name: Opened Year
      openedYear: {
        type: "column",
        name: "opened_year",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5157,
        tableId: 533,
        baseType: "type/Integer"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5146,
        tableId: 533,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5147,
        tableId: 533,
        baseType: "type/Text"
      },
      // Display name: Shelf Capacity Units
      shelfCapacityUnits: {
        type: "column",
        name: "shelf_capacity_units",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5156,
        tableId: 533,
        baseType: "type/Integer"
      },
      // Display name: Store Format
      // Semantic type: type/Category
      storeFormat: {
        type: "column",
        name: "store_format",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5141,
        tableId: 533,
        baseType: "type/Text"
      },
      // Display name: Store ID
      // Semantic type: type/PK
      storeId: {
        type: "column",
        name: "store_id",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5139,
        tableId: 533,
        baseType: "type/Integer"
      },
      // Display name: Store Lead
      storeLead: {
        type: "column",
        name: "store_lead",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5158,
        tableId: 533,
        baseType: "type/Text"
      },
      // Display name: Store Name
      storeName: {
        type: "column",
        name: "store_name",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5140,
        tableId: 533,
        baseType: "type/Text"
      },
      // Display name: Tz
      // Semantic type: type/Category
      tz: {
        type: "column",
        name: "tz",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5150,
        tableId: 533,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: trip_timeline
  tripTimeline: {
    type: "table",
    id: 534,
    name: "Trip Timeline",
    fields: {
      // Display name: Detail
      // Semantic type: type/Category
      detail: {
        type: "column",
        name: "detail",
        sourceName: "trip_timeline",
        jsType: "string",
        fieldId: 5235,
        tableId: 534,
        baseType: "type/Text"
      },
      // Display name: Event At
      eventAt: {
        type: "column",
        name: "event_at",
        sourceName: "trip_timeline",
        jsType: "Date",
        fieldId: 5231,
        tableId: 534,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Is Estimate
      isEstimate: {
        type: "column",
        name: "is_estimate",
        sourceName: "trip_timeline",
        jsType: "boolean",
        fieldId: 5232,
        tableId: 534,
        baseType: "type/Boolean"
      },
      // Display name: Label
      label: {
        type: "column",
        name: "label",
        sourceName: "trip_timeline",
        jsType: "string",
        fieldId: 5234,
        tableId: 534,
        baseType: "type/Text"
      },
      // Display name: Seq
      seq: {
        type: "column",
        name: "seq",
        sourceName: "trip_timeline",
        jsType: "number",
        fieldId: 5230,
        tableId: 534,
        baseType: "type/Integer"
      },
      // Display name: State
      // Semantic type: type/Category
      state: {
        type: "column",
        name: "state",
        sourceName: "trip_timeline",
        jsType: "string",
        fieldId: 5233,
        tableId: 534,
        baseType: "type/Text"
      },
      // Display name: Trip ID
      tripId: {
        type: "column",
        name: "trip_id",
        sourceName: "trip_timeline",
        jsType: "string",
        fieldId: 5229,
        tableId: 534,
        baseType: "type/Text"
      },
      // Display name: Truck ID
      // Semantic type: type/FK
      truckId: {
        type: "column",
        name: "truck_id",
        sourceName: "trip_timeline",
        jsType: "string",
        fieldId: 5228,
        tableId: 534,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  // Table: truck_faults
  truckFaults: {
    type: "table",
    id: 535,
    name: "Truck Faults",
    fields: {
      // Display name: Cleared At
      clearedAt: {
        type: "column",
        name: "cleared_at",
        sourceName: "truck_faults",
        jsType: "Date",
        fieldId: 5242,
        tableId: 535,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Code
      // Semantic type: type/Category
      code: {
        type: "column",
        name: "code",
        sourceName: "truck_faults",
        jsType: "string",
        fieldId: 5238,
        tableId: 535,
        baseType: "type/Text"
      },
      // Display name: Description
      // Semantic type: type/Description
      description: {
        type: "column",
        name: "description",
        sourceName: "truck_faults",
        jsType: "string",
        fieldId: 5239,
        tableId: 535,
        baseType: "type/Text"
      },
      // Display name: Raised At
      raisedAt: {
        type: "column",
        name: "raised_at",
        sourceName: "truck_faults",
        jsType: "Date",
        fieldId: 5241,
        tableId: 535,
        baseType: "type/DateTimeWithLocalTZ"
      },
      // Display name: Severity
      // Semantic type: type/Category
      severity: {
        type: "column",
        name: "severity",
        sourceName: "truck_faults",
        jsType: "string",
        fieldId: 5240,
        tableId: 535,
        baseType: "type/Text"
      },
      // Display name: Truck ID
      // Semantic type: type/FK
      truckId: {
        type: "column",
        name: "truck_id",
        sourceName: "truck_faults",
        jsType: "string",
        fieldId: 5236,
        tableId: 535,
        baseType: "type/Text"
      },
      // Display name: Truck Label
      // Semantic type: type/Category
      truckLabel: {
        type: "column",
        name: "truck_label",
        sourceName: "truck_faults",
        jsType: "string",
        fieldId: 5237,
        tableId: 535,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  trucks: {
    type: "table",
    id: 536,
    name: "Trucks",
    fields: {
      // Display name: Body
      // Semantic type: type/Category
      body: {
        type: "column",
        name: "body",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5253,
        tableId: 536,
        baseType: "type/Text"
      },
      // Display name: Capacity Bins
      capacityBins: {
        type: "column",
        name: "capacity_bins",
        sourceName: "trucks",
        jsType: "number",
        fieldId: 5255,
        tableId: 536,
        baseType: "type/Integer"
      },
      // Display name: Country Code
      // Semantic type: type/FK
      countryCode: {
        type: "column",
        name: "country_code",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5248,
        tableId: 536,
        baseType: "type/Text"
      },
      // Display name: Country Name
      // Semantic type: type/Country
      countryName: {
        type: "column",
        name: "country_name",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5249,
        tableId: 536,
        baseType: "type/Text"
      },
      // Display name: Fleet No
      fleetNo: {
        type: "column",
        name: "fleet_no",
        sourceName: "trucks",
        jsType: "number",
        fieldId: 5244,
        tableId: 536,
        baseType: "type/Integer"
      },
      // Display name: Hub ID
      // Semantic type: type/FK
      hubId: {
        type: "column",
        name: "hub_id",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5246,
        tableId: 536,
        baseType: "type/Text"
      },
      // Display name: Hub Name
      // Semantic type: type/Category
      hubName: {
        type: "column",
        name: "hub_name",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5247,
        tableId: 536,
        baseType: "type/Text"
      },
      // Display name: Make Model
      // Semantic type: type/Category
      makeModel: {
        type: "column",
        name: "make_model",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5252,
        tableId: 536,
        baseType: "type/Text"
      },
      // Display name: Payload Kg
      payloadKg: {
        type: "column",
        name: "payload_kg",
        sourceName: "trucks",
        jsType: "number",
        fieldId: 5256,
        tableId: 536,
        baseType: "type/Integer"
      },
      // Display name: Plate
      plate: {
        type: "column",
        name: "plate",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5254,
        tableId: 536,
        baseType: "type/Text"
      },
      // Display name: Region Code
      // Semantic type: type/Category
      regionCode: {
        type: "column",
        name: "region_code",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5250,
        tableId: 536,
        baseType: "type/Text"
      },
      // Display name: Region Name
      // Semantic type: type/Category
      regionName: {
        type: "column",
        name: "region_name",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5251,
        tableId: 536,
        baseType: "type/Text"
      },
      // Display name: Service Interval Km
      serviceIntervalKm: {
        type: "column",
        name: "service_interval_km",
        sourceName: "trucks",
        jsType: "number",
        fieldId: 5257,
        tableId: 536,
        baseType: "type/Integer"
      },
      // Display name: Truck ID
      // Semantic type: type/PK
      truckId: {
        type: "column",
        name: "truck_id",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5243,
        tableId: 536,
        baseType: "type/Text"
      },
      // Display name: Truck Label
      truckLabel: {
        type: "column",
        name: "truck_label",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5245,
        tableId: 536,
        baseType: "type/Text"
      }
    }
  },
  // Database: Pumpkin database
  // Schema: pumpkin_live
  varieties: {
    type: "table",
    id: 537,
    name: "Varieties",
    fields: {
      // Display name: Kg Per Unit
      kgPerUnit: {
        type: "column",
        name: "kg_per_unit",
        sourceName: "varieties",
        jsType: "number",
        fieldId: 5261,
        tableId: 537,
        baseType: "type/Decimal"
      },
      // Display name: List Price Usd
      // Semantic type: type/Currency
      listPriceUsd: {
        type: "column",
        name: "list_price_usd",
        sourceName: "varieties",
        jsType: "number",
        fieldId: 5259,
        tableId: 537,
        baseType: "type/Decimal"
      },
      // Display name: Unit Cost Usd
      // Semantic type: type/Currency
      unitCostUsd: {
        type: "column",
        name: "unit_cost_usd",
        sourceName: "varieties",
        jsType: "number",
        fieldId: 5260,
        tableId: 537,
        baseType: "type/Decimal"
      },
      // Display name: Units Per Bin
      unitsPerBin: {
        type: "column",
        name: "units_per_bin",
        sourceName: "varieties",
        jsType: "number",
        fieldId: 5262,
        tableId: 537,
        baseType: "type/Integer"
      },
      // Display name: Variety Name
      // Semantic type: type/PK
      varietyName: {
        type: "column",
        name: "variety_name",
        sourceName: "varieties",
        jsType: "string",
        fieldId: 5258,
        tableId: 537,
        baseType: "type/Text"
      }
    }
  }
} as const;

const metrics = {
  // Entity ID: cxfOVOPdB6DlD37Acrl_W
  // Description: Revenue against last season for the same days: +0.05 = 5% up.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  growthVsLastSeason: {
    type: "metric",
    id: 396,
    name: "Growth vs last season",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Growth vs last season
      // Base type: type/Float
      {
        type: "column",
        name: "Growth vs last season",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: dOMHJ4k6rbv7NmBWn0q8I
  // Description: Share of the pumpkins customers asked for that we could sell (0–1).
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  fillRate: {
    type: "metric",
    id: 399,
    name: "Fill rate",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Fill rate
      // Base type: type/Float
      {
        type: "column",
        name: "Fill rate",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: xY6iRwZ69bF1D9ZdL1jRL
  // Description: Bins of pumpkins picked in the fields.
  // Source table: Pumpkin database.pumpkin_live.harvest_daily
  binsHarvested: {
    type: "metric",
    id: 404,
    name: "Bins harvested",
    databaseId: 102,
    sourceTableId: 517,
    mappedTableIds: [ 517 ],
    columns: [
      // Display name: Bins harvested
      // Base type: type/Decimal
      {
        type: "column",
        name: "Bins harvested",
        jsType: "number"
      }
    ],
    dimensions: {
      harvestDaily: pickFields(tables.harvestDaily.fields, [ "bins", "countryCode", "countryName", "daysAgo", "fieldId", "fieldName", "hubId", "hubName", "isRainStop", "localDate", "planBins", "regionCode", "regionName", "units", "varietyName" ])
    }
  },
  // Entity ID: K1SUTuHjdAE9J9DsRIbXW
  // Description: Gross margin of the 2025 season on the matching days: last season's revenue minus its pumpkins at this season's unit cost, in USD. Paced like the plan.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  lastSeasonGrossMargin: {
    type: "metric",
    id: 407,
    name: "Last season gross margin",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Last season gross margin
      // Base type: type/Decimal
      // Semantic type: type/Currency
      {
        type: "column",
        name: "Last season gross margin",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: B9P94nzKogq8UOpcKkh7b
  // Description: Pumpkins we expect to have left on 1 Nov: stock on hand plus the harvest still planned, minus the sales expected to 31 Oct. A variety projected to run short counts as negative. From 1 Nov it is the stock on hand.
  // Source table: Pumpkin database.pumpkin_live.stock_outlook
  projectedLeftoverAfterHalloween: {
    type: "metric",
    id: 409,
    name: "Projected leftover after Halloween",
    databaseId: 102,
    sourceTableId: 530,
    mappedTableIds: [ 530 ],
    columns: [
      // Display name: Projected leftover after Halloween
      // Base type: type/Integer
      {
        type: "column",
        name: "Projected leftover after Halloween",
        jsType: "number"
      }
    ],
    dimensions: {
      stockOutlook: pickFields(tables.stockOutlook.fields, [ "countryCode", "countryName", "demandPlanUnits", "harvestAttainmentHigh", "harvestAttainmentLow", "harvestPlanUnits", "hubUnits", "leftoverNov1CostUsd", "leftoverNov1HighUnits", "leftoverNov1LowUnits", "leftoverNov1RetailUsd", "leftoverNov1Units", "markdownExposureUsd", "novemberDemandUnits", "onHandUnits", "regionCode", "regionName", "seasonEndLeftoverCostUsd", "seasonEndLeftoverUnits", "soldExpectedUnits", "soldVsPlan", "storeUnits", "transitUnits", "varietyName" ])
    }
  },
  // Entity ID: MhTiK34AloETz43fq5ZHl
  // Description: What the November markdowns are expected to give away on the leftover pumpkins that still sell, in USD.
  // Source table: Pumpkin database.pumpkin_live.stock_outlook
  markdownExposure: {
    type: "metric",
    id: 411,
    name: "Markdown exposure",
    databaseId: 102,
    sourceTableId: 530,
    mappedTableIds: [ 530 ],
    columns: [
      // Display name: Markdown exposure
      // Base type: type/Decimal
      // Semantic type: type/Currency
      {
        type: "column",
        name: "Markdown exposure",
        jsType: "number"
      }
    ],
    dimensions: {
      stockOutlook: pickFields(tables.stockOutlook.fields, [ "countryCode", "countryName", "demandPlanUnits", "harvestAttainmentHigh", "harvestAttainmentLow", "harvestPlanUnits", "hubUnits", "leftoverNov1CostUsd", "leftoverNov1HighUnits", "leftoverNov1LowUnits", "leftoverNov1RetailUsd", "leftoverNov1Units", "markdownExposureUsd", "novemberDemandUnits", "onHandUnits", "regionCode", "regionName", "seasonEndLeftoverCostUsd", "seasonEndLeftoverUnits", "soldExpectedUnits", "soldVsPlan", "storeUnits", "transitUnits", "varietyName" ])
    }
  },
  // Entity ID: 3GBBazkr6YCOSD-1B68ls
  // Description: Revenue of the 2025 season on the matching days, paced like the plan.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  lastSeasonRevenue: {
    type: "metric",
    id: 395,
    name: "Last season revenue",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Last season revenue
      // Base type: type/Decimal
      // Semantic type: type/Currency
      {
        type: "column",
        name: "Last season revenue",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: DcLbrl4AJTVMh701WnfZi
  // Description: Pumpkins sold, all channels.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  pumpkinsSold: {
    type: "metric",
    id: 389,
    name: "Pumpkins sold",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Pumpkins sold
      // Base type: type/Integer
      {
        type: "column",
        name: "Pumpkins sold",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: g8p3RYqBbv3z1Vf9JiUht
  // Description: Share of deliveries that arrived less than 15 minutes after plan (0–1).
  // Source table: Pumpkin database.pumpkin_live.deliveries
  onTimeDeliveryRate: {
    type: "metric",
    id: 403,
    name: "On-time delivery rate",
    databaseId: 102,
    sourceTableId: 515,
    mappedTableIds: [ 515 ],
    columns: [
      // Display name: On-time delivery rate
      // Base type: type/Float
      {
        type: "column",
        name: "On-time delivery rate",
        jsType: "number"
      }
    ],
    dimensions: {
      deliveries: pickFields(tables.deliveries.fields, [ "arrivedAt", "bins", "capacityBins", "cargoValueUsd", "carvingUnits", "cityKey", "cityName", "cookingUnits", "countryCode", "countryName", "damagedUnits", "daysAgo", "delayCause", "delayNote", "deliveryCostUsd", "departedAt", "driverName", "etaAt", "fillPct", "hubId", "hubName", "isActive", "isDelivered", "isHeadingToStore", "isLate", "isOnTime", "kg", "kmDone", "kmTotal", "lateMinutes", "localDate", "miniUnits", "payloadKg", "plannedArriveAt", "plannedDepartAt", "progressPct", "regionCode", "regionName", "returnedAt", "status", "storeId", "storeName", "tripId", "truckId", "truckLabel", "unitsTotal", "unloadedAt", "wave" ])
    }
  },
  // Entity ID: Rq2uV82Zf5OchgUvsH0ot
  // Description: Gross margin as a share of revenue (0–1).
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  grossMarginRate: {
    type: "metric",
    id: 391,
    name: "Gross margin rate",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Gross margin rate
      // Base type: type/Float
      {
        type: "column",
        name: "Gross margin rate",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: X_FtOXapaGTk7Bu2rXRXn
  // Description: The pumpkins projected to be left on 1 Nov, valued at what they cost us, in USD.
  // Source table: Pumpkin database.pumpkin_live.stock_outlook
  leftoverStockAtCost: {
    type: "metric",
    id: 410,
    name: "Leftover stock at cost",
    databaseId: 102,
    sourceTableId: 530,
    mappedTableIds: [ 530 ],
    columns: [
      // Display name: Leftover stock at cost
      // Base type: type/Decimal
      // Semantic type: type/Currency
      {
        type: "column",
        name: "Leftover stock at cost",
        jsType: "number"
      }
    ],
    dimensions: {
      stockOutlook: pickFields(tables.stockOutlook.fields, [ "countryCode", "countryName", "demandPlanUnits", "harvestAttainmentHigh", "harvestAttainmentLow", "harvestPlanUnits", "hubUnits", "leftoverNov1CostUsd", "leftoverNov1HighUnits", "leftoverNov1LowUnits", "leftoverNov1RetailUsd", "leftoverNov1Units", "markdownExposureUsd", "novemberDemandUnits", "onHandUnits", "regionCode", "regionName", "seasonEndLeftoverCostUsd", "seasonEndLeftoverUnits", "soldExpectedUnits", "soldVsPlan", "storeUnits", "transitUnits", "varietyName" ])
    }
  },
  // Entity ID: Mvd6gsiLG-fv7tNsqIoqV
  // Description: Bins picked against the harvest plan (1 = on plan).
  // Source table: Pumpkin database.pumpkin_live.harvest_daily
  harvestVsPlan: {
    type: "metric",
    id: 405,
    name: "Harvest vs plan",
    databaseId: 102,
    sourceTableId: 517,
    mappedTableIds: [ 517 ],
    columns: [
      // Display name: Harvest vs plan
      // Base type: type/Float
      {
        type: "column",
        name: "Harvest vs plan",
        jsType: "number"
      }
    ],
    dimensions: {
      harvestDaily: pickFields(tables.harvestDaily.fields, [ "bins", "countryCode", "countryName", "daysAgo", "fieldId", "fieldName", "hubId", "hubName", "isRainStop", "localDate", "planBins", "regionCode", "regionName", "units", "varietyName" ])
    }
  },
  // Entity ID: 26gWGo8ID0oU-dVNmmd0V
  // Description: Revenue we expect to have taken when the season ends on 15 Nov: revenue so far plus the plan still to come, at the last 7 days' pace against plan, in USD. A projection, not a forecast: the plan already holds the Halloween peak and the November markdowns.
  // Source table: Pumpkin database.pumpkin_live.season_landing
  projectedSeasonRevenue: {
    type: "metric",
    id: 408,
    name: "Projected season revenue",
    databaseId: 102,
    sourceTableId: 527,
    mappedTableIds: [ 527 ],
    columns: [
      // Display name: Projected season revenue
      // Base type: type/Decimal
      // Semantic type: type/Currency
      {
        type: "column",
        name: "Projected season revenue",
        jsType: "number"
      }
    ],
    dimensions: {
      seasonLanding: pickFields(tables.seasonLanding.fields, [ "attainment14d", "attainment7d", "attainmentHigh", "attainmentLow", "countryCode", "countryName", "landingHighUsd", "landingLowUsd", "landingUsd", "lySeasonRevenueUsd", "planRemainingUsd", "planToDateRevenueUsd", "regionCode", "regionName", "revenueToDateUsd", "seasonPlanRevenueUsd" ])
    }
  },
  // Entity ID: tFCc5-ene9hDVDFf54OSi
  // Description: The budgeted revenue. For the current day it is paced to the local time, so today compares fairly.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  revenuePlan: {
    type: "metric",
    id: 393,
    name: "Revenue plan",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Revenue plan
      // Base type: type/Decimal
      // Semantic type: type/Currency
      {
        type: "column",
        name: "Revenue plan",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: eC0R1cI_7zmrm9F1wsSkC
  // Description: Money taken from pumpkins sold, in USD, after markdowns.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  revenue: {
    type: "metric",
    id: 388,
    name: "Revenue",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Revenue
      // Base type: type/Decimal
      // Semantic type: type/Currency
      {
        type: "column",
        name: "Revenue",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: -vcU1pSMh_NDM3NE4qhCW
  // Description: Pumpkins damaged in transit or spoiled on the shelf, at cost, in USD.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  shrink: {
    type: "metric",
    id: 401,
    name: "Shrink",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Shrink
      // Base type: type/Decimal
      // Semantic type: type/Currency
      {
        type: "column",
        name: "Shrink",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: WQpz1LLcNNrH9COd8R6jS
  // Description: Van runs that reached their store.
  // Source table: Pumpkin database.pumpkin_live.deliveries
  deliveries: {
    type: "metric",
    id: 402,
    name: "Deliveries",
    databaseId: 102,
    sourceTableId: 515,
    mappedTableIds: [ 515 ],
    columns: [
      // Display name: Deliveries
      // Base type: type/Integer
      {
        type: "column",
        name: "Deliveries",
        jsType: "number"
      }
    ],
    dimensions: {
      deliveries: pickFields(tables.deliveries.fields, [ "arrivedAt", "bins", "capacityBins", "cargoValueUsd", "carvingUnits", "cityKey", "cityName", "cookingUnits", "countryCode", "countryName", "damagedUnits", "daysAgo", "delayCause", "delayNote", "deliveryCostUsd", "departedAt", "driverName", "etaAt", "fillPct", "hubId", "hubName", "isActive", "isDelivered", "isHeadingToStore", "isLate", "isOnTime", "kg", "kmDone", "kmTotal", "lateMinutes", "localDate", "miniUnits", "payloadKg", "plannedArriveAt", "plannedDepartAt", "progressPct", "regionCode", "regionName", "returnedAt", "status", "storeId", "storeName", "tripId", "truckId", "truckLabel", "unitsTotal", "unloadedAt", "wave" ])
    }
  },
  // Entity ID: fP_gv3W8ffKoo6iGsjryH
  // Description: Revenue minus the cost of the pumpkins sold, in USD.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  grossMargin: {
    type: "metric",
    id: 390,
    name: "Gross margin",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Gross margin
      // Base type: type/Decimal
      // Semantic type: type/Currency
      {
        type: "column",
        name: "Gross margin",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: rJCpSmz_twF0VsJfDGGxZ
  // Description: Revenue we could not take because a store ran out of a variety, in USD.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  lostSales: {
    type: "metric",
    id: 397,
    name: "Lost sales",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Lost sales
      // Base type: type/Decimal
      // Semantic type: type/Currency
      {
        type: "column",
        name: "Lost sales",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: Z3m07yxfqzKi8E3z3zEtd
  // Description: The budgeted gross margin: the revenue plan minus the planned pumpkins at this season's unit cost, in USD. For the current day it is paced to the local time, like the revenue plan.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  planGrossMargin: {
    type: "metric",
    id: 406,
    name: "Plan gross margin",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Plan gross margin
      // Base type: type/Decimal
      // Semantic type: type/Currency
      {
        type: "column",
        name: "Plan gross margin",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: 6z8FAHaOuizsfSy7mw-gD
  // Description: Revenue per pumpkin sold, in USD.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  averageSellingPrice: {
    type: "metric",
    id: 392,
    name: "Average selling price",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Average selling price
      // Base type: type/Float
      {
        type: "column",
        name: "Average selling price",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: izLZM5rhVqaBSkW3xHlKa
  // Description: Cost of the van runs that restocked the stores, in USD.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  deliveryCost: {
    type: "metric",
    id: 400,
    name: "Delivery cost",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Delivery cost
      // Base type: type/Decimal
      // Semantic type: type/Currency
      {
        type: "column",
        name: "Delivery cost",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: Sz3WjnacsLQ9W6GOjvuT1
  // Description: Revenue against the plan for the same period: +0.05 = 5% ahead of plan.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  revenueVsPlan: {
    type: "metric",
    id: 394,
    name: "Revenue vs plan",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Revenue vs plan
      // Base type: type/Float
      {
        type: "column",
        name: "Revenue vs plan",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  // Entity ID: sixkPjd7mwIb2GyMqMsuT
  // Description: Lost sales where the store's van arrived late and the shelf ran empty first.
  // Source table: Pumpkin database.pumpkin_live.daily_store_sales
  lostSalesToLateDeliveries: {
    type: "metric",
    id: 398,
    name: "Lost sales to late deliveries",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      // Display name: Lost sales to late deliveries
      // Base type: type/Decimal
      // Semantic type: type/Currency
      {
        type: "column",
        name: "Lost sales to late deliveries",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  }
} as const;

const schema = {
  schemaVersion: 2,
  generatedAt: "2026-10-07T20:57:28.717397691Z",
  metabase: {
    instanceUrl: "https://olden-midship.hosted.staging.metabase.com"
  },
  models: models,
  tables: tables,
  metrics: metrics
} as const;

export default schema;

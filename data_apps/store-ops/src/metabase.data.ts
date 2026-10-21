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

const actions = {
  dAv65UpdateOrderStatus: {
    kind: "action",
    key: "dAv65UpdateOrderStatus",
    id: 1,
    name: "DAv65 Update order status",
    type: "query",
    parameters: [
      {
        slug: "order_id",
        displayName: "order_id",
        jsType: "number",
        required: true
      },
      {
        slug: "status",
        displayName: "status",
        jsType: "string",
        required: true
      },
      {
        slug: "notes",
        displayName: "notes",
        jsType: "string"
      }
    ],
    description: "Set status and notes on one order",
    entityId: "yh_nX3IyjhBLRrI926vyo"
  }
} as const;

const tables = {
  businessEvents: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "business_events" } */
    type: "table",
    id: 511,
    name: "Business Events",
    fields: {
      cityKey: {
        /* metadata: { "displayName": "City Key", "semanticType": "type/FK" } */
        type: "column",
        name: "city_key",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4669,
        tableId: 511,
        baseType: "type/Text"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4663,
        tableId: 511,
        baseType: "type/Text"
      },
      daysAgo: {
        /* metadata: { "displayName": "Days Ago" } */
        type: "column",
        name: "days_ago",
        sourceName: "business_events",
        jsType: "number",
        fieldId: 4662,
        tableId: 511,
        baseType: "type/Integer"
      },
      detail: {
        /* metadata: { "displayName": "Detail", "semanticType": "type/Category" } */
        type: "column",
        name: "detail",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4671,
        tableId: 511,
        baseType: "type/Text"
      },
      endedAt: {
        /* metadata: { "displayName": "Ended At" } */
        type: "column",
        name: "ended_at",
        sourceName: "business_events",
        jsType: "Date",
        fieldId: 4660,
        tableId: 511,
        baseType: "type/DateTimeWithLocalTZ"
      },
      eventId: {
        /* metadata: { "displayName": "Event ID", "semanticType": "type/PK" } */
        type: "column",
        name: "event_id",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4657,
        tableId: 511,
        baseType: "type/Text"
      },
      hubId: {
        /* metadata: { "displayName": "Hub ID", "semanticType": "type/FK" } */
        type: "column",
        name: "hub_id",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4665,
        tableId: 511,
        baseType: "type/Text"
      },
      kind: {
        /* metadata: { "displayName": "Kind", "semanticType": "type/Category" } */
        type: "column",
        name: "kind",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4658,
        tableId: 511,
        baseType: "type/Text"
      },
      localDate: {
        /* metadata: { "displayName": "Local Date" } */
        type: "column",
        name: "local_date",
        sourceName: "business_events",
        jsType: "Date",
        fieldId: 4661,
        tableId: 511,
        baseType: "type/Date"
      },
      lostRevenueUsd: {
        /* metadata: { "displayName": "Lost Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "lost_revenue_usd",
        sourceName: "business_events",
        jsType: "number",
        fieldId: 4674,
        tableId: 511,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4664,
        tableId: 511,
        baseType: "type/Text"
      },
      runsAffected: {
        /* metadata: { "displayName": "Runs Affected" } */
        type: "column",
        name: "runs_affected",
        sourceName: "business_events",
        jsType: "number",
        fieldId: 4672,
        tableId: 511,
        baseType: "type/Integer"
      },
      startedAt: {
        /* metadata: { "displayName": "Started At", "semanticType": "type/CreationTimestamp" } */
        type: "column",
        name: "started_at",
        sourceName: "business_events",
        jsType: "Date",
        fieldId: 4659,
        tableId: 511,
        baseType: "type/DateTimeWithLocalTZ"
      },
      storeId: {
        /* metadata: { "displayName": "Store ID", "semanticType": "type/FK" } */
        type: "column",
        name: "store_id",
        sourceName: "business_events",
        jsType: "number",
        fieldId: 4668,
        tableId: 511,
        baseType: "type/Integer"
      },
      title: {
        /* metadata: { "displayName": "Title", "semanticType": "type/Title" } */
        type: "column",
        name: "title",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4670,
        tableId: 511,
        baseType: "type/Text"
      },
      tripId: {
        /* metadata: { "displayName": "Trip ID", "semanticType": "type/Category" } */
        type: "column",
        name: "trip_id",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4667,
        tableId: 511,
        baseType: "type/Text"
      },
      truckId: {
        /* metadata: { "displayName": "Truck ID", "semanticType": "type/FK" } */
        type: "column",
        name: "truck_id",
        sourceName: "business_events",
        jsType: "string",
        fieldId: 4666,
        tableId: 511,
        baseType: "type/Text"
      },
      units: {
        /* metadata: { "displayName": "Units" } */
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
  cities: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live" } */
    type: "table",
    id: 512,
    name: "Cities",
    fields: {
      cityKey: {
        /* metadata: { "displayName": "City Key", "semanticType": "type/PK" } */
        type: "column",
        name: "city_key",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4675,
        tableId: 512,
        baseType: "type/Text"
      },
      cityName: {
        /* metadata: { "displayName": "City Name", "semanticType": "type/City" } */
        type: "column",
        name: "city_name",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4676,
        tableId: 512,
        baseType: "type/Text"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4677,
        tableId: 512,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4678,
        tableId: 512,
        baseType: "type/Text"
      },
      driveMin: {
        /* metadata: { "displayName": "Drive Min" } */
        type: "column",
        name: "drive_min",
        sourceName: "cities",
        jsType: "number",
        fieldId: 4687,
        tableId: 512,
        baseType: "type/Integer"
      },
      hubId: {
        /* metadata: { "displayName": "Hub ID", "semanticType": "type/FK" } */
        type: "column",
        name: "hub_id",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4681,
        tableId: 512,
        baseType: "type/Text"
      },
      hubName: {
        /* metadata: { "displayName": "Hub Name", "semanticType": "type/Category" } */
        type: "column",
        name: "hub_name",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4682,
        tableId: 512,
        baseType: "type/Text"
      },
      latitude: {
        /* metadata: { "displayName": "Latitude", "semanticType": "type/Latitude" } */
        type: "column",
        name: "latitude",
        sourceName: "cities",
        jsType: "number",
        fieldId: 4684,
        tableId: 512,
        baseType: "type/Decimal"
      },
      longitude: {
        /* metadata: { "displayName": "Longitude", "semanticType": "type/Longitude" } */
        type: "column",
        name: "longitude",
        sourceName: "cities",
        jsType: "number",
        fieldId: 4685,
        tableId: 512,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4679,
        tableId: 512,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "cities",
        jsType: "string",
        fieldId: 4680,
        tableId: 512,
        baseType: "type/Text"
      },
      roadKm: {
        /* metadata: { "displayName": "Road Km" } */
        type: "column",
        name: "road_km",
        sourceName: "cities",
        jsType: "number",
        fieldId: 4686,
        tableId: 512,
        baseType: "type/Integer"
      },
      tz: {
        /* metadata: { "displayName": "Tz", "semanticType": "type/Category" } */
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
  countries: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live" } */
    type: "table",
    id: 513,
    name: "Countries",
    fields: {
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/PK" } */
        type: "column",
        name: "country_code",
        sourceName: "countries",
        jsType: "string",
        fieldId: 4688,
        tableId: 513,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "countries",
        jsType: "string",
        fieldId: 4689,
        tableId: 513,
        baseType: "type/Text"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "countries",
        jsType: "string",
        fieldId: 4690,
        tableId: 513,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "countries",
        jsType: "string",
        fieldId: 4691,
        tableId: 513,
        baseType: "type/Text"
      },
      sort: {
        /* metadata: { "displayName": "Sort" } */
        type: "column",
        name: "sort",
        sourceName: "countries",
        jsType: "number",
        fieldId: 4693,
        tableId: 513,
        baseType: "type/Integer"
      },
      tz: {
        /* metadata: { "displayName": "Tz", "semanticType": "type/Category" } */
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
  dailyStoreSales: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "daily_store_sales" } */
    type: "table",
    id: 514,
    name: "Daily Store Sales",
    fields: {
      cityKey: {
        /* metadata: { "displayName": "City Key", "semanticType": "type/Category" } */
        type: "column",
        name: "city_key",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4702,
        tableId: 514,
        baseType: "type/Text"
      },
      cityName: {
        /* metadata: { "displayName": "City Name", "semanticType": "type/City" } */
        type: "column",
        name: "city_name",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4703,
        tableId: 514,
        baseType: "type/Text"
      },
      cogsUsd: {
        /* metadata: { "displayName": "Cogs Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "cogs_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4714,
        tableId: 514,
        baseType: "type/Decimal"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4700,
        tableId: 514,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4701,
        tableId: 514,
        baseType: "type/Text"
      },
      daysAgo: {
        /* metadata: { "displayName": "Days Ago" } */
        type: "column",
        name: "days_ago",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4695,
        tableId: 514,
        baseType: "type/Integer"
      },
      deliveryCostUsd: {
        /* metadata: { "displayName": "Delivery Cost Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "delivery_cost_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4730,
        tableId: 514,
        baseType: "type/Decimal"
      },
      grossMarginUsd: {
        /* metadata: { "displayName": "Gross Margin Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "gross_margin_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4715,
        tableId: 514,
        baseType: "type/Decimal"
      },
      isWeekend: {
        /* metadata: { "displayName": "Is Weekend" } */
        type: "column",
        name: "is_weekend",
        sourceName: "daily_store_sales",
        jsType: "boolean",
        fieldId: 4697,
        tableId: 514,
        baseType: "type/Boolean"
      },
      listRevenueUsd: {
        /* metadata: { "displayName": "List Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "list_revenue_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4712,
        tableId: 514,
        baseType: "type/Decimal"
      },
      localDate: {
        /* metadata: { "displayName": "Local Date" } */
        type: "column",
        name: "local_date",
        sourceName: "daily_store_sales",
        jsType: "Date",
        fieldId: 4694,
        tableId: 514,
        baseType: "type/Date"
      },
      lostDemandUsd: {
        /* metadata: { "displayName": "Lost Demand Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "lost_demand_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4720,
        tableId: 514,
        baseType: "type/Decimal"
      },
      lostLateUsd: {
        /* metadata: { "displayName": "Lost Late Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "lost_late_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4718,
        tableId: 514,
        baseType: "type/Decimal"
      },
      lostRevenueUsd: {
        /* metadata: { "displayName": "Lost Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "lost_revenue_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4717,
        tableId: 514,
        baseType: "type/Decimal"
      },
      lostShortageUsd: {
        /* metadata: { "displayName": "Lost Shortage Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "lost_shortage_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4719,
        tableId: 514,
        baseType: "type/Decimal"
      },
      lyGrossMarginUsd: {
        /* metadata: { "displayName": "Ly Gross Margin Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "ly_gross_margin_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4734,
        tableId: 514,
        baseType: "type/Decimal"
      },
      lyRevenueFullUsd: {
        /* metadata: { "displayName": "Ly Revenue Full Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "ly_revenue_full_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4726,
        tableId: 514,
        baseType: "type/Decimal"
      },
      lyRevenueUsd: {
        /* metadata: { "displayName": "Ly Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "ly_revenue_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4725,
        tableId: 514,
        baseType: "type/Decimal"
      },
      lyUnits: {
        /* metadata: { "displayName": "Ly Units" } */
        type: "column",
        name: "ly_units",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4724,
        tableId: 514,
        baseType: "type/Decimal"
      },
      markdownUsd: {
        /* metadata: { "displayName": "Markdown Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "markdown_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4713,
        tableId: 514,
        baseType: "type/Decimal"
      },
      onlineRevenueUsd: {
        /* metadata: { "displayName": "Online Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "online_revenue_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4716,
        tableId: 514,
        baseType: "type/Decimal"
      },
      openMinutes: {
        /* metadata: { "displayName": "Open Minutes" } */
        type: "column",
        name: "open_minutes",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4732,
        tableId: 514,
        baseType: "type/Integer"
      },
      planGrossMarginUsd: {
        /* metadata: { "displayName": "Plan Gross Margin Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "plan_gross_margin_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4733,
        tableId: 514,
        baseType: "type/Decimal"
      },
      planRevenueFullUsd: {
        /* metadata: { "displayName": "Plan Revenue Full Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "plan_revenue_full_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4723,
        tableId: 514,
        baseType: "type/Decimal"
      },
      planRevenueUsd: {
        /* metadata: { "displayName": "Plan Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "plan_revenue_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4722,
        tableId: 514,
        baseType: "type/Decimal"
      },
      planUnits: {
        /* metadata: { "displayName": "Plan Units" } */
        type: "column",
        name: "plan_units",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4721,
        tableId: 514,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4698,
        tableId: 514,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4699,
        tableId: 514,
        baseType: "type/Text"
      },
      revenueUsd: {
        /* metadata: { "displayName": "Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "revenue_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4711,
        tableId: 514,
        baseType: "type/Decimal"
      },
      seasonDay: {
        /* metadata: { "displayName": "Season Day" } */
        type: "column",
        name: "season_day",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4696,
        tableId: 514,
        baseType: "type/Integer"
      },
      shrinkShelfUsd: {
        /* metadata: { "displayName": "Shrink Shelf Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "shrink_shelf_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4728,
        tableId: 514,
        baseType: "type/Decimal"
      },
      shrinkTransitUsd: {
        /* metadata: { "displayName": "Shrink Transit Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "shrink_transit_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4727,
        tableId: 514,
        baseType: "type/Decimal"
      },
      shrinkUsd: {
        /* metadata: { "displayName": "Shrink Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "shrink_usd",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4729,
        tableId: 514,
        baseType: "type/Decimal"
      },
      stockoutMinutes: {
        /* metadata: { "displayName": "Stockout Minutes" } */
        type: "column",
        name: "stockout_minutes",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4731,
        tableId: 514,
        baseType: "type/Integer"
      },
      storeFormat: {
        /* metadata: { "displayName": "Store Format", "semanticType": "type/Category" } */
        type: "column",
        name: "store_format",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4706,
        tableId: 514,
        baseType: "type/Text"
      },
      storeId: {
        /* metadata: { "displayName": "Store ID" } */
        type: "column",
        name: "store_id",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4704,
        tableId: 514,
        baseType: "type/Integer"
      },
      storeName: {
        /* metadata: { "displayName": "Store Name" } */
        type: "column",
        name: "store_name",
        sourceName: "daily_store_sales",
        jsType: "string",
        fieldId: 4705,
        tableId: 514,
        baseType: "type/Text"
      },
      unitsLost: {
        /* metadata: { "displayName": "Units Lost" } */
        type: "column",
        name: "units_lost",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4710,
        tableId: 514,
        baseType: "type/Integer"
      },
      unitsRequested: {
        /* metadata: { "displayName": "Units Requested" } */
        type: "column",
        name: "units_requested",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4708,
        tableId: 514,
        baseType: "type/Integer"
      },
      unitsSold: {
        /* metadata: { "displayName": "Units Sold" } */
        type: "column",
        name: "units_sold",
        sourceName: "daily_store_sales",
        jsType: "number",
        fieldId: 4709,
        tableId: 514,
        baseType: "type/Integer"
      },
      varietyName: {
        /* metadata: { "displayName": "Variety Name", "semanticType": "type/Category" } */
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
      last7Days: {
        /* metadata: { "entityId": "NzfTLjSwTatd5AaQYc6C5", "description": "Today and the six days before, on the simulated clock." } */
        type: "segment",
        id: 34,
        tableId: 514,
        name: "Last 7 days"
      }
    }
  },
  deliveries: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live" } */
    type: "table",
    id: 515,
    name: "Deliveries",
    fields: {
      arrivedAt: {
        /* metadata: { "displayName": "Arrived At" } */
        type: "column",
        name: "arrived_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4759,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      bins: {
        /* metadata: { "displayName": "Bins" } */
        type: "column",
        name: "bins",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4775,
        tableId: 515,
        baseType: "type/Decimal"
      },
      capacityBins: {
        /* metadata: { "displayName": "Capacity Bins" } */
        type: "column",
        name: "capacity_bins",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4776,
        tableId: 515,
        baseType: "type/Integer"
      },
      cargoValueUsd: {
        /* metadata: { "displayName": "Cargo Value Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "cargo_value_usd",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4780,
        tableId: 515,
        baseType: "type/Decimal"
      },
      carvingUnits: {
        /* metadata: { "displayName": "Carving Units" } */
        type: "column",
        name: "carving_units",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4772,
        tableId: 515,
        baseType: "type/Integer"
      },
      cityKey: {
        /* metadata: { "displayName": "City Key", "semanticType": "type/FK" } */
        type: "column",
        name: "city_key",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4748,
        tableId: 515,
        baseType: "type/Text"
      },
      cityName: {
        /* metadata: { "displayName": "City Name", "semanticType": "type/City" } */
        type: "column",
        name: "city_name",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4749,
        tableId: 515,
        baseType: "type/Text"
      },
      cookingUnits: {
        /* metadata: { "displayName": "Cooking Units" } */
        type: "column",
        name: "cooking_units",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4773,
        tableId: 515,
        baseType: "type/Integer"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4746,
        tableId: 515,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4747,
        tableId: 515,
        baseType: "type/Text"
      },
      damagedUnits: {
        /* metadata: { "displayName": "Damaged Units" } */
        type: "column",
        name: "damaged_units",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4781,
        tableId: 515,
        baseType: "type/Integer"
      },
      daysAgo: {
        /* metadata: { "displayName": "Days Ago" } */
        type: "column",
        name: "days_ago",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4737,
        tableId: 515,
        baseType: "type/Integer"
      },
      delayCause: {
        /* metadata: { "displayName": "Delay Cause", "semanticType": "type/Category" } */
        type: "column",
        name: "delay_cause",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4766,
        tableId: 515,
        baseType: "type/Text"
      },
      delayNote: {
        /* metadata: { "displayName": "Delay Note" } */
        type: "column",
        name: "delay_note",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4767,
        tableId: 515,
        baseType: "type/Text"
      },
      deliveryCostUsd: {
        /* metadata: { "displayName": "Delivery Cost Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "delivery_cost_usd",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4782,
        tableId: 515,
        baseType: "type/Decimal"
      },
      departedAt: {
        /* metadata: { "displayName": "Departed At" } */
        type: "column",
        name: "departed_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4756,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      driverName: {
        /* metadata: { "displayName": "Driver Name" } */
        type: "column",
        name: "driver_name",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4741,
        tableId: 515,
        baseType: "type/Text"
      },
      etaAt: {
        /* metadata: { "displayName": "Eta At" } */
        type: "column",
        name: "eta_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4758,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      fillPct: {
        /* metadata: { "displayName": "Fill Pct" } */
        type: "column",
        name: "fill_pct",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4777,
        tableId: 515,
        baseType: "type/Decimal"
      },
      hubId: {
        /* metadata: { "displayName": "Hub ID", "semanticType": "type/FK" } */
        type: "column",
        name: "hub_id",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4742,
        tableId: 515,
        baseType: "type/Text"
      },
      hubName: {
        /* metadata: { "displayName": "Hub Name", "semanticType": "type/Category" } */
        type: "column",
        name: "hub_name",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4743,
        tableId: 515,
        baseType: "type/Text"
      },
      isActive: {
        /* metadata: { "displayName": "Is Active" } */
        type: "column",
        name: "is_active",
        sourceName: "deliveries",
        jsType: "boolean",
        fieldId: 4753,
        tableId: 515,
        baseType: "type/Boolean"
      },
      isDelivered: {
        /* metadata: { "displayName": "Is Delivered" } */
        type: "column",
        name: "is_delivered",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4764,
        tableId: 515,
        baseType: "type/Integer"
      },
      isHeadingToStore: {
        /* metadata: { "displayName": "Is Heading To Store" } */
        type: "column",
        name: "is_heading_to_store",
        sourceName: "deliveries",
        jsType: "boolean",
        fieldId: 4754,
        tableId: 515,
        baseType: "type/Boolean"
      },
      isLate: {
        /* metadata: { "displayName": "Is Late" } */
        type: "column",
        name: "is_late",
        sourceName: "deliveries",
        jsType: "boolean",
        fieldId: 4763,
        tableId: 515,
        baseType: "type/Boolean"
      },
      isOnTime: {
        /* metadata: { "displayName": "Is On Time" } */
        type: "column",
        name: "is_on_time",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4765,
        tableId: 515,
        baseType: "type/Integer"
      },
      kg: {
        /* metadata: { "displayName": "Kg" } */
        type: "column",
        name: "kg",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4778,
        tableId: 515,
        baseType: "type/Decimal"
      },
      kmDone: {
        /* metadata: { "displayName": "Km Done" } */
        type: "column",
        name: "km_done",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4770,
        tableId: 515,
        baseType: "type/Integer"
      },
      kmTotal: {
        /* metadata: { "displayName": "Km Total" } */
        type: "column",
        name: "km_total",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4769,
        tableId: 515,
        baseType: "type/Integer"
      },
      lateMinutes: {
        /* metadata: { "displayName": "Late Minutes" } */
        type: "column",
        name: "late_minutes",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4762,
        tableId: 515,
        baseType: "type/Integer"
      },
      localDate: {
        /* metadata: { "displayName": "Local Date" } */
        type: "column",
        name: "local_date",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4736,
        tableId: 515,
        baseType: "type/Date"
      },
      miniUnits: {
        /* metadata: { "displayName": "Mini Units" } */
        type: "column",
        name: "mini_units",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4774,
        tableId: 515,
        baseType: "type/Integer"
      },
      payloadKg: {
        /* metadata: { "displayName": "Payload Kg" } */
        type: "column",
        name: "payload_kg",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4779,
        tableId: 515,
        baseType: "type/Integer"
      },
      plannedArriveAt: {
        /* metadata: { "displayName": "Planned Arrive At" } */
        type: "column",
        name: "planned_arrive_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4757,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      plannedDepartAt: {
        /* metadata: { "displayName": "Planned Depart At" } */
        type: "column",
        name: "planned_depart_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4755,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      progressPct: {
        /* metadata: { "displayName": "Progress Pct" } */
        type: "column",
        name: "progress_pct",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4768,
        tableId: 515,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4744,
        tableId: 515,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4745,
        tableId: 515,
        baseType: "type/Text"
      },
      returnedAt: {
        /* metadata: { "displayName": "Returned At" } */
        type: "column",
        name: "returned_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4761,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      status: {
        /* metadata: { "displayName": "Status", "semanticType": "type/Category" } */
        type: "column",
        name: "status",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4752,
        tableId: 515,
        baseType: "type/Text"
      },
      storeId: {
        /* metadata: { "displayName": "Store ID" } */
        type: "column",
        name: "store_id",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4750,
        tableId: 515,
        baseType: "type/Integer"
      },
      storeName: {
        /* metadata: { "displayName": "Store Name" } */
        type: "column",
        name: "store_name",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4751,
        tableId: 515,
        baseType: "type/Text"
      },
      tripId: {
        /* metadata: { "displayName": "Trip ID" } */
        type: "column",
        name: "trip_id",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4735,
        tableId: 515,
        baseType: "type/Text"
      },
      truckId: {
        /* metadata: { "displayName": "Truck ID" } */
        type: "column",
        name: "truck_id",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4739,
        tableId: 515,
        baseType: "type/Text"
      },
      truckLabel: {
        /* metadata: { "displayName": "Truck Label" } */
        type: "column",
        name: "truck_label",
        sourceName: "deliveries",
        jsType: "string",
        fieldId: 4740,
        tableId: 515,
        baseType: "type/Text"
      },
      unitsTotal: {
        /* metadata: { "displayName": "Units Total" } */
        type: "column",
        name: "units_total",
        sourceName: "deliveries",
        jsType: "number",
        fieldId: 4771,
        tableId: 515,
        baseType: "type/Integer"
      },
      unloadedAt: {
        /* metadata: { "displayName": "Unloaded At" } */
        type: "column",
        name: "unloaded_at",
        sourceName: "deliveries",
        jsType: "Date",
        fieldId: 4760,
        tableId: 515,
        baseType: "type/DateTimeWithLocalTZ"
      },
      wave: {
        /* metadata: { "displayName": "Wave" } */
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
      last7Days: {
        /* metadata: { "entityId": "2x4dKoJ6RKh5JZUahnl85", "description": "Today and the six days before, on the simulated clock." } */
        type: "segment",
        id: 35,
        tableId: 515,
        name: "Last 7 days"
      }
    }
  },
  fleetNow: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "fleet_now" } */
    type: "table",
    id: 516,
    name: "Fleet Now",
    fields: {
      binsAboard: {
        /* metadata: { "displayName": "Bins Aboard" } */
        type: "column",
        name: "bins_aboard",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4818,
        tableId: 516,
        baseType: "type/Decimal"
      },
      body: {
        /* metadata: { "displayName": "Body", "semanticType": "type/Category" } */
        type: "column",
        name: "body",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4794,
        tableId: 516,
        baseType: "type/Text"
      },
      capacityBins: {
        /* metadata: { "displayName": "Capacity Bins" } */
        type: "column",
        name: "capacity_bins",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4819,
        tableId: 516,
        baseType: "type/Integer"
      },
      cargoTempC: {
        /* metadata: { "displayName": "Cargo Temp C" } */
        type: "column",
        name: "cargo_temp_c",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4841,
        tableId: 516,
        baseType: "type/Decimal"
      },
      cargoValueUsd: {
        /* metadata: { "displayName": "Cargo Value Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "cargo_value_usd",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4823,
        tableId: 516,
        baseType: "type/Decimal"
      },
      carvingAboard: {
        /* metadata: { "displayName": "Carving Aboard" } */
        type: "column",
        name: "carving_aboard",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4815,
        tableId: 516,
        baseType: "type/Integer"
      },
      cookingAboard: {
        /* metadata: { "displayName": "Cooking Aboard" } */
        type: "column",
        name: "cooking_aboard",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4816,
        tableId: 516,
        baseType: "type/Integer"
      },
      coolantC: {
        /* metadata: { "displayName": "Coolant C" } */
        type: "column",
        name: "coolant_c",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4840,
        tableId: 516,
        baseType: "type/Decimal"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4790,
        tableId: 516,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4791,
        tableId: 516,
        baseType: "type/Text"
      },
      delayCause: {
        /* metadata: { "displayName": "Delay Cause" } */
        type: "column",
        name: "delay_cause",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4809,
        tableId: 516,
        baseType: "type/Text"
      },
      delayNote: {
        /* metadata: { "displayName": "Delay Note" } */
        type: "column",
        name: "delay_note",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4810,
        tableId: 516,
        baseType: "type/Text"
      },
      delivered7d: {
        /* metadata: { "displayName": "Delivered 7d" } */
        type: "column",
        name: "delivered_7d",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4845,
        tableId: 516,
        baseType: "type/Integer"
      },
      departedAt: {
        /* metadata: { "displayName": "Departed At" } */
        type: "column",
        name: "departed_at",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4804,
        tableId: 516,
        baseType: "type/DateTimeWithLocalTZ"
      },
      destCityKey: {
        /* metadata: { "displayName": "Dest City Key", "semanticType": "type/Category" } */
        type: "column",
        name: "dest_city_key",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4801,
        tableId: 516,
        baseType: "type/Text"
      },
      destCityName: {
        /* metadata: { "displayName": "Dest City Name", "semanticType": "type/City" } */
        type: "column",
        name: "dest_city_name",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4802,
        tableId: 516,
        baseType: "type/Text"
      },
      destStoreId: {
        /* metadata: { "displayName": "Dest Store ID" } */
        type: "column",
        name: "dest_store_id",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4799,
        tableId: 516,
        baseType: "type/Integer"
      },
      destStoreName: {
        /* metadata: { "displayName": "Dest Store Name", "semanticType": "type/Category" } */
        type: "column",
        name: "dest_store_name",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4800,
        tableId: 516,
        baseType: "type/Text"
      },
      driverName: {
        /* metadata: { "displayName": "Driver Name" } */
        type: "column",
        name: "driver_name",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4796,
        tableId: 516,
        baseType: "type/Text"
      },
      etaAt: {
        /* metadata: { "displayName": "Eta At" } */
        type: "column",
        name: "eta_at",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4806,
        tableId: 516,
        baseType: "type/DateTimeWithLocalTZ"
      },
      fillPct: {
        /* metadata: { "displayName": "Fill Pct" } */
        type: "column",
        name: "fill_pct",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4820,
        tableId: 516,
        baseType: "type/Decimal"
      },
      fleetNo: {
        /* metadata: { "displayName": "Fleet No" } */
        type: "column",
        name: "fleet_no",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4784,
        tableId: 516,
        baseType: "type/Integer"
      },
      fuelPct: {
        /* metadata: { "displayName": "Fuel Pct" } */
        type: "column",
        name: "fuel_pct",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4839,
        tableId: 516,
        baseType: "type/Integer"
      },
      hubId: {
        /* metadata: { "displayName": "Hub ID", "semanticType": "type/FK" } */
        type: "column",
        name: "hub_id",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4786,
        tableId: 516,
        baseType: "type/Text"
      },
      hubName: {
        /* metadata: { "displayName": "Hub Name", "semanticType": "type/Category" } */
        type: "column",
        name: "hub_name",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4787,
        tableId: 516,
        baseType: "type/Text"
      },
      isLate: {
        /* metadata: { "displayName": "Is Late" } */
        type: "column",
        name: "is_late",
        sourceName: "fleet_now",
        jsType: "boolean",
        fieldId: 4808,
        tableId: 516,
        baseType: "type/Boolean"
      },
      kgAboard: {
        /* metadata: { "displayName": "Kg Aboard" } */
        type: "column",
        name: "kg_aboard",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4821,
        tableId: 516,
        baseType: "type/Decimal"
      },
      km7d: {
        /* metadata: { "displayName": "Km 7d" } */
        type: "column",
        name: "km_7d",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4844,
        tableId: 516,
        baseType: "type/Integer"
      },
      kmDone: {
        /* metadata: { "displayName": "Km Done" } */
        type: "column",
        name: "km_done",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4813,
        tableId: 516,
        baseType: "type/Integer"
      },
      kmSinceService: {
        /* metadata: { "displayName": "Km Since Service" } */
        type: "column",
        name: "km_since_service",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4828,
        tableId: 516,
        baseType: "type/Integer"
      },
      kmToService: {
        /* metadata: { "displayName": "Km To Service" } */
        type: "column",
        name: "km_to_service",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4830,
        tableId: 516,
        baseType: "type/Integer"
      },
      kmTotal: {
        /* metadata: { "displayName": "Km Total" } */
        type: "column",
        name: "km_total",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4812,
        tableId: 516,
        baseType: "type/Integer"
      },
      lastPingAt: {
        /* metadata: { "displayName": "Last Ping At" } */
        type: "column",
        name: "last_ping_at",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4842,
        tableId: 516,
        baseType: "type/DateTimeWithLocalTZ"
      },
      lastServiceKm: {
        /* metadata: { "displayName": "Last Service Km" } */
        type: "column",
        name: "last_service_km",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4833,
        tableId: 516,
        baseType: "type/Integer"
      },
      lastServiceOn: {
        /* metadata: { "displayName": "Last Service On" } */
        type: "column",
        name: "last_service_on",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4832,
        tableId: 516,
        baseType: "type/Date"
      },
      lateMinutes: {
        /* metadata: { "displayName": "Late Minutes" } */
        type: "column",
        name: "late_minutes",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4807,
        tableId: 516,
        baseType: "type/Integer"
      },
      latitude: {
        /* metadata: { "displayName": "Latitude", "semanticType": "type/Latitude" } */
        type: "column",
        name: "latitude",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4824,
        tableId: 516,
        baseType: "type/Float"
      },
      longitude: {
        /* metadata: { "displayName": "Longitude", "semanticType": "type/Longitude" } */
        type: "column",
        name: "longitude",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4825,
        tableId: 516,
        baseType: "type/Float"
      },
      makeModel: {
        /* metadata: { "displayName": "Make Model", "semanticType": "type/Category" } */
        type: "column",
        name: "make_model",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4793,
        tableId: 516,
        baseType: "type/Text"
      },
      miniAboard: {
        /* metadata: { "displayName": "Mini Aboard" } */
        type: "column",
        name: "mini_aboard",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4817,
        tableId: 516,
        baseType: "type/Integer"
      },
      odometerKm: {
        /* metadata: { "displayName": "Odometer Km" } */
        type: "column",
        name: "odometer_km",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4827,
        tableId: 516,
        baseType: "type/Integer"
      },
      onTime7d: {
        /* metadata: { "displayName": "On Time 7d" } */
        type: "column",
        name: "on_time_7d",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4846,
        tableId: 516,
        baseType: "type/Integer"
      },
      openFaultCode: {
        /* metadata: { "displayName": "Open Fault Code", "semanticType": "type/Category" } */
        type: "column",
        name: "open_fault_code",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4835,
        tableId: 516,
        baseType: "type/Text"
      },
      openFaultDesc: {
        /* metadata: { "displayName": "Open Fault Desc", "semanticType": "type/Category" } */
        type: "column",
        name: "open_fault_desc",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4836,
        tableId: 516,
        baseType: "type/Text"
      },
      openFaultSeverity: {
        /* metadata: { "displayName": "Open Fault Severity", "semanticType": "type/Category" } */
        type: "column",
        name: "open_fault_severity",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4837,
        tableId: 516,
        baseType: "type/Text"
      },
      openFaultSince: {
        /* metadata: { "displayName": "Open Fault Since" } */
        type: "column",
        name: "open_fault_since",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4838,
        tableId: 516,
        baseType: "type/DateTimeWithLocalTZ"
      },
      payloadKg: {
        /* metadata: { "displayName": "Payload Kg" } */
        type: "column",
        name: "payload_kg",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4822,
        tableId: 516,
        baseType: "type/Integer"
      },
      plannedArriveAt: {
        /* metadata: { "displayName": "Planned Arrive At" } */
        type: "column",
        name: "planned_arrive_at",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4805,
        tableId: 516,
        baseType: "type/DateTimeWithLocalTZ"
      },
      plannedDepartAt: {
        /* metadata: { "displayName": "Planned Depart At" } */
        type: "column",
        name: "planned_depart_at",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4803,
        tableId: 516,
        baseType: "type/DateTimeWithLocalTZ"
      },
      plate: {
        /* metadata: { "displayName": "Plate" } */
        type: "column",
        name: "plate",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4795,
        tableId: 516,
        baseType: "type/Text"
      },
      progressPct: {
        /* metadata: { "displayName": "Progress Pct" } */
        type: "column",
        name: "progress_pct",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4811,
        tableId: 516,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4788,
        tableId: 516,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4789,
        tableId: 516,
        baseType: "type/Text"
      },
      serviceBookedOn: {
        /* metadata: { "displayName": "Service Booked On" } */
        type: "column",
        name: "service_booked_on",
        sourceName: "fleet_now",
        jsType: "Date",
        fieldId: 4834,
        tableId: 516,
        baseType: "type/Date"
      },
      serviceIntervalKm: {
        /* metadata: { "displayName": "Service Interval Km" } */
        type: "column",
        name: "service_interval_km",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4829,
        tableId: 516,
        baseType: "type/Integer"
      },
      serviceStatus: {
        /* metadata: { "displayName": "Service Status", "semanticType": "type/State" } */
        type: "column",
        name: "service_status",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4831,
        tableId: 516,
        baseType: "type/Text"
      },
      speedKmh: {
        /* metadata: { "displayName": "Speed Kmh" } */
        type: "column",
        name: "speed_kmh",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4826,
        tableId: 516,
        baseType: "type/Integer"
      },
      status: {
        /* metadata: { "displayName": "Status", "semanticType": "type/Category" } */
        type: "column",
        name: "status",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4797,
        tableId: 516,
        baseType: "type/Text"
      },
      tripId: {
        /* metadata: { "displayName": "Trip ID", "semanticType": "type/Category" } */
        type: "column",
        name: "trip_id",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4798,
        tableId: 516,
        baseType: "type/Text"
      },
      trips7d: {
        /* metadata: { "displayName": "Trips 7d" } */
        type: "column",
        name: "trips_7d",
        sourceName: "fleet_now",
        jsType: "number",
        fieldId: 4843,
        tableId: 516,
        baseType: "type/Integer"
      },
      truckId: {
        /* metadata: { "displayName": "Truck ID" } */
        type: "column",
        name: "truck_id",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4783,
        tableId: 516,
        baseType: "type/Text"
      },
      truckLabel: {
        /* metadata: { "displayName": "Truck Label" } */
        type: "column",
        name: "truck_label",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4785,
        tableId: 516,
        baseType: "type/Text"
      },
      tz: {
        /* metadata: { "displayName": "Tz", "semanticType": "type/Category" } */
        type: "column",
        name: "tz",
        sourceName: "fleet_now",
        jsType: "string",
        fieldId: 4792,
        tableId: 516,
        baseType: "type/Text"
      },
      unitsAboard: {
        /* metadata: { "displayName": "Units Aboard" } */
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
  harvestDaily: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "harvest_daily" } */
    type: "table",
    id: 517,
    name: "Harvest Daily",
    fields: {
      bins: {
        /* metadata: { "displayName": "Bins" } */
        type: "column",
        name: "bins",
        sourceName: "harvest_daily",
        jsType: "number",
        fieldId: 4858,
        tableId: 517,
        baseType: "type/Decimal"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4851,
        tableId: 517,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4852,
        tableId: 517,
        baseType: "type/Text"
      },
      daysAgo: {
        /* metadata: { "displayName": "Days Ago" } */
        type: "column",
        name: "days_ago",
        sourceName: "harvest_daily",
        jsType: "number",
        fieldId: 4857,
        tableId: 517,
        baseType: "type/Integer"
      },
      fieldId: {
        /* metadata: { "displayName": "Field ID", "semanticType": "type/Category" } */
        type: "column",
        name: "field_id",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4847,
        tableId: 517,
        baseType: "type/Text"
      },
      fieldName: {
        /* metadata: { "displayName": "Field Name", "semanticType": "type/Category" } */
        type: "column",
        name: "field_name",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4848,
        tableId: 517,
        baseType: "type/Text"
      },
      hubId: {
        /* metadata: { "displayName": "Hub ID", "semanticType": "type/FK" } */
        type: "column",
        name: "hub_id",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4849,
        tableId: 517,
        baseType: "type/Text"
      },
      hubName: {
        /* metadata: { "displayName": "Hub Name", "semanticType": "type/Category" } */
        type: "column",
        name: "hub_name",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4850,
        tableId: 517,
        baseType: "type/Text"
      },
      isRainStop: {
        /* metadata: { "displayName": "Is Rain Stop" } */
        type: "column",
        name: "is_rain_stop",
        sourceName: "harvest_daily",
        jsType: "boolean",
        fieldId: 4861,
        tableId: 517,
        baseType: "type/Boolean"
      },
      localDate: {
        /* metadata: { "displayName": "Local Date" } */
        type: "column",
        name: "local_date",
        sourceName: "harvest_daily",
        jsType: "Date",
        fieldId: 4856,
        tableId: 517,
        baseType: "type/Date"
      },
      planBins: {
        /* metadata: { "displayName": "Plan Bins" } */
        type: "column",
        name: "plan_bins",
        sourceName: "harvest_daily",
        jsType: "number",
        fieldId: 4859,
        tableId: 517,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4853,
        tableId: 517,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "harvest_daily",
        jsType: "string",
        fieldId: 4854,
        tableId: 517,
        baseType: "type/Text"
      },
      units: {
        /* metadata: { "displayName": "Units" } */
        type: "column",
        name: "units",
        sourceName: "harvest_daily",
        jsType: "number",
        fieldId: 4860,
        tableId: 517,
        baseType: "type/Integer"
      },
      varietyName: {
        /* metadata: { "displayName": "Variety Name", "semanticType": "type/Category" } */
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
  hourlyStoreSales: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "hourly_store_sales" } */
    type: "table",
    id: 518,
    name: "Hourly Store Sales",
    fields: {
      cityKey: {
        /* metadata: { "displayName": "City Key", "semanticType": "type/Category" } */
        type: "column",
        name: "city_key",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4870,
        tableId: 518,
        baseType: "type/Text"
      },
      cityName: {
        /* metadata: { "displayName": "City Name", "semanticType": "type/City" } */
        type: "column",
        name: "city_name",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4871,
        tableId: 518,
        baseType: "type/Text"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4868,
        tableId: 518,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4869,
        tableId: 518,
        baseType: "type/Text"
      },
      daysAgo: {
        /* metadata: { "displayName": "Days Ago" } */
        type: "column",
        name: "days_ago",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4863,
        tableId: 518,
        baseType: "type/Integer"
      },
      isCurrentHour: {
        /* metadata: { "displayName": "Is Current Hour" } */
        type: "column",
        name: "is_current_hour",
        sourceName: "hourly_store_sales",
        jsType: "boolean",
        fieldId: 4865,
        tableId: 518,
        baseType: "type/Boolean"
      },
      localDate: {
        /* metadata: { "displayName": "Local Date" } */
        type: "column",
        name: "local_date",
        sourceName: "hourly_store_sales",
        jsType: "Date",
        fieldId: 4862,
        tableId: 518,
        baseType: "type/Date"
      },
      localHour: {
        /* metadata: { "displayName": "Local Hour" } */
        type: "column",
        name: "local_hour",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4864,
        tableId: 518,
        baseType: "type/Integer"
      },
      lostRevenueUsd: {
        /* metadata: { "displayName": "Lost Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "lost_revenue_usd",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4877,
        tableId: 518,
        baseType: "type/Decimal"
      },
      planRevenueUsd: {
        /* metadata: { "displayName": "Plan Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "plan_revenue_usd",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4878,
        tableId: 518,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4866,
        tableId: 518,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4867,
        tableId: 518,
        baseType: "type/Text"
      },
      revenueUsd: {
        /* metadata: { "displayName": "Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "revenue_usd",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4876,
        tableId: 518,
        baseType: "type/Decimal"
      },
      storeId: {
        /* metadata: { "displayName": "Store ID" } */
        type: "column",
        name: "store_id",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4872,
        tableId: 518,
        baseType: "type/Integer"
      },
      storeName: {
        /* metadata: { "displayName": "Store Name" } */
        type: "column",
        name: "store_name",
        sourceName: "hourly_store_sales",
        jsType: "string",
        fieldId: 4873,
        tableId: 518,
        baseType: "type/Text"
      },
      unitsLost: {
        /* metadata: { "displayName": "Units Lost" } */
        type: "column",
        name: "units_lost",
        sourceName: "hourly_store_sales",
        jsType: "number",
        fieldId: 4875,
        tableId: 518,
        baseType: "type/Integer"
      },
      unitsSold: {
        /* metadata: { "displayName": "Units Sold" } */
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
  hubNow: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "hub_now" } */
    type: "table",
    id: 519,
    name: "Hub Now",
    fields: {
      binsToday: {
        /* metadata: { "displayName": "Bins Today" } */
        type: "column",
        name: "bins_today",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4889,
        tableId: 519,
        baseType: "type/Decimal"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4881,
        tableId: 519,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4882,
        tableId: 519,
        baseType: "type/Text"
      },
      fieldsPicking: {
        /* metadata: { "displayName": "Fields Picking" } */
        type: "column",
        name: "fields_picking",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4888,
        tableId: 519,
        baseType: "type/Integer"
      },
      harvestNote: {
        /* metadata: { "displayName": "Harvest Note", "semanticType": "type/Category" } */
        type: "column",
        name: "harvest_note",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4887,
        tableId: 519,
        baseType: "type/Text"
      },
      harvestStatus: {
        /* metadata: { "displayName": "Harvest Status", "semanticType": "type/Category" } */
        type: "column",
        name: "harvest_status",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4886,
        tableId: 519,
        baseType: "type/Text"
      },
      hubId: {
        /* metadata: { "displayName": "Hub ID", "semanticType": "type/FK" } */
        type: "column",
        name: "hub_id",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4879,
        tableId: 519,
        baseType: "type/Text"
      },
      hubName: {
        /* metadata: { "displayName": "Hub Name", "semanticType": "type/Category" } */
        type: "column",
        name: "hub_name",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4880,
        tableId: 519,
        baseType: "type/Text"
      },
      hubStockDays: {
        /* metadata: { "displayName": "Hub Stock Days" } */
        type: "column",
        name: "hub_stock_days",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4892,
        tableId: 519,
        baseType: "type/Decimal"
      },
      hubStockUnits: {
        /* metadata: { "displayName": "Hub Stock Units" } */
        type: "column",
        name: "hub_stock_units",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4891,
        tableId: 519,
        baseType: "type/Integer"
      },
      nextWaveAt: {
        /* metadata: { "displayName": "Next Wave At" } */
        type: "column",
        name: "next_wave_at",
        sourceName: "hub_now",
        jsType: "Date",
        fieldId: 4902,
        tableId: 519,
        baseType: "type/DateTimeWithLocalTZ"
      },
      planBinsToday: {
        /* metadata: { "displayName": "Plan Bins Today" } */
        type: "column",
        name: "plan_bins_today",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4890,
        tableId: 519,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4883,
        tableId: 519,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4884,
        tableId: 519,
        baseType: "type/Text"
      },
      tz: {
        /* metadata: { "displayName": "Tz", "semanticType": "type/Category" } */
        type: "column",
        name: "tz",
        sourceName: "hub_now",
        jsType: "string",
        fieldId: 4885,
        tableId: 519,
        baseType: "type/Text"
      },
      vansAtHub: {
        /* metadata: { "displayName": "Vans At Hub" } */
        type: "column",
        name: "vans_at_hub",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4894,
        tableId: 519,
        baseType: "type/Integer"
      },
      vansHeading: {
        /* metadata: { "displayName": "Vans Heading" } */
        type: "column",
        name: "vans_heading",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4900,
        tableId: 519,
        baseType: "type/Integer"
      },
      vansLate: {
        /* metadata: { "displayName": "Vans Late" } */
        type: "column",
        name: "vans_late",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4901,
        tableId: 519,
        baseType: "type/Integer"
      },
      vansLoading: {
        /* metadata: { "displayName": "Vans Loading" } */
        type: "column",
        name: "vans_loading",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4895,
        tableId: 519,
        baseType: "type/Integer"
      },
      vansOnRoad: {
        /* metadata: { "displayName": "Vans On Road" } */
        type: "column",
        name: "vans_on_road",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4896,
        tableId: 519,
        baseType: "type/Integer"
      },
      vansReturning: {
        /* metadata: { "displayName": "Vans Returning" } */
        type: "column",
        name: "vans_returning",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4898,
        tableId: 519,
        baseType: "type/Integer"
      },
      vansTotal: {
        /* metadata: { "displayName": "Vans Total" } */
        type: "column",
        name: "vans_total",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4893,
        tableId: 519,
        baseType: "type/Integer"
      },
      vansUnloading: {
        /* metadata: { "displayName": "Vans Unloading" } */
        type: "column",
        name: "vans_unloading",
        sourceName: "hub_now",
        jsType: "number",
        fieldId: 4897,
        tableId: 519,
        baseType: "type/Integer"
      },
      vansWorkshop: {
        /* metadata: { "displayName": "Vans Workshop" } */
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
  hubs: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live" } */
    type: "table",
    id: 520,
    name: "Hubs",
    fields: {
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "hubs",
        jsType: "string",
        fieldId: 4905,
        tableId: 520,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "hubs",
        jsType: "string",
        fieldId: 4906,
        tableId: 520,
        baseType: "type/Text"
      },
      hubId: {
        /* metadata: { "displayName": "Hub ID", "semanticType": "type/PK" } */
        type: "column",
        name: "hub_id",
        sourceName: "hubs",
        jsType: "string",
        fieldId: 4903,
        tableId: 520,
        baseType: "type/Text"
      },
      hubName: {
        /* metadata: { "displayName": "Hub Name", "semanticType": "type/Category" } */
        type: "column",
        name: "hub_name",
        sourceName: "hubs",
        jsType: "string",
        fieldId: 4904,
        tableId: 520,
        baseType: "type/Text"
      },
      latitude: {
        /* metadata: { "displayName": "Latitude", "semanticType": "type/Latitude" } */
        type: "column",
        name: "latitude",
        sourceName: "hubs",
        jsType: "number",
        fieldId: 4910,
        tableId: 520,
        baseType: "type/Decimal"
      },
      longitude: {
        /* metadata: { "displayName": "Longitude", "semanticType": "type/Longitude" } */
        type: "column",
        name: "longitude",
        sourceName: "hubs",
        jsType: "number",
        fieldId: 4911,
        tableId: 520,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "hubs",
        jsType: "string",
        fieldId: 4907,
        tableId: 520,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "hubs",
        jsType: "string",
        fieldId: 4908,
        tableId: 520,
        baseType: "type/Text"
      },
      tz: {
        /* metadata: { "displayName": "Tz", "semanticType": "type/Category" } */
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
  opsPartEvents: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "ops_part_events" } */
    type: "table",
    id: 521,
    name: "Ops Part Events",
    fields: {
      durationMs: {
        /* metadata: { "displayName": "Duration Ms", "semanticType": "type/Duration" } */
        type: "column",
        name: "duration_ms",
        sourceName: "ops_part_events",
        jsType: "number",
        fieldId: 4918,
        tableId: 521,
        baseType: "type/BigInteger"
      },
      eventAt: {
        /* metadata: { "displayName": "Event At" } */
        type: "column",
        name: "event_at",
        sourceName: "ops_part_events",
        jsType: "Date",
        fieldId: 4912,
        tableId: 521,
        baseType: "type/DateTime"
      },
      eventType: {
        /* metadata: { "displayName": "Event Type", "semanticType": "type/Category" } */
        type: "column",
        name: "event_type",
        sourceName: "ops_part_events",
        jsType: "string",
        fieldId: 4913,
        tableId: 521,
        baseType: "type/Text"
      },
      mergeReason: {
        /* metadata: { "displayName": "Merge Reason", "semanticType": "type/Category" } */
        type: "column",
        name: "merge_reason",
        sourceName: "ops_part_events",
        jsType: "string",
        fieldId: 4920,
        tableId: 521,
        baseType: "type/Text"
      },
      mergedFrom: {
        /* metadata: { "displayName": "Merged From" } */
        type: "column",
        name: "merged_from",
        sourceName: "ops_part_events",
        jsType: "string",
        fieldId: 4919,
        tableId: 521,
        baseType: "type/Text"
      },
      partName: {
        /* metadata: { "displayName": "Part Name" } */
        type: "column",
        name: "part_name",
        sourceName: "ops_part_events",
        jsType: "string",
        fieldId: 4915,
        tableId: 521,
        baseType: "type/Text"
      },
      rows: {
        /* metadata: { "displayName": "Rows" } */
        type: "column",
        name: "rows",
        sourceName: "ops_part_events",
        jsType: "number",
        fieldId: 4916,
        tableId: 521,
        baseType: "type/BigInteger"
      },
      sizeInBytes: {
        /* metadata: { "displayName": "Size In Bytes" } */
        type: "column",
        name: "size_in_bytes",
        sourceName: "ops_part_events",
        jsType: "number",
        fieldId: 4917,
        tableId: 521,
        baseType: "type/BigInteger"
      },
      tableName: {
        /* metadata: { "displayName": "Table Name", "semanticType": "type/Category" } */
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
  opsParts: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "ops_parts" } */
    type: "table",
    id: 522,
    name: "Ops Parts",
    fields: {
      bytesOnDisk: {
        /* metadata: { "displayName": "Bytes On Disk" } */
        type: "column",
        name: "bytes_on_disk",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4928,
        tableId: 522,
        baseType: "type/BigInteger"
      },
      dataCompressedBytes: {
        /* metadata: { "displayName": "Data Compressed Bytes" } */
        type: "column",
        name: "data_compressed_bytes",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4929,
        tableId: 522,
        baseType: "type/BigInteger"
      },
      dataUncompressedBytes: {
        /* metadata: { "displayName": "Data Uncompressed Bytes" } */
        type: "column",
        name: "data_uncompressed_bytes",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4930,
        tableId: 522,
        baseType: "type/BigInteger"
      },
      level: {
        /* metadata: { "displayName": "Level" } */
        type: "column",
        name: "level",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4926,
        tableId: 522,
        baseType: "type/Integer"
      },
      maxBlockNumber: {
        /* metadata: { "displayName": "Max Block Number", "semanticType": "type/Quantity" } */
        type: "column",
        name: "max_block_number",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4925,
        tableId: 522,
        baseType: "type/BigInteger"
      },
      minBlockNumber: {
        /* metadata: { "displayName": "Min Block Number", "semanticType": "type/Quantity" } */
        type: "column",
        name: "min_block_number",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4924,
        tableId: 522,
        baseType: "type/BigInteger"
      },
      modifiedAt: {
        /* metadata: { "displayName": "Modified At" } */
        type: "column",
        name: "modified_at",
        sourceName: "ops_parts",
        jsType: "Date",
        fieldId: 4931,
        tableId: 522,
        baseType: "type/DateTime"
      },
      partName: {
        /* metadata: { "displayName": "Part Name" } */
        type: "column",
        name: "part_name",
        sourceName: "ops_parts",
        jsType: "string",
        fieldId: 4922,
        tableId: 522,
        baseType: "type/Text"
      },
      partitionId: {
        /* metadata: { "displayName": "Partition ID", "semanticType": "type/Category" } */
        type: "column",
        name: "partition_id",
        sourceName: "ops_parts",
        jsType: "string",
        fieldId: 4923,
        tableId: 522,
        baseType: "type/Text"
      },
      rows: {
        /* metadata: { "displayName": "Rows" } */
        type: "column",
        name: "rows",
        sourceName: "ops_parts",
        jsType: "number",
        fieldId: 4927,
        tableId: 522,
        baseType: "type/BigInteger"
      },
      tableName: {
        /* metadata: { "displayName": "Table Name" } */
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
  opsQueries: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "ops_queries" } */
    type: "table",
    id: 523,
    name: "Ops Queries",
    fields: {
      durationMs: {
        /* metadata: { "displayName": "Duration Ms", "semanticType": "type/Duration" } */
        type: "column",
        name: "duration_ms",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4936,
        tableId: 523,
        baseType: "type/Integer"
      },
      memoryBytes: {
        /* metadata: { "displayName": "Memory Bytes" } */
        type: "column",
        name: "memory_bytes",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4940,
        tableId: 523,
        baseType: "type/BigInteger"
      },
      queryHash: {
        /* metadata: { "displayName": "Query Hash" } */
        type: "column",
        name: "query_hash",
        sourceName: "ops_queries",
        jsType: "string",
        fieldId: 4935,
        tableId: 523,
        baseType: "type/Text"
      },
      ranAt: {
        /* metadata: { "displayName": "Ran At" } */
        type: "column",
        name: "ran_at",
        sourceName: "ops_queries",
        jsType: "Date",
        fieldId: 4932,
        tableId: 523,
        baseType: "type/DateTime"
      },
      readBytes: {
        /* metadata: { "displayName": "Read Bytes" } */
        type: "column",
        name: "read_bytes",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4938,
        tableId: 523,
        baseType: "type/BigInteger"
      },
      readRows: {
        /* metadata: { "displayName": "Read Rows" } */
        type: "column",
        name: "read_rows",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4937,
        tableId: 523,
        baseType: "type/BigInteger"
      },
      resultRows: {
        /* metadata: { "displayName": "Result Rows" } */
        type: "column",
        name: "result_rows",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4939,
        tableId: 523,
        baseType: "type/BigInteger"
      },
      selectedGranules: {
        /* metadata: { "displayName": "Selected Granules" } */
        type: "column",
        name: "selected_granules",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4942,
        tableId: 523,
        baseType: "type/BigInteger"
      },
      selectedParts: {
        /* metadata: { "displayName": "Selected Parts" } */
        type: "column",
        name: "selected_parts",
        sourceName: "ops_queries",
        jsType: "number",
        fieldId: 4941,
        tableId: 523,
        baseType: "type/BigInteger"
      },
      sqlText: {
        /* metadata: { "displayName": "Sql Text" } */
        type: "column",
        name: "sql_text",
        sourceName: "ops_queries",
        jsType: "string",
        fieldId: 4943,
        tableId: 523,
        baseType: "type/Text"
      },
      viewName: {
        /* metadata: { "displayName": "View Name", "semanticType": "type/Category" } */
        type: "column",
        name: "view_name",
        sourceName: "ops_queries",
        jsType: "string",
        fieldId: 4933,
        tableId: 523,
        baseType: "type/Text"
      },
      views: {
        /* metadata: { "displayName": "Views", "semanticType": "type/Category" } */
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
  recentSales: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "recent_sales" } */
    type: "table",
    id: 524,
    name: "Recent Sales",
    fields: {
      amountUsd: {
        /* metadata: { "displayName": "Amount Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "amount_usd",
        sourceName: "recent_sales",
        jsType: "number",
        fieldId: 4956,
        tableId: 524,
        baseType: "type/Decimal"
      },
      channel: {
        /* metadata: { "displayName": "Channel", "semanticType": "type/Source" } */
        type: "column",
        name: "channel",
        sourceName: "recent_sales",
        jsType: "string",
        fieldId: 4954,
        tableId: 524,
        baseType: "type/Text"
      },
      cityKey: {
        /* metadata: { "displayName": "City Key", "semanticType": "type/Category" } */
        type: "column",
        name: "city_key",
        sourceName: "recent_sales",
        jsType: "string",
        fieldId: 4949,
        tableId: 524,
        baseType: "type/Text"
      },
      cityName: {
        /* metadata: { "displayName": "City Name", "semanticType": "type/City" } */
        type: "column",
        name: "city_name",
        sourceName: "recent_sales",
        jsType: "string",
        fieldId: 4950,
        tableId: 524,
        baseType: "type/Text"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/Country" } */
        type: "column",
        name: "country_code",
        sourceName: "recent_sales",
        jsType: "string",
        fieldId: 4951,
        tableId: 524,
        baseType: "type/Text"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "recent_sales",
        jsType: "string",
        fieldId: 4952,
        tableId: 524,
        baseType: "type/Text"
      },
      saleId: {
        /* metadata: { "displayName": "Sale ID", "semanticType": "type/PK" } */
        type: "column",
        name: "sale_id",
        sourceName: "recent_sales",
        jsType: "number",
        fieldId: 4944,
        tableId: 524,
        baseType: "type/BigInteger"
      },
      secondsAgo: {
        /* metadata: { "displayName": "Seconds Ago" } */
        type: "column",
        name: "seconds_ago",
        sourceName: "recent_sales",
        jsType: "number",
        fieldId: 4946,
        tableId: 524,
        baseType: "type/Integer"
      },
      soldAt: {
        /* metadata: { "displayName": "Sold At" } */
        type: "column",
        name: "sold_at",
        sourceName: "recent_sales",
        jsType: "Date",
        fieldId: 4945,
        tableId: 524,
        baseType: "type/DateTimeWithLocalTZ"
      },
      storeId: {
        /* metadata: { "displayName": "Store ID" } */
        type: "column",
        name: "store_id",
        sourceName: "recent_sales",
        jsType: "number",
        fieldId: 4947,
        tableId: 524,
        baseType: "type/Integer"
      },
      storeName: {
        /* metadata: { "displayName": "Store Name" } */
        type: "column",
        name: "store_name",
        sourceName: "recent_sales",
        jsType: "string",
        fieldId: 4948,
        tableId: 524,
        baseType: "type/Text"
      },
      unitPriceUsd: {
        /* metadata: { "displayName": "Unit Price Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "unit_price_usd",
        sourceName: "recent_sales",
        jsType: "number",
        fieldId: 4957,
        tableId: 524,
        baseType: "type/Decimal"
      },
      units: {
        /* metadata: { "displayName": "Units" } */
        type: "column",
        name: "units",
        sourceName: "recent_sales",
        jsType: "number",
        fieldId: 4955,
        tableId: 524,
        baseType: "type/Integer"
      },
      varietyName: {
        /* metadata: { "displayName": "Variety Name", "semanticType": "type/Category" } */
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
  salesPulse: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "sales_pulse" } */
    type: "table",
    id: 525,
    name: "Sales Pulse",
    fields: {
      asOf: {
        /* metadata: { "displayName": "As Of" } */
        type: "column",
        name: "as_of",
        sourceName: "sales_pulse",
        jsType: "Date",
        fieldId: 4963,
        tableId: 525,
        baseType: "type/DateTimeWithLocalTZ"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "sales_pulse",
        jsType: "string",
        fieldId: 4958,
        tableId: 525,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "sales_pulse",
        jsType: "string",
        fieldId: 4959,
        tableId: 525,
        baseType: "type/Text"
      },
      lastSaleAt: {
        /* metadata: { "displayName": "Last Sale At" } */
        type: "column",
        name: "last_sale_at",
        sourceName: "sales_pulse",
        jsType: "Date",
        fieldId: 4969,
        tableId: 525,
        baseType: "type/DateTimeWithLocalTZ"
      },
      localDate: {
        /* metadata: { "displayName": "Local Date" } */
        type: "column",
        name: "local_date",
        sourceName: "sales_pulse",
        jsType: "Date",
        fieldId: 4962,
        tableId: 525,
        baseType: "type/Date"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "sales_pulse",
        jsType: "string",
        fieldId: 4960,
        tableId: 525,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "sales_pulse",
        jsType: "string",
        fieldId: 4961,
        tableId: 525,
        baseType: "type/Text"
      },
      revenueLastHourUsd: {
        /* metadata: { "displayName": "Revenue Last Hour Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "revenue_last_hour_usd",
        sourceName: "sales_pulse",
        jsType: "number",
        fieldId: 4967,
        tableId: 525,
        baseType: "type/Decimal"
      },
      revenueTodayUsd: {
        /* metadata: { "displayName": "Revenue Today Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "revenue_today_usd",
        sourceName: "sales_pulse",
        jsType: "number",
        fieldId: 4964,
        tableId: 525,
        baseType: "type/Decimal"
      },
      salesLastHour: {
        /* metadata: { "displayName": "Sales Last Hour" } */
        type: "column",
        name: "sales_last_hour",
        sourceName: "sales_pulse",
        jsType: "number",
        fieldId: 4968,
        tableId: 525,
        baseType: "type/Integer"
      },
      salesToday: {
        /* metadata: { "displayName": "Sales Today" } */
        type: "column",
        name: "sales_today",
        sourceName: "sales_pulse",
        jsType: "number",
        fieldId: 4966,
        tableId: 525,
        baseType: "type/Integer"
      },
      secondsSinceLastSale: {
        /* metadata: { "displayName": "Seconds Since Last Sale" } */
        type: "column",
        name: "seconds_since_last_sale",
        sourceName: "sales_pulse",
        jsType: "number",
        fieldId: 4970,
        tableId: 525,
        baseType: "type/Integer"
      },
      unitsToday: {
        /* metadata: { "displayName": "Units Today" } */
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
  seasonDaily: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "season_daily" } */
    type: "table",
    id: 526,
    name: "Season Daily",
    fields: {
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "season_daily",
        jsType: "string",
        fieldId: 4971,
        tableId: 526,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "season_daily",
        jsType: "string",
        fieldId: 4972,
        tableId: 526,
        baseType: "type/Text"
      },
      cumLyRevenueUsd: {
        /* metadata: { "displayName": "Cum Ly Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "cum_ly_revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4989,
        tableId: 526,
        baseType: "type/Decimal"
      },
      cumPlanRevenueUsd: {
        /* metadata: { "displayName": "Cum Plan Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "cum_plan_revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4988,
        tableId: 526,
        baseType: "type/Decimal"
      },
      cumRevenueUsd: {
        /* metadata: { "displayName": "Cum Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "cum_revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4990,
        tableId: 526,
        baseType: "type/Decimal"
      },
      daysAgo: {
        /* metadata: { "displayName": "Days Ago" } */
        type: "column",
        name: "days_ago",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4978,
        tableId: 526,
        baseType: "type/Integer"
      },
      daysToHalloween: {
        /* metadata: { "displayName": "Days To Halloween" } */
        type: "column",
        name: "days_to_halloween",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4977,
        tableId: 526,
        baseType: "type/Integer"
      },
      grossMarginUsd: {
        /* metadata: { "displayName": "Gross Margin Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "gross_margin_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4986,
        tableId: 526,
        baseType: "type/Decimal"
      },
      isFuture: {
        /* metadata: { "displayName": "Is Future" } */
        type: "column",
        name: "is_future",
        sourceName: "season_daily",
        jsType: "boolean",
        fieldId: 4979,
        tableId: 526,
        baseType: "type/Boolean"
      },
      isToday: {
        /* metadata: { "displayName": "Is Today" } */
        type: "column",
        name: "is_today",
        sourceName: "season_daily",
        jsType: "boolean",
        fieldId: 4980,
        tableId: 526,
        baseType: "type/Boolean"
      },
      localDate: {
        /* metadata: { "displayName": "Local Date" } */
        type: "column",
        name: "local_date",
        sourceName: "season_daily",
        jsType: "Date",
        fieldId: 4975,
        tableId: 526,
        baseType: "type/Date"
      },
      lostRevenueUsd: {
        /* metadata: { "displayName": "Lost Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "lost_revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4987,
        tableId: 526,
        baseType: "type/Decimal"
      },
      lyRevenueFullUsd: {
        /* metadata: { "displayName": "Ly Revenue Full Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "ly_revenue_full_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4982,
        tableId: 526,
        baseType: "type/Decimal"
      },
      lyRevenueUsd: {
        /* metadata: { "displayName": "Ly Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "ly_revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4984,
        tableId: 526,
        baseType: "type/Decimal"
      },
      planRevenueFullUsd: {
        /* metadata: { "displayName": "Plan Revenue Full Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "plan_revenue_full_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4981,
        tableId: 526,
        baseType: "type/Decimal"
      },
      planRevenueUsd: {
        /* metadata: { "displayName": "Plan Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "plan_revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4983,
        tableId: 526,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "season_daily",
        jsType: "string",
        fieldId: 4973,
        tableId: 526,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "season_daily",
        jsType: "string",
        fieldId: 4974,
        tableId: 526,
        baseType: "type/Text"
      },
      revenueUsd: {
        /* metadata: { "displayName": "Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "revenue_usd",
        sourceName: "season_daily",
        jsType: "number",
        fieldId: 4985,
        tableId: 526,
        baseType: "type/Decimal"
      },
      seasonDay: {
        /* metadata: { "displayName": "Season Day" } */
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
  seasonLanding: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "season_landing" } */
    type: "table",
    id: 527,
    name: "Season Landing",
    fields: {
      attainment14d: {
        /* metadata: { "displayName": "Attainment 14d" } */
        type: "column",
        name: "attainment_14d",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5001,
        tableId: 527,
        baseType: "type/Decimal"
      },
      attainment7d: {
        /* metadata: { "displayName": "Attainment 7d" } */
        type: "column",
        name: "attainment_7d",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5000,
        tableId: 527,
        baseType: "type/Decimal"
      },
      attainmentHigh: {
        /* metadata: { "displayName": "Attainment High" } */
        type: "column",
        name: "attainment_high",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5003,
        tableId: 527,
        baseType: "type/Decimal"
      },
      attainmentLow: {
        /* metadata: { "displayName": "Attainment Low" } */
        type: "column",
        name: "attainment_low",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5002,
        tableId: 527,
        baseType: "type/Decimal"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "season_landing",
        jsType: "string",
        fieldId: 4991,
        tableId: 527,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "season_landing",
        jsType: "string",
        fieldId: 4992,
        tableId: 527,
        baseType: "type/Text"
      },
      landingHighUsd: {
        /* metadata: { "displayName": "Landing High Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "landing_high_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5006,
        tableId: 527,
        baseType: "type/Decimal"
      },
      landingLowUsd: {
        /* metadata: { "displayName": "Landing Low Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "landing_low_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5005,
        tableId: 527,
        baseType: "type/Decimal"
      },
      landingUsd: {
        /* metadata: { "displayName": "Landing Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "landing_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 5004,
        tableId: 527,
        baseType: "type/Decimal"
      },
      lySeasonRevenueUsd: {
        /* metadata: { "displayName": "Ly Season Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "ly_season_revenue_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 4996,
        tableId: 527,
        baseType: "type/Decimal"
      },
      planRemainingUsd: {
        /* metadata: { "displayName": "Plan Remaining Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "plan_remaining_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 4999,
        tableId: 527,
        baseType: "type/Decimal"
      },
      planToDateRevenueUsd: {
        /* metadata: { "displayName": "Plan To Date Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "plan_to_date_revenue_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 4998,
        tableId: 527,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "season_landing",
        jsType: "string",
        fieldId: 4993,
        tableId: 527,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "season_landing",
        jsType: "string",
        fieldId: 4994,
        tableId: 527,
        baseType: "type/Text"
      },
      revenueToDateUsd: {
        /* metadata: { "displayName": "Revenue To Date Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "revenue_to_date_usd",
        sourceName: "season_landing",
        jsType: "number",
        fieldId: 4997,
        tableId: 527,
        baseType: "type/Decimal"
      },
      seasonPlanRevenueUsd: {
        /* metadata: { "displayName": "Season Plan Revenue Usd", "semanticType": "type/Currency" } */
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
  seasonPlan: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "season_plan" } */
    type: "table",
    id: 528,
    name: "Season Plan",
    fields: {
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "season_plan",
        jsType: "string",
        fieldId: 5007,
        tableId: 528,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "season_plan",
        jsType: "string",
        fieldId: 5008,
        tableId: 528,
        baseType: "type/Text"
      },
      daysLeft: {
        /* metadata: { "displayName": "Days Left" } */
        type: "column",
        name: "days_left",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5018,
        tableId: 528,
        baseType: "type/Integer"
      },
      lySeasonRevenueUsd: {
        /* metadata: { "displayName": "Ly Season Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "ly_season_revenue_usd",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5014,
        tableId: 528,
        baseType: "type/Decimal"
      },
      lyToDateRevenueUsd: {
        /* metadata: { "displayName": "Ly To Date Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "ly_to_date_revenue_usd",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5015,
        tableId: 528,
        baseType: "type/Decimal"
      },
      planToDateRevenueUsd: {
        /* metadata: { "displayName": "Plan To Date Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "plan_to_date_revenue_usd",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5012,
        tableId: 528,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "season_plan",
        jsType: "string",
        fieldId: 5009,
        tableId: 528,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "season_plan",
        jsType: "string",
        fieldId: 5010,
        tableId: 528,
        baseType: "type/Text"
      },
      revenueToDateUsd: {
        /* metadata: { "displayName": "Revenue To Date Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "revenue_to_date_usd",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5013,
        tableId: 528,
        baseType: "type/Decimal"
      },
      seasonDaysElapsed: {
        /* metadata: { "displayName": "Season Days Elapsed" } */
        type: "column",
        name: "season_days_elapsed",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5017,
        tableId: 528,
        baseType: "type/Integer"
      },
      seasonDaysTotal: {
        /* metadata: { "displayName": "Season Days Total" } */
        type: "column",
        name: "season_days_total",
        sourceName: "season_plan",
        jsType: "number",
        fieldId: 5016,
        tableId: 528,
        baseType: "type/Integer"
      },
      seasonPlanRevenueUsd: {
        /* metadata: { "displayName": "Season Plan Revenue Usd", "semanticType": "type/Currency" } */
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
  simStatus: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "sim_status" } */
    type: "table",
    id: 529,
    name: "Sim Status",
    fields: {
      daysToHalloween: {
        /* metadata: { "displayName": "Days To Halloween" } */
        type: "column",
        name: "days_to_halloween",
        sourceName: "sim_status",
        jsType: "number",
        fieldId: 5023,
        tableId: 529,
        baseType: "type/Integer"
      },
      lastTickAt: {
        /* metadata: { "displayName": "Last Tick At" } */
        type: "column",
        name: "last_tick_at",
        sourceName: "sim_status",
        jsType: "Date",
        fieldId: 5024,
        tableId: 529,
        baseType: "type/DateTimeWithLocalTZ"
      },
      mode: {
        /* metadata: { "displayName": "Mode", "semanticType": "type/Category" } */
        type: "column",
        name: "mode",
        sourceName: "sim_status",
        jsType: "string",
        fieldId: 5020,
        tableId: 529,
        baseType: "type/Text"
      },
      offsetMinutes: {
        /* metadata: { "displayName": "Offset Minutes" } */
        type: "column",
        name: "offset_minutes",
        sourceName: "sim_status",
        jsType: "number",
        fieldId: 5021,
        tableId: 529,
        baseType: "type/Integer"
      },
      seasonDay: {
        /* metadata: { "displayName": "Season Day" } */
        type: "column",
        name: "season_day",
        sourceName: "sim_status",
        jsType: "number",
        fieldId: 5022,
        tableId: 529,
        baseType: "type/Integer"
      },
      simNow: {
        /* metadata: { "displayName": "Sim Now" } */
        type: "column",
        name: "sim_now",
        sourceName: "sim_status",
        jsType: "Date",
        fieldId: 5019,
        tableId: 529,
        baseType: "type/DateTimeWithLocalTZ"
      },
      tickLagSeconds: {
        /* metadata: { "displayName": "Tick Lag Seconds" } */
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
  stockOutlook: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "stock_outlook" } */
    type: "table",
    id: 530,
    name: "Stock Outlook",
    fields: {
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "stock_outlook",
        jsType: "string",
        fieldId: 5026,
        tableId: 530,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "stock_outlook",
        jsType: "string",
        fieldId: 5027,
        tableId: 530,
        baseType: "type/Text"
      },
      demandPlanUnits: {
        /* metadata: { "displayName": "Demand Plan Units" } */
        type: "column",
        name: "demand_plan_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5038,
        tableId: 530,
        baseType: "type/Integer"
      },
      harvestAttainmentHigh: {
        /* metadata: { "displayName": "Harvest Attainment High" } */
        type: "column",
        name: "harvest_attainment_high",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5037,
        tableId: 530,
        baseType: "type/Decimal"
      },
      harvestAttainmentLow: {
        /* metadata: { "displayName": "Harvest Attainment Low" } */
        type: "column",
        name: "harvest_attainment_low",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5036,
        tableId: 530,
        baseType: "type/Decimal"
      },
      harvestPlanUnits: {
        /* metadata: { "displayName": "Harvest Plan Units" } */
        type: "column",
        name: "harvest_plan_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5035,
        tableId: 530,
        baseType: "type/Integer"
      },
      hubUnits: {
        /* metadata: { "displayName": "Hub Units" } */
        type: "column",
        name: "hub_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5032,
        tableId: 530,
        baseType: "type/Integer"
      },
      leftoverNov1CostUsd: {
        /* metadata: { "displayName": "Leftover Nov1 Cost Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "leftover_nov1_cost_usd",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5044,
        tableId: 530,
        baseType: "type/Decimal"
      },
      leftoverNov1HighUnits: {
        /* metadata: { "displayName": "Leftover Nov1 High Units" } */
        type: "column",
        name: "leftover_nov1_high_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5043,
        tableId: 530,
        baseType: "type/Integer"
      },
      leftoverNov1LowUnits: {
        /* metadata: { "displayName": "Leftover Nov1 Low Units" } */
        type: "column",
        name: "leftover_nov1_low_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5041,
        tableId: 530,
        baseType: "type/Integer"
      },
      leftoverNov1RetailUsd: {
        /* metadata: { "displayName": "Leftover Nov1 Retail Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "leftover_nov1_retail_usd",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5045,
        tableId: 530,
        baseType: "type/Decimal"
      },
      leftoverNov1Units: {
        /* metadata: { "displayName": "Leftover Nov1 Units" } */
        type: "column",
        name: "leftover_nov1_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5042,
        tableId: 530,
        baseType: "type/Integer"
      },
      markdownExposureUsd: {
        /* metadata: { "displayName": "Markdown Exposure Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "markdown_exposure_usd",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5047,
        tableId: 530,
        baseType: "type/Decimal"
      },
      novemberDemandUnits: {
        /* metadata: { "displayName": "November Demand Units" } */
        type: "column",
        name: "november_demand_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5046,
        tableId: 530,
        baseType: "type/Integer"
      },
      onHandUnits: {
        /* metadata: { "displayName": "On Hand Units" } */
        type: "column",
        name: "on_hand_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5034,
        tableId: 530,
        baseType: "type/Integer"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "stock_outlook",
        jsType: "string",
        fieldId: 5028,
        tableId: 530,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "stock_outlook",
        jsType: "string",
        fieldId: 5029,
        tableId: 530,
        baseType: "type/Text"
      },
      seasonEndLeftoverCostUsd: {
        /* metadata: { "displayName": "Season End Leftover Cost Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "season_end_leftover_cost_usd",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5049,
        tableId: 530,
        baseType: "type/Decimal"
      },
      seasonEndLeftoverUnits: {
        /* metadata: { "displayName": "Season End Leftover Units" } */
        type: "column",
        name: "season_end_leftover_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5048,
        tableId: 530,
        baseType: "type/Integer"
      },
      soldExpectedUnits: {
        /* metadata: { "displayName": "Sold Expected Units" } */
        type: "column",
        name: "sold_expected_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5040,
        tableId: 530,
        baseType: "type/Integer"
      },
      soldVsPlan: {
        /* metadata: { "displayName": "Sold Vs Plan" } */
        type: "column",
        name: "sold_vs_plan",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5039,
        tableId: 530,
        baseType: "type/Decimal"
      },
      storeUnits: {
        /* metadata: { "displayName": "Store Units" } */
        type: "column",
        name: "store_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5031,
        tableId: 530,
        baseType: "type/Integer"
      },
      transitUnits: {
        /* metadata: { "displayName": "Transit Units" } */
        type: "column",
        name: "transit_units",
        sourceName: "stock_outlook",
        jsType: "number",
        fieldId: 5033,
        tableId: 530,
        baseType: "type/Integer"
      },
      varietyName: {
        /* metadata: { "displayName": "Variety Name", "semanticType": "type/Category" } */
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
  stockouts: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live" } */
    type: "table",
    id: 531,
    name: "Stockouts",
    fields: {
      cause: {
        /* metadata: { "displayName": "Cause", "semanticType": "type/Category" } */
        type: "column",
        name: "cause",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5062,
        tableId: 531,
        baseType: "type/Text"
      },
      cityKey: {
        /* metadata: { "displayName": "City Key", "semanticType": "type/Category" } */
        type: "column",
        name: "city_key",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5052,
        tableId: 531,
        baseType: "type/Text"
      },
      cityName: {
        /* metadata: { "displayName": "City Name", "semanticType": "type/City" } */
        type: "column",
        name: "city_name",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5053,
        tableId: 531,
        baseType: "type/Text"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5054,
        tableId: 531,
        baseType: "type/Text"
      },
      daysAgo: {
        /* metadata: { "displayName": "Days Ago" } */
        type: "column",
        name: "days_ago",
        sourceName: "stockouts",
        jsType: "number",
        fieldId: 5066,
        tableId: 531,
        baseType: "type/Integer"
      },
      endedAt: {
        /* metadata: { "displayName": "Ended At" } */
        type: "column",
        name: "ended_at",
        sourceName: "stockouts",
        jsType: "Date",
        fieldId: 5058,
        tableId: 531,
        baseType: "type/DateTimeWithLocalTZ"
      },
      isOngoing: {
        /* metadata: { "displayName": "Is Ongoing" } */
        type: "column",
        name: "is_ongoing",
        sourceName: "stockouts",
        jsType: "boolean",
        fieldId: 5059,
        tableId: 531,
        baseType: "type/Boolean"
      },
      lostRevenueUsd: {
        /* metadata: { "displayName": "Lost Revenue Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "lost_revenue_usd",
        sourceName: "stockouts",
        jsType: "number",
        fieldId: 5061,
        tableId: 531,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5055,
        tableId: 531,
        baseType: "type/Text"
      },
      startedAt: {
        /* metadata: { "displayName": "Started At", "semanticType": "type/CreationTimestamp" } */
        type: "column",
        name: "started_at",
        sourceName: "stockouts",
        jsType: "Date",
        fieldId: 5057,
        tableId: 531,
        baseType: "type/DateTimeWithLocalTZ"
      },
      storeId: {
        /* metadata: { "displayName": "Store ID" } */
        type: "column",
        name: "store_id",
        sourceName: "stockouts",
        jsType: "number",
        fieldId: 5050,
        tableId: 531,
        baseType: "type/Integer"
      },
      storeName: {
        /* metadata: { "displayName": "Store Name" } */
        type: "column",
        name: "store_name",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5051,
        tableId: 531,
        baseType: "type/Text"
      },
      tripId: {
        /* metadata: { "displayName": "Trip ID" } */
        type: "column",
        name: "trip_id",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5063,
        tableId: 531,
        baseType: "type/Text"
      },
      truckId: {
        /* metadata: { "displayName": "Truck ID", "semanticType": "type/FK" } */
        type: "column",
        name: "truck_id",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5064,
        tableId: 531,
        baseType: "type/Text"
      },
      truckLabel: {
        /* metadata: { "displayName": "Truck Label" } */
        type: "column",
        name: "truck_label",
        sourceName: "stockouts",
        jsType: "string",
        fieldId: 5065,
        tableId: 531,
        baseType: "type/Text"
      },
      unitsLost: {
        /* metadata: { "displayName": "Units Lost" } */
        type: "column",
        name: "units_lost",
        sourceName: "stockouts",
        jsType: "number",
        fieldId: 5060,
        tableId: 531,
        baseType: "type/Integer"
      },
      varietyName: {
        /* metadata: { "displayName": "Variety Name", "semanticType": "type/Category" } */
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
  storeNow: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "store_now" } */
    type: "table",
    id: 532,
    name: "Store Now",
    fields: {
      availability7d: {
        /* metadata: { "displayName": "Availability 7d" } */
        type: "column",
        name: "availability_7d",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5115,
        tableId: 532,
        baseType: "type/Decimal"
      },
      availabilitySeason: {
        /* metadata: { "displayName": "Availability Season" } */
        type: "column",
        name: "availability_season",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5121,
        tableId: 532,
        baseType: "type/Decimal"
      },
      capCarving: {
        /* metadata: { "displayName": "Cap Carving" } */
        type: "column",
        name: "cap_carving",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5093,
        tableId: 532,
        baseType: "type/Integer"
      },
      capCooking: {
        /* metadata: { "displayName": "Cap Cooking" } */
        type: "column",
        name: "cap_cooking",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5094,
        tableId: 532,
        baseType: "type/Integer"
      },
      capMini: {
        /* metadata: { "displayName": "Cap Mini" } */
        type: "column",
        name: "cap_mini",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5095,
        tableId: 532,
        baseType: "type/Integer"
      },
      cityKey: {
        /* metadata: { "displayName": "City Key", "semanticType": "type/FK" } */
        type: "column",
        name: "city_key",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5080,
        tableId: 532,
        baseType: "type/Text"
      },
      cityName: {
        /* metadata: { "displayName": "City Name", "semanticType": "type/City" } */
        type: "column",
        name: "city_name",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5081,
        tableId: 532,
        baseType: "type/Text"
      },
      closesAt: {
        /* metadata: { "displayName": "Closes At" } */
        type: "column",
        name: "closes_at",
        sourceName: "store_now",
        jsType: "Date",
        fieldId: 5089,
        tableId: 532,
        baseType: "type/DateTimeWithLocalTZ"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5082,
        tableId: 532,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5083,
        tableId: 532,
        baseType: "type/Text"
      },
      coverHoursCarving: {
        /* metadata: { "displayName": "Cover Hours Carving" } */
        type: "column",
        name: "cover_hours_carving",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5097,
        tableId: 532,
        baseType: "type/Decimal"
      },
      coverHoursCooking: {
        /* metadata: { "displayName": "Cover Hours Cooking" } */
        type: "column",
        name: "cover_hours_cooking",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5098,
        tableId: 532,
        baseType: "type/Decimal"
      },
      coverHoursMini: {
        /* metadata: { "displayName": "Cover Hours Mini" } */
        type: "column",
        name: "cover_hours_mini",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5099,
        tableId: 532,
        baseType: "type/Decimal"
      },
      fillRate7d: {
        /* metadata: { "displayName": "Fill Rate 7d" } */
        type: "column",
        name: "fill_rate_7d",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5114,
        tableId: 532,
        baseType: "type/Decimal"
      },
      fillRateSeason: {
        /* metadata: { "displayName": "Fill Rate Season" } */
        type: "column",
        name: "fill_rate_season",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5120,
        tableId: 532,
        baseType: "type/Decimal"
      },
      isOpen: {
        /* metadata: { "displayName": "Is Open" } */
        type: "column",
        name: "is_open",
        sourceName: "store_now",
        jsType: "boolean",
        fieldId: 5087,
        tableId: 532,
        baseType: "type/Boolean"
      },
      lost7dUsd: {
        /* metadata: { "displayName": "Lost 7d Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "lost_7d_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5113,
        tableId: 532,
        baseType: "type/Decimal"
      },
      lostTodayUnits: {
        /* metadata: { "displayName": "Lost Today Units" } */
        type: "column",
        name: "lost_today_units",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5108,
        tableId: 532,
        baseType: "type/Integer"
      },
      lostTodayUsd: {
        /* metadata: { "displayName": "Lost Today Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "lost_today_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5109,
        tableId: 532,
        baseType: "type/Decimal"
      },
      lowVariety: {
        /* metadata: { "displayName": "Low Variety", "semanticType": "type/Category" } */
        type: "column",
        name: "low_variety",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5105,
        tableId: 532,
        baseType: "type/Text"
      },
      ly7dUsd: {
        /* metadata: { "displayName": "Ly 7d Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "ly_7d_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5112,
        tableId: 532,
        baseType: "type/Decimal"
      },
      lySeasonUsd: {
        /* metadata: { "displayName": "Ly Season Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "ly_season_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5119,
        tableId: 532,
        baseType: "type/Decimal"
      },
      minCoverHours: {
        /* metadata: { "displayName": "Min Cover Hours" } */
        type: "column",
        name: "min_cover_hours",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5100,
        tableId: 532,
        baseType: "type/Decimal"
      },
      nextCarving: {
        /* metadata: { "displayName": "Next Carving" } */
        type: "column",
        name: "next_carving",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5134,
        tableId: 532,
        baseType: "type/Integer"
      },
      nextCooking: {
        /* metadata: { "displayName": "Next Cooking" } */
        type: "column",
        name: "next_cooking",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5135,
        tableId: 532,
        baseType: "type/Integer"
      },
      nextDelayCause: {
        /* metadata: { "displayName": "Next Delay Cause" } */
        type: "column",
        name: "next_delay_cause",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5131,
        tableId: 532,
        baseType: "type/Text"
      },
      nextDelayNote: {
        /* metadata: { "displayName": "Next Delay Note" } */
        type: "column",
        name: "next_delay_note",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5132,
        tableId: 532,
        baseType: "type/Text"
      },
      nextDriverName: {
        /* metadata: { "displayName": "Next Driver Name", "semanticType": "type/Category" } */
        type: "column",
        name: "next_driver_name",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5126,
        tableId: 532,
        baseType: "type/Text"
      },
      nextEtaAt: {
        /* metadata: { "displayName": "Next Eta At" } */
        type: "column",
        name: "next_eta_at",
        sourceName: "store_now",
        jsType: "Date",
        fieldId: 5128,
        tableId: 532,
        baseType: "type/DateTimeWithLocalTZ"
      },
      nextLateMinutes: {
        /* metadata: { "displayName": "Next Late Minutes" } */
        type: "column",
        name: "next_late_minutes",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5130,
        tableId: 532,
        baseType: "type/Integer"
      },
      nextMini: {
        /* metadata: { "displayName": "Next Mini" } */
        type: "column",
        name: "next_mini",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5136,
        tableId: 532,
        baseType: "type/Integer"
      },
      nextPlannedAt: {
        /* metadata: { "displayName": "Next Planned At" } */
        type: "column",
        name: "next_planned_at",
        sourceName: "store_now",
        jsType: "Date",
        fieldId: 5129,
        tableId: 532,
        baseType: "type/DateTimeWithLocalTZ"
      },
      nextPlannedDeliveryAt: {
        /* metadata: { "displayName": "Next Planned Delivery At" } */
        type: "column",
        name: "next_planned_delivery_at",
        sourceName: "store_now",
        jsType: "Date",
        fieldId: 5137,
        tableId: 532,
        baseType: "type/DateTimeWithLocalTZ"
      },
      nextStatus: {
        /* metadata: { "displayName": "Next Status", "semanticType": "type/Category" } */
        type: "column",
        name: "next_status",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5127,
        tableId: 532,
        baseType: "type/Text"
      },
      nextTripId: {
        /* metadata: { "displayName": "Next Trip ID", "semanticType": "type/Category" } */
        type: "column",
        name: "next_trip_id",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5123,
        tableId: 532,
        baseType: "type/Text"
      },
      nextTruckId: {
        /* metadata: { "displayName": "Next Truck ID", "semanticType": "type/Category" } */
        type: "column",
        name: "next_truck_id",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5124,
        tableId: 532,
        baseType: "type/Text"
      },
      nextTruckLabel: {
        /* metadata: { "displayName": "Next Truck Label", "semanticType": "type/Category" } */
        type: "column",
        name: "next_truck_label",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5125,
        tableId: 532,
        baseType: "type/Text"
      },
      nextUnits: {
        /* metadata: { "displayName": "Next Units" } */
        type: "column",
        name: "next_units",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5133,
        tableId: 532,
        baseType: "type/Integer"
      },
      onHandCarving: {
        /* metadata: { "displayName": "On Hand Carving" } */
        type: "column",
        name: "on_hand_carving",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5090,
        tableId: 532,
        baseType: "type/Integer"
      },
      onHandCooking: {
        /* metadata: { "displayName": "On Hand Cooking" } */
        type: "column",
        name: "on_hand_cooking",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5091,
        tableId: 532,
        baseType: "type/Integer"
      },
      onHandMini: {
        /* metadata: { "displayName": "On Hand Mini" } */
        type: "column",
        name: "on_hand_mini",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5092,
        tableId: 532,
        baseType: "type/Integer"
      },
      onHandUnits: {
        /* metadata: { "displayName": "On Hand Units" } */
        type: "column",
        name: "on_hand_units",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5096,
        tableId: 532,
        baseType: "type/Integer"
      },
      openHoursToNextDelivery: {
        /* metadata: { "displayName": "Open Hours To Next Delivery" } */
        type: "column",
        name: "open_hours_to_next_delivery",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5138,
        tableId: 532,
        baseType: "type/Decimal"
      },
      opensAt: {
        /* metadata: { "displayName": "Opens At" } */
        type: "column",
        name: "opens_at",
        sourceName: "store_now",
        jsType: "Date",
        fieldId: 5088,
        tableId: 532,
        baseType: "type/DateTimeWithLocalTZ"
      },
      outCause: {
        /* metadata: { "displayName": "Out Cause", "semanticType": "type/Category" } */
        type: "column",
        name: "out_cause",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5104,
        tableId: 532,
        baseType: "type/Text"
      },
      outSince: {
        /* metadata: { "displayName": "Out Since" } */
        type: "column",
        name: "out_since",
        sourceName: "store_now",
        jsType: "Date",
        fieldId: 5103,
        tableId: 532,
        baseType: "type/DateTimeWithLocalTZ"
      },
      outVariety: {
        /* metadata: { "displayName": "Out Variety", "semanticType": "type/Category" } */
        type: "column",
        name: "out_variety",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5102,
        tableId: 532,
        baseType: "type/Text"
      },
      plan7dUsd: {
        /* metadata: { "displayName": "Plan 7d Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "plan_7d_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5111,
        tableId: 532,
        baseType: "type/Decimal"
      },
      planSeasonUsd: {
        /* metadata: { "displayName": "Plan Season Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "plan_season_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5118,
        tableId: 532,
        baseType: "type/Decimal"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5084,
        tableId: 532,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5085,
        tableId: 532,
        baseType: "type/Text"
      },
      revenue7dUsd: {
        /* metadata: { "displayName": "Revenue 7d Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "revenue_7d_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5110,
        tableId: 532,
        baseType: "type/Decimal"
      },
      revenueSeasonUsd: {
        /* metadata: { "displayName": "Revenue Season Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "revenue_season_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5117,
        tableId: 532,
        baseType: "type/Decimal"
      },
      revenueTodayUsd: {
        /* metadata: { "displayName": "Revenue Today Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "revenue_today_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5107,
        tableId: 532,
        baseType: "type/Decimal"
      },
      shrink7dUsd: {
        /* metadata: { "displayName": "Shrink 7d Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "shrink_7d_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5116,
        tableId: 532,
        baseType: "type/Decimal"
      },
      shrinkSeasonUsd: {
        /* metadata: { "displayName": "Shrink Season Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "shrink_season_usd",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5122,
        tableId: 532,
        baseType: "type/Decimal"
      },
      soldTodayUnits: {
        /* metadata: { "displayName": "Sold Today Units" } */
        type: "column",
        name: "sold_today_units",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5106,
        tableId: 532,
        baseType: "type/Integer"
      },
      stockStatus: {
        /* metadata: { "displayName": "Stock Status", "semanticType": "type/State" } */
        type: "column",
        name: "stock_status",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5101,
        tableId: 532,
        baseType: "type/Text"
      },
      storeFormat: {
        /* metadata: { "displayName": "Store Format", "semanticType": "type/Category" } */
        type: "column",
        name: "store_format",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5079,
        tableId: 532,
        baseType: "type/Text"
      },
      storeId: {
        /* metadata: { "displayName": "Store ID" } */
        type: "column",
        name: "store_id",
        sourceName: "store_now",
        jsType: "number",
        fieldId: 5077,
        tableId: 532,
        baseType: "type/Integer"
      },
      storeName: {
        /* metadata: { "displayName": "Store Name" } */
        type: "column",
        name: "store_name",
        sourceName: "store_now",
        jsType: "string",
        fieldId: 5078,
        tableId: 532,
        baseType: "type/Text"
      },
      tz: {
        /* metadata: { "displayName": "Tz", "semanticType": "type/Category" } */
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
  storeOrders: {
    /* metadata: { "databaseName": "neondb", "schemaName": "dataapps_v65", "tableName": "store_orders" } */
    type: "table",
    id: 590,
    name: "Store Orders",
    fields: {
      channelMvi6198j: {
        /* metadata: { "displayName": "Channel Mvi6198j", "semanticType": "type/Source" } */
        type: "column",
        name: "channel_mvi6198j",
        sourceName: "store_orders",
        jsType: "string",
        fieldId: 6156,
        tableId: 590,
        baseType: "type/Text"
      },
      createdAt: {
        /* metadata: { "displayName": "Created At", "semanticType": "type/CreationTimestamp" } */
        type: "column",
        name: "created_at",
        sourceName: "store_orders",
        jsType: "Date",
        fieldId: 6151,
        tableId: 590,
        baseType: "type/DateTimeWithLocalTZ"
      },
      id: {
        /* metadata: { "displayName": "ID", "semanticType": "type/PK" } */
        type: "column",
        name: "id",
        sourceName: "store_orders",
        jsType: "number",
        fieldId: 6142,
        tableId: 590,
        baseType: "type/Integer"
      },
      margin: {
        /* metadata: { "displayName": "Margin", "semanticType": "type/GrossMargin" } */
        type: "column",
        name: "margin",
        sourceName: "store_orders",
        jsType: "number",
        fieldId: 6148,
        tableId: 590,
        baseType: "type/Decimal"
      },
      notes: {
        /* metadata: { "displayName": "Notes" } */
        type: "column",
        name: "notes",
        sourceName: "store_orders",
        jsType: "string",
        fieldId: 6150,
        tableId: 590,
        baseType: "type/Text"
      },
      product: {
        /* metadata: { "displayName": "Product", "semanticType": "type/Category" } */
        type: "column",
        name: "product",
        sourceName: "store_orders",
        jsType: "string",
        fieldId: 6145,
        tableId: 590,
        baseType: "type/Text"
      },
      quantity: {
        /* metadata: { "displayName": "Quantity", "semanticType": "type/Quantity" } */
        type: "column",
        name: "quantity",
        sourceName: "store_orders",
        jsType: "number",
        fieldId: 6146,
        tableId: 590,
        baseType: "type/Integer"
      },
      region: {
        /* metadata: { "displayName": "Region", "semanticType": "type/Category" } */
        type: "column",
        name: "region",
        sourceName: "store_orders",
        jsType: "string",
        fieldId: 6144,
        tableId: 590,
        baseType: "type/Text"
      },
      status: {
        /* metadata: { "displayName": "Status", "semanticType": "type/Category" } */
        type: "column",
        name: "status",
        sourceName: "store_orders",
        jsType: "string",
        fieldId: 6149,
        tableId: 590,
        baseType: "type/Text"
      },
      storeId: {
        /* metadata: { "displayName": "Store ID", "semanticType": "type/FK" } */
        type: "column",
        name: "store_id",
        sourceName: "store_orders",
        jsType: "number",
        fieldId: 6143,
        tableId: 590,
        baseType: "type/Integer"
      },
      total: {
        /* metadata: { "displayName": "Total" } */
        type: "column",
        name: "total",
        sourceName: "store_orders",
        jsType: "number",
        fieldId: 6147,
        tableId: 590,
        baseType: "type/Decimal"
      }
    },
    segments: {
      dAv65OpenOrders: {
        /* metadata: { "entityId": "0QKYdCxTfwrN0w0kZbvvD", "description": "status = open" } */
        type: "segment",
        id: 36,
        tableId: 590,
        name: "DAv65 Open orders"
      }
    },
    measures: {
      dAv65TotalRevenue: {
        /* metadata: { "entityId": "u4_4IzpaQYIB0AVfjYAfx", "description": "sum of total" } */
        type: "measure",
        id: 1,
        tableId: 590,
        name: "DAv65 Total revenue",
        columns: [
          {
            /* metadata: { "displayName": "Sum of Total", "baseType": "type/Decimal" } */
            type: "column",
            name: "sum",
            jsType: "number"
          }
        ]
      }
    }
  },
  stores533: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "stores" } */
    type: "table",
    id: 533,
    name: "Stores",
    fields: {
      capCarving: {
        /* metadata: { "displayName": "Cap Carving" } */
        type: "column",
        name: "cap_carving",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5153,
        tableId: 533,
        baseType: "type/Integer"
      },
      capCooking: {
        /* metadata: { "displayName": "Cap Cooking" } */
        type: "column",
        name: "cap_cooking",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5154,
        tableId: 533,
        baseType: "type/Integer"
      },
      capMini: {
        /* metadata: { "displayName": "Cap Mini" } */
        type: "column",
        name: "cap_mini",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5155,
        tableId: 533,
        baseType: "type/Integer"
      },
      cityKey: {
        /* metadata: { "displayName": "City Key", "semanticType": "type/FK" } */
        type: "column",
        name: "city_key",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5142,
        tableId: 533,
        baseType: "type/Text"
      },
      cityName: {
        /* metadata: { "displayName": "City Name", "semanticType": "type/City" } */
        type: "column",
        name: "city_name",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5143,
        tableId: 533,
        baseType: "type/Text"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5144,
        tableId: 533,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5145,
        tableId: 533,
        baseType: "type/Text"
      },
      hubId: {
        /* metadata: { "displayName": "Hub ID", "semanticType": "type/FK" } */
        type: "column",
        name: "hub_id",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5148,
        tableId: 533,
        baseType: "type/Text"
      },
      hubName: {
        /* metadata: { "displayName": "Hub Name", "semanticType": "type/Category" } */
        type: "column",
        name: "hub_name",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5149,
        tableId: 533,
        baseType: "type/Text"
      },
      latitude: {
        /* metadata: { "displayName": "Latitude", "semanticType": "type/Latitude" } */
        type: "column",
        name: "latitude",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5159,
        tableId: 533,
        baseType: "type/Decimal"
      },
      longitude: {
        /* metadata: { "displayName": "Longitude", "semanticType": "type/Longitude" } */
        type: "column",
        name: "longitude",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5160,
        tableId: 533,
        baseType: "type/Decimal"
      },
      openedYear: {
        /* metadata: { "displayName": "Opened Year" } */
        type: "column",
        name: "opened_year",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5157,
        tableId: 533,
        baseType: "type/Integer"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5146,
        tableId: 533,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5147,
        tableId: 533,
        baseType: "type/Text"
      },
      shelfCapacityUnits: {
        /* metadata: { "displayName": "Shelf Capacity Units" } */
        type: "column",
        name: "shelf_capacity_units",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5156,
        tableId: 533,
        baseType: "type/Integer"
      },
      storeFormat: {
        /* metadata: { "displayName": "Store Format", "semanticType": "type/Category" } */
        type: "column",
        name: "store_format",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5141,
        tableId: 533,
        baseType: "type/Text"
      },
      storeId: {
        /* metadata: { "displayName": "Store ID", "semanticType": "type/PK" } */
        type: "column",
        name: "store_id",
        sourceName: "stores",
        jsType: "number",
        fieldId: 5139,
        tableId: 533,
        baseType: "type/Integer"
      },
      storeLead: {
        /* metadata: { "displayName": "Store Lead" } */
        type: "column",
        name: "store_lead",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5158,
        tableId: 533,
        baseType: "type/Text"
      },
      storeName: {
        /* metadata: { "displayName": "Store Name" } */
        type: "column",
        name: "store_name",
        sourceName: "stores",
        jsType: "string",
        fieldId: 5140,
        tableId: 533,
        baseType: "type/Text"
      },
      tz: {
        /* metadata: { "displayName": "Tz", "semanticType": "type/Category" } */
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
  stores591: {
    /* metadata: { "databaseName": "neondb", "schemaName": "dataapps_v65", "tableName": "stores" } */
    type: "table",
    id: 591,
    name: "Stores",
    fields: {
      id: {
        /* metadata: { "displayName": "ID", "semanticType": "type/PK" } */
        type: "column",
        name: "id",
        sourceName: "stores",
        jsType: "number",
        fieldId: 6152,
        tableId: 591,
        baseType: "type/Integer"
      },
      manager: {
        /* metadata: { "displayName": "Manager", "semanticType": "type/Category" } */
        type: "column",
        name: "manager",
        sourceName: "stores",
        jsType: "string",
        fieldId: 6155,
        tableId: 591,
        baseType: "type/Text"
      },
      name: {
        /* metadata: { "displayName": "Name", "semanticType": "type/Name" } */
        type: "column",
        name: "name",
        sourceName: "stores",
        jsType: "string",
        fieldId: 6153,
        tableId: 591,
        baseType: "type/Text"
      },
      region: {
        /* metadata: { "displayName": "Region", "semanticType": "type/Category" } */
        type: "column",
        name: "region",
        sourceName: "stores",
        jsType: "string",
        fieldId: 6154,
        tableId: 591,
        baseType: "type/Text"
      }
    }
  },
  tripTimeline: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "trip_timeline" } */
    type: "table",
    id: 534,
    name: "Trip Timeline",
    fields: {
      detail: {
        /* metadata: { "displayName": "Detail", "semanticType": "type/Category" } */
        type: "column",
        name: "detail",
        sourceName: "trip_timeline",
        jsType: "string",
        fieldId: 5235,
        tableId: 534,
        baseType: "type/Text"
      },
      eventAt: {
        /* metadata: { "displayName": "Event At" } */
        type: "column",
        name: "event_at",
        sourceName: "trip_timeline",
        jsType: "Date",
        fieldId: 5231,
        tableId: 534,
        baseType: "type/DateTimeWithLocalTZ"
      },
      isEstimate: {
        /* metadata: { "displayName": "Is Estimate" } */
        type: "column",
        name: "is_estimate",
        sourceName: "trip_timeline",
        jsType: "boolean",
        fieldId: 5232,
        tableId: 534,
        baseType: "type/Boolean"
      },
      label: {
        /* metadata: { "displayName": "Label" } */
        type: "column",
        name: "label",
        sourceName: "trip_timeline",
        jsType: "string",
        fieldId: 5234,
        tableId: 534,
        baseType: "type/Text"
      },
      seq: {
        /* metadata: { "displayName": "Seq" } */
        type: "column",
        name: "seq",
        sourceName: "trip_timeline",
        jsType: "number",
        fieldId: 5230,
        tableId: 534,
        baseType: "type/Integer"
      },
      state: {
        /* metadata: { "displayName": "State", "semanticType": "type/Category" } */
        type: "column",
        name: "state",
        sourceName: "trip_timeline",
        jsType: "string",
        fieldId: 5233,
        tableId: 534,
        baseType: "type/Text"
      },
      tripId: {
        /* metadata: { "displayName": "Trip ID" } */
        type: "column",
        name: "trip_id",
        sourceName: "trip_timeline",
        jsType: "string",
        fieldId: 5229,
        tableId: 534,
        baseType: "type/Text"
      },
      truckId: {
        /* metadata: { "displayName": "Truck ID" } */
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
  truckFaults: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live", "tableName": "truck_faults" } */
    type: "table",
    id: 535,
    name: "Truck Faults",
    fields: {
      clearedAt: {
        /* metadata: { "displayName": "Cleared At" } */
        type: "column",
        name: "cleared_at",
        sourceName: "truck_faults",
        jsType: "Date",
        fieldId: 5242,
        tableId: 535,
        baseType: "type/DateTimeWithLocalTZ"
      },
      code: {
        /* metadata: { "displayName": "Code", "semanticType": "type/Category" } */
        type: "column",
        name: "code",
        sourceName: "truck_faults",
        jsType: "string",
        fieldId: 5238,
        tableId: 535,
        baseType: "type/Text"
      },
      description: {
        /* metadata: { "displayName": "Description", "semanticType": "type/Description" } */
        type: "column",
        name: "description",
        sourceName: "truck_faults",
        jsType: "string",
        fieldId: 5239,
        tableId: 535,
        baseType: "type/Text"
      },
      raisedAt: {
        /* metadata: { "displayName": "Raised At" } */
        type: "column",
        name: "raised_at",
        sourceName: "truck_faults",
        jsType: "Date",
        fieldId: 5241,
        tableId: 535,
        baseType: "type/DateTimeWithLocalTZ"
      },
      severity: {
        /* metadata: { "displayName": "Severity", "semanticType": "type/Category" } */
        type: "column",
        name: "severity",
        sourceName: "truck_faults",
        jsType: "string",
        fieldId: 5240,
        tableId: 535,
        baseType: "type/Text"
      },
      truckId: {
        /* metadata: { "displayName": "Truck ID" } */
        type: "column",
        name: "truck_id",
        sourceName: "truck_faults",
        jsType: "string",
        fieldId: 5236,
        tableId: 535,
        baseType: "type/Text"
      },
      truckLabel: {
        /* metadata: { "displayName": "Truck Label", "semanticType": "type/Category" } */
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
  trucks: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live" } */
    type: "table",
    id: 536,
    name: "Trucks",
    fields: {
      body: {
        /* metadata: { "displayName": "Body", "semanticType": "type/Category" } */
        type: "column",
        name: "body",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5253,
        tableId: 536,
        baseType: "type/Text"
      },
      capacityBins: {
        /* metadata: { "displayName": "Capacity Bins" } */
        type: "column",
        name: "capacity_bins",
        sourceName: "trucks",
        jsType: "number",
        fieldId: 5255,
        tableId: 536,
        baseType: "type/Integer"
      },
      countryCode: {
        /* metadata: { "displayName": "Country Code", "semanticType": "type/FK" } */
        type: "column",
        name: "country_code",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5248,
        tableId: 536,
        baseType: "type/Text"
      },
      countryName: {
        /* metadata: { "displayName": "Country Name", "semanticType": "type/Country" } */
        type: "column",
        name: "country_name",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5249,
        tableId: 536,
        baseType: "type/Text"
      },
      fleetNo: {
        /* metadata: { "displayName": "Fleet No" } */
        type: "column",
        name: "fleet_no",
        sourceName: "trucks",
        jsType: "number",
        fieldId: 5244,
        tableId: 536,
        baseType: "type/Integer"
      },
      hubId: {
        /* metadata: { "displayName": "Hub ID", "semanticType": "type/FK" } */
        type: "column",
        name: "hub_id",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5246,
        tableId: 536,
        baseType: "type/Text"
      },
      hubName: {
        /* metadata: { "displayName": "Hub Name", "semanticType": "type/Category" } */
        type: "column",
        name: "hub_name",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5247,
        tableId: 536,
        baseType: "type/Text"
      },
      makeModel: {
        /* metadata: { "displayName": "Make Model", "semanticType": "type/Category" } */
        type: "column",
        name: "make_model",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5252,
        tableId: 536,
        baseType: "type/Text"
      },
      payloadKg: {
        /* metadata: { "displayName": "Payload Kg" } */
        type: "column",
        name: "payload_kg",
        sourceName: "trucks",
        jsType: "number",
        fieldId: 5256,
        tableId: 536,
        baseType: "type/Integer"
      },
      plate: {
        /* metadata: { "displayName": "Plate" } */
        type: "column",
        name: "plate",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5254,
        tableId: 536,
        baseType: "type/Text"
      },
      regionCode: {
        /* metadata: { "displayName": "Region Code", "semanticType": "type/Category" } */
        type: "column",
        name: "region_code",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5250,
        tableId: 536,
        baseType: "type/Text"
      },
      regionName: {
        /* metadata: { "displayName": "Region Name", "semanticType": "type/Category" } */
        type: "column",
        name: "region_name",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5251,
        tableId: 536,
        baseType: "type/Text"
      },
      serviceIntervalKm: {
        /* metadata: { "displayName": "Service Interval Km" } */
        type: "column",
        name: "service_interval_km",
        sourceName: "trucks",
        jsType: "number",
        fieldId: 5257,
        tableId: 536,
        baseType: "type/Integer"
      },
      truckId: {
        /* metadata: { "displayName": "Truck ID", "semanticType": "type/PK" } */
        type: "column",
        name: "truck_id",
        sourceName: "trucks",
        jsType: "string",
        fieldId: 5243,
        tableId: 536,
        baseType: "type/Text"
      },
      truckLabel: {
        /* metadata: { "displayName": "Truck Label" } */
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
  varieties: {
    /* metadata: { "databaseName": "Pumpkin database", "schemaName": "pumpkin_live" } */
    type: "table",
    id: 537,
    name: "Varieties",
    fields: {
      kgPerUnit: {
        /* metadata: { "displayName": "Kg Per Unit" } */
        type: "column",
        name: "kg_per_unit",
        sourceName: "varieties",
        jsType: "number",
        fieldId: 5261,
        tableId: 537,
        baseType: "type/Decimal"
      },
      listPriceUsd: {
        /* metadata: { "displayName": "List Price Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "list_price_usd",
        sourceName: "varieties",
        jsType: "number",
        fieldId: 5259,
        tableId: 537,
        baseType: "type/Decimal"
      },
      unitCostUsd: {
        /* metadata: { "displayName": "Unit Cost Usd", "semanticType": "type/Currency" } */
        type: "column",
        name: "unit_cost_usd",
        sourceName: "varieties",
        jsType: "number",
        fieldId: 5260,
        tableId: 537,
        baseType: "type/Decimal"
      },
      unitsPerBin: {
        /* metadata: { "displayName": "Units Per Bin" } */
        type: "column",
        name: "units_per_bin",
        sourceName: "varieties",
        jsType: "number",
        fieldId: 5262,
        tableId: 537,
        baseType: "type/Integer"
      },
      varietyName: {
        /* metadata: { "displayName": "Variety Name", "semanticType": "type/PK" } */
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
  growthVsLastSeason: {
    /* metadata: {
      "entityId": "cxfOVOPdB6DlD37Acrl_W",
      "description": "Revenue against last season for the same days: +0.05 = 5% up.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 396,
    name: "Growth vs last season",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Growth vs last season", "baseType": "type/Float" } */
        type: "column",
        name: "Growth vs last season",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  fillRate: {
    /* metadata: {
      "entityId": "dOMHJ4k6rbv7NmBWn0q8I",
      "description": "Share of the pumpkins customers asked for that we could sell (0–1).",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 399,
    name: "Fill rate",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Fill rate", "baseType": "type/Float" } */
        type: "column",
        name: "Fill rate",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  binsHarvested: {
    /* metadata: {
      "entityId": "xY6iRwZ69bF1D9ZdL1jRL",
      "description": "Bins of pumpkins picked in the fields.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "harvest_daily"
      }
    } */
    type: "metric",
    id: 404,
    name: "Bins harvested",
    databaseId: 102,
    sourceTableId: 517,
    mappedTableIds: [ 517 ],
    columns: [
      {
        /* metadata: { "displayName": "Bins harvested", "baseType": "type/Decimal" } */
        type: "column",
        name: "Bins harvested",
        jsType: "number"
      }
    ],
    dimensions: {
      harvestDaily: pickFields(tables.harvestDaily.fields, [ "bins", "countryCode", "countryName", "daysAgo", "fieldId", "fieldName", "hubId", "hubName", "isRainStop", "localDate", "planBins", "regionCode", "regionName", "units", "varietyName" ])
    }
  },
  lastSeasonGrossMargin: {
    /* metadata: {
      "entityId": "K1SUTuHjdAE9J9DsRIbXW",
      "description": "Gross margin of the 2025 season on the matching days: last season's revenue minus its pumpkins at this season's unit cost, in USD. Paced like the plan.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 407,
    name: "Last season gross margin",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Last season gross margin", "baseType": "type/Decimal", "semanticType": "type/Currency" } */
        type: "column",
        name: "Last season gross margin",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  projectedLeftoverAfterHalloween: {
    /* metadata: {
      "entityId": "B9P94nzKogq8UOpcKkh7b",
      "description": "Pumpkins we expect to have left on 1 Nov: stock on hand plus the harvest still planned, minus the sales expected to 31 Oct. A variety projected to run short counts as negative. From 1 Nov it is the stock on hand.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "stock_outlook"
      }
    } */
    type: "metric",
    id: 409,
    name: "Projected leftover after Halloween",
    databaseId: 102,
    sourceTableId: 530,
    mappedTableIds: [ 530 ],
    columns: [
      {
        /* metadata: { "displayName": "Projected leftover after Halloween", "baseType": "type/Integer" } */
        type: "column",
        name: "Projected leftover after Halloween",
        jsType: "number"
      }
    ],
    dimensions: {
      stockOutlook: pickFields(tables.stockOutlook.fields, [ "countryCode", "countryName", "demandPlanUnits", "harvestAttainmentHigh", "harvestAttainmentLow", "harvestPlanUnits", "hubUnits", "leftoverNov1CostUsd", "leftoverNov1HighUnits", "leftoverNov1LowUnits", "leftoverNov1RetailUsd", "leftoverNov1Units", "markdownExposureUsd", "novemberDemandUnits", "onHandUnits", "regionCode", "regionName", "seasonEndLeftoverCostUsd", "seasonEndLeftoverUnits", "soldExpectedUnits", "soldVsPlan", "storeUnits", "transitUnits", "varietyName" ])
    }
  },
  markdownExposure: {
    /* metadata: {
      "entityId": "MhTiK34AloETz43fq5ZHl",
      "description": "What the November markdowns are expected to give away on the leftover pumpkins that still sell, in USD.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "stock_outlook"
      }
    } */
    type: "metric",
    id: 411,
    name: "Markdown exposure",
    databaseId: 102,
    sourceTableId: 530,
    mappedTableIds: [ 530 ],
    columns: [
      {
        /* metadata: { "displayName": "Markdown exposure", "baseType": "type/Decimal", "semanticType": "type/Currency" } */
        type: "column",
        name: "Markdown exposure",
        jsType: "number"
      }
    ],
    dimensions: {
      stockOutlook: pickFields(tables.stockOutlook.fields, [ "countryCode", "countryName", "demandPlanUnits", "harvestAttainmentHigh", "harvestAttainmentLow", "harvestPlanUnits", "hubUnits", "leftoverNov1CostUsd", "leftoverNov1HighUnits", "leftoverNov1LowUnits", "leftoverNov1RetailUsd", "leftoverNov1Units", "markdownExposureUsd", "novemberDemandUnits", "onHandUnits", "regionCode", "regionName", "seasonEndLeftoverCostUsd", "seasonEndLeftoverUnits", "soldExpectedUnits", "soldVsPlan", "storeUnits", "transitUnits", "varietyName" ])
    }
  },
  lastSeasonRevenue: {
    /* metadata: {
      "entityId": "3GBBazkr6YCOSD-1B68ls",
      "description": "Revenue of the 2025 season on the matching days, paced like the plan.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 395,
    name: "Last season revenue",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Last season revenue", "baseType": "type/Decimal", "semanticType": "type/Currency" } */
        type: "column",
        name: "Last season revenue",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  pumpkinsSold: {
    /* metadata: {
      "entityId": "DcLbrl4AJTVMh701WnfZi",
      "description": "Pumpkins sold, all channels.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 389,
    name: "Pumpkins sold",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Pumpkins sold", "baseType": "type/Integer" } */
        type: "column",
        name: "Pumpkins sold",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  onTimeDeliveryRate: {
    /* metadata: {
      "entityId": "g8p3RYqBbv3z1Vf9JiUht",
      "description": "Share of deliveries that arrived less than 15 minutes after plan (0–1).",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "deliveries"
      }
    } */
    type: "metric",
    id: 403,
    name: "On-time delivery rate",
    databaseId: 102,
    sourceTableId: 515,
    mappedTableIds: [ 515 ],
    columns: [
      {
        /* metadata: { "displayName": "On-time delivery rate", "baseType": "type/Float" } */
        type: "column",
        name: "On-time delivery rate",
        jsType: "number"
      }
    ],
    dimensions: {
      deliveries: pickFields(tables.deliveries.fields, [ "arrivedAt", "bins", "capacityBins", "cargoValueUsd", "carvingUnits", "cityKey", "cityName", "cookingUnits", "countryCode", "countryName", "damagedUnits", "daysAgo", "delayCause", "delayNote", "deliveryCostUsd", "departedAt", "driverName", "etaAt", "fillPct", "hubId", "hubName", "isActive", "isDelivered", "isHeadingToStore", "isLate", "isOnTime", "kg", "kmDone", "kmTotal", "lateMinutes", "localDate", "miniUnits", "payloadKg", "plannedArriveAt", "plannedDepartAt", "progressPct", "regionCode", "regionName", "returnedAt", "status", "storeId", "storeName", "tripId", "truckId", "truckLabel", "unitsTotal", "unloadedAt", "wave" ])
    }
  },
  grossMarginRate: {
    /* metadata: {
      "entityId": "Rq2uV82Zf5OchgUvsH0ot",
      "description": "Gross margin as a share of revenue (0–1).",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 391,
    name: "Gross margin rate",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Gross margin rate", "baseType": "type/Float" } */
        type: "column",
        name: "Gross margin rate",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  leftoverStockAtCost: {
    /* metadata: {
      "entityId": "X_FtOXapaGTk7Bu2rXRXn",
      "description": "The pumpkins projected to be left on 1 Nov, valued at what they cost us, in USD.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "stock_outlook"
      }
    } */
    type: "metric",
    id: 410,
    name: "Leftover stock at cost",
    databaseId: 102,
    sourceTableId: 530,
    mappedTableIds: [ 530 ],
    columns: [
      {
        /* metadata: { "displayName": "Leftover stock at cost", "baseType": "type/Decimal", "semanticType": "type/Currency" } */
        type: "column",
        name: "Leftover stock at cost",
        jsType: "number"
      }
    ],
    dimensions: {
      stockOutlook: pickFields(tables.stockOutlook.fields, [ "countryCode", "countryName", "demandPlanUnits", "harvestAttainmentHigh", "harvestAttainmentLow", "harvestPlanUnits", "hubUnits", "leftoverNov1CostUsd", "leftoverNov1HighUnits", "leftoverNov1LowUnits", "leftoverNov1RetailUsd", "leftoverNov1Units", "markdownExposureUsd", "novemberDemandUnits", "onHandUnits", "regionCode", "regionName", "seasonEndLeftoverCostUsd", "seasonEndLeftoverUnits", "soldExpectedUnits", "soldVsPlan", "storeUnits", "transitUnits", "varietyName" ])
    }
  },
  harvestVsPlan: {
    /* metadata: {
      "entityId": "Mvd6gsiLG-fv7tNsqIoqV",
      "description": "Bins picked against the harvest plan (1 = on plan).",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "harvest_daily"
      }
    } */
    type: "metric",
    id: 405,
    name: "Harvest vs plan",
    databaseId: 102,
    sourceTableId: 517,
    mappedTableIds: [ 517 ],
    columns: [
      {
        /* metadata: { "displayName": "Harvest vs plan", "baseType": "type/Float" } */
        type: "column",
        name: "Harvest vs plan",
        jsType: "number"
      }
    ],
    dimensions: {
      harvestDaily: pickFields(tables.harvestDaily.fields, [ "bins", "countryCode", "countryName", "daysAgo", "fieldId", "fieldName", "hubId", "hubName", "isRainStop", "localDate", "planBins", "regionCode", "regionName", "units", "varietyName" ])
    }
  },
  projectedSeasonRevenue: {
    /* metadata: {
      "entityId": "26gWGo8ID0oU-dVNmmd0V",
      "description": "Revenue we expect to have taken when the season ends on 15 Nov: revenue so far plus the plan still to come, at the last 7 days' pace against plan, in USD. A projection, not a forecast: the plan already holds the Halloween peak and the November markdowns.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "season_landing"
      }
    } */
    type: "metric",
    id: 408,
    name: "Projected season revenue",
    databaseId: 102,
    sourceTableId: 527,
    mappedTableIds: [ 527 ],
    columns: [
      {
        /* metadata: { "displayName": "Projected season revenue", "baseType": "type/Decimal", "semanticType": "type/Currency" } */
        type: "column",
        name: "Projected season revenue",
        jsType: "number"
      }
    ],
    dimensions: {
      seasonLanding: pickFields(tables.seasonLanding.fields, [ "attainment14d", "attainment7d", "attainmentHigh", "attainmentLow", "countryCode", "countryName", "landingHighUsd", "landingLowUsd", "landingUsd", "lySeasonRevenueUsd", "planRemainingUsd", "planToDateRevenueUsd", "regionCode", "regionName", "revenueToDateUsd", "seasonPlanRevenueUsd" ])
    }
  },
  revenuePlan: {
    /* metadata: {
      "entityId": "tFCc5-ene9hDVDFf54OSi",
      "description": "The budgeted revenue. For the current day it is paced to the local time, so today compares fairly.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 393,
    name: "Revenue plan",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Revenue plan", "baseType": "type/Decimal", "semanticType": "type/Currency" } */
        type: "column",
        name: "Revenue plan",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  revenue: {
    /* metadata: {
      "entityId": "eC0R1cI_7zmrm9F1wsSkC",
      "description": "Money taken from pumpkins sold, in USD, after markdowns.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 388,
    name: "Revenue",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Revenue", "baseType": "type/Decimal", "semanticType": "type/Currency" } */
        type: "column",
        name: "Revenue",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  shrink: {
    /* metadata: {
      "entityId": "-vcU1pSMh_NDM3NE4qhCW",
      "description": "Pumpkins damaged in transit or spoiled on the shelf, at cost, in USD.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 401,
    name: "Shrink",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Shrink", "baseType": "type/Decimal", "semanticType": "type/Currency" } */
        type: "column",
        name: "Shrink",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  deliveries: {
    /* metadata: {
      "entityId": "WQpz1LLcNNrH9COd8R6jS",
      "description": "Van runs that reached their store.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "deliveries"
      }
    } */
    type: "metric",
    id: 402,
    name: "Deliveries",
    databaseId: 102,
    sourceTableId: 515,
    mappedTableIds: [ 515 ],
    columns: [
      {
        /* metadata: { "displayName": "Deliveries", "baseType": "type/Integer" } */
        type: "column",
        name: "Deliveries",
        jsType: "number"
      }
    ],
    dimensions: {
      deliveries: pickFields(tables.deliveries.fields, [ "arrivedAt", "bins", "capacityBins", "cargoValueUsd", "carvingUnits", "cityKey", "cityName", "cookingUnits", "countryCode", "countryName", "damagedUnits", "daysAgo", "delayCause", "delayNote", "deliveryCostUsd", "departedAt", "driverName", "etaAt", "fillPct", "hubId", "hubName", "isActive", "isDelivered", "isHeadingToStore", "isLate", "isOnTime", "kg", "kmDone", "kmTotal", "lateMinutes", "localDate", "miniUnits", "payloadKg", "plannedArriveAt", "plannedDepartAt", "progressPct", "regionCode", "regionName", "returnedAt", "status", "storeId", "storeName", "tripId", "truckId", "truckLabel", "unitsTotal", "unloadedAt", "wave" ])
    }
  },
  grossMargin: {
    /* metadata: {
      "entityId": "fP_gv3W8ffKoo6iGsjryH",
      "description": "Revenue minus the cost of the pumpkins sold, in USD.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 390,
    name: "Gross margin",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Gross margin", "baseType": "type/Decimal", "semanticType": "type/Currency" } */
        type: "column",
        name: "Gross margin",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  lostSales: {
    /* metadata: {
      "entityId": "rJCpSmz_twF0VsJfDGGxZ",
      "description": "Revenue we could not take because a store ran out of a variety, in USD.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 397,
    name: "Lost sales",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Lost sales", "baseType": "type/Decimal", "semanticType": "type/Currency" } */
        type: "column",
        name: "Lost sales",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  planGrossMargin: {
    /* metadata: {
      "entityId": "Z3m07yxfqzKi8E3z3zEtd",
      "description": "The budgeted gross margin: the revenue plan minus the planned pumpkins at this season's unit cost, in USD. For the current day it is paced to the local time, like the revenue plan.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 406,
    name: "Plan gross margin",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Plan gross margin", "baseType": "type/Decimal", "semanticType": "type/Currency" } */
        type: "column",
        name: "Plan gross margin",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  dAv65OrderCount: {
    /* metadata: {
      "entityId": "qDjFYTawXBzdC07VfqkOR",
      "sourceTable": {
        "databaseName": "neondb",
        "schemaName": "dataapps_v65",
        "tableName": "store_orders"
      }
    } */
    type: "metric",
    id: 521,
    name: "DAv65 Order count",
    databaseId: 35,
    sourceTableId: 590,
    mappedTableIds: [ 590 ],
    columns: [
      {
        /* metadata: { "displayName": "Count", "baseType": "type/Integer", "semanticType": "type/Quantity" } */
        type: "column",
        name: "count",
        jsType: "number"
      }
    ],
    dimensions: {
      storeOrders: pickFields(tables.storeOrders.fields, [ "channelMvi6198j", "createdAt", "id", "margin", "notes", "product", "quantity", "region", "status", "storeId", "total" ])
    }
  },
  averageSellingPrice: {
    /* metadata: {
      "entityId": "6z8FAHaOuizsfSy7mw-gD",
      "description": "Revenue per pumpkin sold, in USD.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 392,
    name: "Average selling price",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Average selling price", "baseType": "type/Float" } */
        type: "column",
        name: "Average selling price",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  deliveryCost: {
    /* metadata: {
      "entityId": "izLZM5rhVqaBSkW3xHlKa",
      "description": "Cost of the van runs that restocked the stores, in USD.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 400,
    name: "Delivery cost",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Delivery cost", "baseType": "type/Decimal", "semanticType": "type/Currency" } */
        type: "column",
        name: "Delivery cost",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  revenueVsPlan: {
    /* metadata: {
      "entityId": "Sz3WjnacsLQ9W6GOjvuT1",
      "description": "Revenue against the plan for the same period: +0.05 = 5% ahead of plan.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 394,
    name: "Revenue vs plan",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Revenue vs plan", "baseType": "type/Float" } */
        type: "column",
        name: "Revenue vs plan",
        jsType: "number"
      }
    ],
    dimensions: {
      dailyStoreSales: pickFields(tables.dailyStoreSales.fields, [ "cityKey", "cityName", "cogsUsd", "countryCode", "countryName", "daysAgo", "deliveryCostUsd", "grossMarginUsd", "isWeekend", "listRevenueUsd", "localDate", "lostDemandUsd", "lostLateUsd", "lostRevenueUsd", "lostShortageUsd", "lyGrossMarginUsd", "lyRevenueFullUsd", "lyRevenueUsd", "lyUnits", "markdownUsd", "onlineRevenueUsd", "openMinutes", "planGrossMarginUsd", "planRevenueFullUsd", "planRevenueUsd", "planUnits", "regionCode", "regionName", "revenueUsd", "seasonDay", "shrinkShelfUsd", "shrinkTransitUsd", "shrinkUsd", "stockoutMinutes", "storeFormat", "storeId", "storeName", "unitsLost", "unitsRequested", "unitsSold", "varietyName" ])
    }
  },
  lostSalesToLateDeliveries: {
    /* metadata: {
      "entityId": "sixkPjd7mwIb2GyMqMsuT",
      "description": "Lost sales where the store's van arrived late and the shelf ran empty first.",
      "sourceTable": {
        "databaseName": "Pumpkin database",
        "schemaName": "pumpkin_live",
        "tableName": "daily_store_sales"
      }
    } */
    type: "metric",
    id: 398,
    name: "Lost sales to late deliveries",
    databaseId: 102,
    sourceTableId: 514,
    mappedTableIds: [ 514 ],
    columns: [
      {
        /* metadata: { "displayName": "Lost sales to late deliveries", "baseType": "type/Decimal", "semanticType": "type/Currency" } */
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
  generatedAt: "2026-10-21T13:49:57.098546452Z",
  metabase: {
    instanceUrl: "https://olden-midship.hosted.staging.metabase.com"
  },
  actions: actions,
  tables: tables,
  metrics: metrics
} as const;

export default schema;

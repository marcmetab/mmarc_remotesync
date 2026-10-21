import { aggregations, defineQuery, orderBy } from "@metabase/embedding-sdk-react/data-app";
import schema from "../src/metabase.data";

const storesTable = schema.tables.stores591;

export const StoreCountKpi = defineQuery({
  savedQuestionEntityId: "_ox3hGTo8oXS9a1WS-_sJ",
  source: storesTable,
  aggregations: [aggregations.count()],
});

export const StoreDirectory = defineQuery({
  savedQuestionEntityId: "lAVIsOtvxoIN2RlhvAE2G",
  source: storesTable,
  fields: [
    storesTable.fields.name,
    storesTable.fields.region,
    storesTable.fields.manager,
  ],
  orderBys: [orderBy(storesTable.fields.name, "asc")],
});

import { type Config } from "drizzle-kit";

import { env } from "~/env";
import productionDrizzleConfig from "./drizzle.config"

export default {
    ...productionDrizzleConfig,



} satisfies Config;

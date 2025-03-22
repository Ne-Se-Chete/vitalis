import { configurations } from "sdk/core"
import { response } from "sdk/http"

response.println(configurations.get("OPEN_AI_KEY") || "");
import { LIST_MODELS_URL } from "$lib/DAL/inference";
import type { MODEL_LIST } from "$lib/types";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ fetch }) => {
  const models: Promise<MODEL_LIST[]> = fetch(LIST_MODELS_URL).then(async res => {
    if (!res.ok) {
      throw new Error(`Failed to fetch models: ${res.status} ${res.statusText}`);
    }
    const data = await res.json()
    return (data.models ?? []) as MODEL_LIST[]
  }).catch(err => {
    console.error(`[SSR] Error fetching models:`, err)
    throw err
  })

  return {
    streamed: {
      models
    }
  }
}

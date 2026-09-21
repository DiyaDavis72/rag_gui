import type { MODEL_LIST } from "$lib/types"

type ModelListStateType = {
  error: string | null
  models: MODEL_LIST[]
  isFetching: boolean
}
export const modelListState = $state<ModelListStateType>({
  error: null,
  isFetching: true,
  models: [],

})

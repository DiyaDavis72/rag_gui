import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { retrieve } from "$lib/server/retrieve"
export const processMessage: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const message = formData.get("message") as string;

    if (!message || message.trim() === "") {
      return fail(400, { error: "Message cannot be empty" });
    }

    try {
      const chunks = await retrieve({ query: message });
    }

  }
}

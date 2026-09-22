import { Retrieved } from "../types";

export const expand = (candidates: Retrieved[]) => {
  return candidates.flatMap((hit) => {
    const before = rows.find(
      (r) => r.chapter === hit.chapter && r.chunk === hit.chunk - 1,
    );

    const after = rows.find(
      (r) => r.chapter === hit.chapter && r.chunk === hit.chunk + 1,
    );

    const out: Retrieved[] = [];

    let newText = before ? before.text + "\n" + hit.text : hit.text;
    newText = after ? newText + "\n" + after.text : newText;

    out.push({ ...hit, text: newText });

    return out;
  });
};

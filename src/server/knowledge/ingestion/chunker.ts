/**
 * Splits text into overlapping chunks, preferring paragraph / heading
 * boundaries so procedures stay together.
 */
export function chunkText(text: string, size = 1200, overlap = 150): string[] {
  const clean = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!clean) return [];
  if (clean.length <= size) return [clean];

  const paragraphs = clean.split(/\n(?=#{1,6}\s)|\n\n/);
  const chunks: string[] = [];
  let current = "";

  const pushCurrent = () => {
    if (current.trim()) chunks.push(current.trim());
  };

  for (const para of paragraphs) {
    if (para.length > size) {
      pushCurrent();
      current = "";
      // hard split long paragraphs on sentence boundaries
      let start = 0;
      while (start < para.length) {
        let end = Math.min(start + size, para.length);
        const slice = para.slice(start, end);
        const lastBreak = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("\n"));
        if (end < para.length && lastBreak > size * 0.5) end = start + lastBreak + 1;
        chunks.push(para.slice(start, end).trim());
        if (end >= para.length) break;
        start = Math.max(end - overlap, start + 1);
      }
      continue;
    }
    if ((current + "\n\n" + para).length > size) {
      pushCurrent();
      const tail = current.slice(-overlap);
      const cut = tail.indexOf(" ");
      current = (cut >= 0 ? tail.slice(cut + 1) : "") + "\n\n" + para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }
  pushCurrent();
  return chunks.filter(Boolean);
}

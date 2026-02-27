import { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export function usePdfDocument(data: ArrayBuffer | null) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) {
      setPdfDoc(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    pdfjsLib
      .getDocument({ data: data.slice(0) })
      .promise.then((doc) => {
        if (!cancelled) {
          setPdfDoc(doc);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [data]);

  return { pdfDoc, loading, error };
}

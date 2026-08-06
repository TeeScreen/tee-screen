import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Disable worker (Next.js compatible, simplest possible)
pdfjsLib.GlobalWorkerOptions.workerSrc = null;

// -----------------------------
// Internal Types
// -----------------------------
type PdfOverlayProps = {
    src: string;
    onClose: () => void;
};

type PdfRenderState = {
    scale: number;
    pageNumber: number;
};

type PdfDocument = pdfjsLib.PDFDocumentProxy;
type PdfPage = pdfjsLib.PDFPageProxy;

// -----------------------------
// Component
// -----------------------------
export const PDFViewer: React.FC<PdfOverlayProps> = ({ src, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        let mounted = true;

        const renderPdf = async () => {
            try {
                const renderState: PdfRenderState = {
                    scale: 1.5,
                    pageNumber: 1,
                };

                const pdf: PdfDocument = await pdfjsLib.getDocument({
                    url: src,
                    useWorkerFetch: false,
                    disableWorker: true
                }).promise;

                const page: PdfPage = await pdf.getPage(renderState.pageNumber);
                const viewport = page.getViewport({ scale: renderState.scale });

                const canvas = canvasRef.current;
                if (!canvas || !mounted) return;

                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvas,
                    canvasContext: ctx,
                    viewport,
                }).promise;
            } catch (err) {
                console.error("PDF overlay error:", err);
            }
        };

        renderPdf();

        return () => {
            mounted = false;
        };
    }, [src]);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
            <canvas ref={canvasRef} className="max-w-full max-h-full" />

            <button
                className="absolute top-4 right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
                onClick={onClose}
            >
                ×
            </button>
        </div>
    );
};

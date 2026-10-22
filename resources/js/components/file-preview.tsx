import { ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FilePreview({
    src,
    mime,
    title,
}: {
    src: string;
    mime: string | null;
    title: string;
}) {
    const isImage = mime?.startsWith('image/') ?? false;

    return (
        <div className="space-y-2">
            {isImage ? (
                <div className="bg-muted flex max-h-[60dvh] w-full items-center justify-center overflow-hidden rounded-xl border">
                    <img src={src} alt={title} className="max-h-[60dvh] w-full object-contain" />
                </div>
            ) : (
                <>
                    <iframe
                        src={src}
                        title={title}
                        className="bg-muted hidden h-[60dvh] w-full rounded-xl border sm:block"
                    />
                    <div className="bg-muted/60 flex flex-col items-center gap-3 rounded-xl border px-4 py-8 text-center sm:hidden">
                        <FileText className="text-muted-foreground size-8" aria-hidden="true" />
                        <p className="text-muted-foreground text-sm">
                            PDF previews don't show inside this view on mobile.
                        </p>
                        <Button asChild size="sm" className="w-full rounded-xl">
                            <a href={src} target="_blank" rel="noreferrer">
                                <ExternalLink />
                                Open PDF
                            </a>
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
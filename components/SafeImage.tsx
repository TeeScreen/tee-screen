"use client";
import Image from "next/image";
import React, { useState } from "react";
import type {ImageProps} from "next/dist/shared/lib/get-img-props";

export default function SafeImage(imgProps: ImageProps) {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className="text-center py-12 bg-muted/50 rounded-lg border border-muted">
                <p className="text-[#6272a4]">No files uploaded yet</p>
            </div>
        )
    }

    return (
        <Image
            src={imgProps.src}
            alt={imgProps.alt}
            sizes={imgProps.sizes}
            fill = {imgProps.fill}
            className={imgProps.className}
            onError={() => setError(true)}
        />
    );
}

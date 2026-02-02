"use client";
import React from 'react'
import {UploadCard} from "@/components/upload/UploadCard";
import {useScreen} from "@/stores/screen-store";
import FilePreview from "@/components/upload/FilePreview";
import {FileList} from "@/components/upload/FileList";

const UploadSection = ({fileName, label} : {fileName: string, label: string}) => {
    const clubName = useScreen((s)=>(s.screenName));
    return (
        <div className="p-5 border border-muted rounded-2xl lg:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h4 className="text-lg font-semibold lg:mb-6">
                        {label} {clubName} {fileName}
                    </h4>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                        <UploadCard clubName={clubName} newFileName={fileName}/>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default UploadSection

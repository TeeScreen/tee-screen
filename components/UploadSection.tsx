import React from 'react'
import {UploadCard} from "@/components/upload/UploadCard";
import {FilePreview} from "@/components/upload/FilePreview";

const UploadSection = ({
                           folderName,
                           fileName,
                           label,
                           recommendedSize = "1080 × 1080",
                       } : {
    folderName: string,
    fileName: string,
    label: string,
    recommendedSize?: string,
}) => {
    return (
        <div className="p-5 border border-muted rounded-2xl lg:p-6 min-w-0 @container/upload">
            <div className="flex flex-col gap-6 @lg/upload:flex-row @lg/upload:items-start @lg/upload:justify-between">
                <div className="min-w-0">
                    <h4 className="text-lg font-semibold mb-4">
                        {label} - Edit & Upload
                    </h4>

                    <h6 className="text-sm opacity-80 mb-6">
                        Recommended size: {recommendedSize}
                    </h6>

                    <div className="grid grid-cols-1 gap-4 @lg/upload:grid-cols-2 @lg/upload:gap-7 2xl:gap-x-32 min-w-0">
                        <UploadCard folderName={folderName} newFileName={fileName}/>
                        <FilePreview folderName={folderName} fileName={fileName}/>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default UploadSection

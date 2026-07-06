import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface ActiveScreenUser {
    userId: string;
    fullName: string;
    role?: string;
}

export interface ScreenInfo extends Document {
    screenName: string;
    screenJson: any;
    analyticsJson?: any;
    lastEdited?: Date | null;
    lastEditedBy?: string | null;
    lastEditedByName?: string | null;
    activeUsers: ActiveScreenUser[];
}

const ActiveScreenUserSchema = new Schema<ActiveScreenUser>({
    userId: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, default: 'Editor' },
}, { _id: false });

const ScreenSchema = new Schema<ScreenInfo>(
    {
        screenName: { type: String, required: true },
        screenJson: { type: Schema.Types.Mixed, default: null },
        analyticsJson: { type: Schema.Types.Mixed, default: null },
        lastEdited: { type: Date, default: null },
        lastEditedBy: { type: String, default: null },
        lastEditedByName: { type: String, default: null },
        activeUsers: { type: [ActiveScreenUserSchema], default: [] },
    },
    { timestamps: false }
);

// Compound index to ensure uniqueness per account and screen name
ScreenSchema.index({ accountLogin: 1, screenName: 1 }, { unique: true });

export const ScreenInfoModel: Model<ScreenInfo> =
    (models?.ScreenInfoModel as Model<ScreenInfo>) || model<ScreenInfo>('ScreenInfoModel', ScreenSchema);

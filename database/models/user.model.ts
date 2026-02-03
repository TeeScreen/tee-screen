import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface UserInfo extends Document {
    userId: string;
    fullName: string;
    phoneNumber?: string;
    clubName?: string;
    clubType?: string;
    role?: string;
    loadedScreen?:string;
    screenDetails?: ScreenData[];
}

export interface ScreenData {
    screenLogin: string;
    screenPW: string;
}

const ScreenDataSchema = new Schema<ScreenData>({
    screenLogin: { type: String, required: true },
    screenPW: { type: String, required: true },
});

const UserSchema = new Schema<UserInfo>(
    {
        userId: { type: String, required: true},
        fullName: { type: String, required: true},
        phoneNumber: { type: String},
        clubName: { type: String},
        clubType: { type: String},
        role: { type: String},
        loadedScreen: { type: String},
        screenDetails: { type: [ScreenDataSchema], default:[]},
    },
    { timestamps: false }
);

// Prevent duplicate symbols per user
UserSchema.index({ userId: 1}, { unique: true });

export const UserInfoModel : Model<UserInfo> =
    (models?.UserInfoModel as Model<UserInfo>) || model<UserInfo>('UserInfoModel', UserSchema);
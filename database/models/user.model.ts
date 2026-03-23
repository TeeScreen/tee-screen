import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface UserInfo extends Document {
    userId: string;
    fullName: string;
    phoneNumber?: string;
    clubName?: string;
    clubType?: string;
    role?: string;
    loadedAccount?:string;
    loadedScreen?:string;
    screenNames?:string[];
    accountDetails?: AccountData[];
    screenJson?: any;
    analyticsJson?: any;
}

export interface AccountData {
    accountLogin: string;
    accountPW: string;
}

const AccountDataSchema = new Schema<AccountData>({
    accountLogin: { type: String, required: true },
    accountPW: { type: String, required: true },
});

const UserSchema = new Schema<UserInfo>(
    {
        userId: { type: String, required: true},
        fullName: { type: String, required: true},
        phoneNumber: { type: String},
        clubName: { type: String},
        clubType: { type: String},
        role: { type: String},
        loadedAccount: { type: String},
        loadedScreen: { type: String},
        screenNames: { type: [String], default: [] },
        accountDetails: { type: [AccountDataSchema], default:[]},
        screenJson: { type: Schema.Types.Mixed, default: null },
        analyticsJson: { type: Schema.Types.Mixed, default: null },
    },
    { timestamps: false }
);

// Prevent duplicate symbols per user
UserSchema.index({ userId: 1}, { unique: true });

export const UserInfoModel : Model<UserInfo> =
    (models?.UserInfoModel as Model<UserInfo>) || model<UserInfo>('UserInfoModel', UserSchema);
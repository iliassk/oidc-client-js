import JsonService from './JsonService';
import MetadataService from './MetadataService';
import Log from './Log';

const ProtocolClaims = ["nonce", "at_hash", "iat", "nbf", "exp", "aud", "iss", "c_hash"];

export default class UserInfoService {
    constructor(settings, JsonServiceCtor = JsonService, MetadataServiceCtor = MetadataService) {
        if (!settings) {
            Log.error("No settings passed to UserInfoService");
            throw new Error("settings");
        }

        this._settings = settings;
        this._jsonService = new JsonServiceCtor();
        this._metadataService = new MetadataServiceCtor(this._settings);
    }

    getClaims(token) {
        Log.info("UserInfoService.getClaims");

        if (!token) {
            Log.error("No token passed");
            return Promise.reject(new Error("A token is required"));
        }

        return this._metadataService.getUserInfoEndpoint().then(url => {
            Log.info("received userinfo url", url);

            return this._jsonService.getJson(url, token).then(claims => {
                Log.info("claims received", claims);

                if (claims && this._settings.filterProtocolClaims) {
                    ProtocolClaims.forEach(type => {
                        delete claims[type];
                    });

                    Log.info("protocol claims filtered", claims);
                }

                return claims;
            });
        }, err => {
            Log.error("Failed to get claims", err);
            throw new Error("Failed to get claims");
        });
    }
}
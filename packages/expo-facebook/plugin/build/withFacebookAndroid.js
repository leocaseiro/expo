"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setFacebookConfig = exports.setFacebookAppIdString = exports.getFacebookAdvertiserIDCollection = exports.getFacebookAutoLogAppEvents = exports.getFacebookAutoInitEnabled = exports.getFacebookDisplayName = exports.getFacebookAppId = exports.getFacebookScheme = exports.withFacebookManifest = exports.withFacebookAppIdString = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const Resources_1 = require("@expo/config-plugins/build/android/Resources");
const Strings_1 = require("@expo/config-plugins/build/android/Strings");
const android_plugins_1 = require("@expo/config-plugins/build/plugins/android-plugins");
const XML_1 = require("@expo/config-plugins/build/utils/XML");
const errors_1 = require("@expo/config-plugins/build/utils/errors");
const { addMetaDataItemToMainApplication, getMainApplicationOrThrow, prefixAndroidKeys, removeMetaDataItemFromMainApplication, } = config_plugins_1.AndroidConfig.Manifest;
const CUSTOM_TAB_ACTIVITY = 'com.facebook.CustomTabActivity';
const STRING_FACEBOOK_APP_ID = 'facebook_app_id';
const META_APP_ID = 'com.facebook.sdk.ApplicationId';
const META_APP_NAME = 'com.facebook.sdk.ApplicationName';
const META_AUTO_INIT = 'com.facebook.sdk.AutoInitEnabled';
const META_AUTO_LOG_APP_EVENTS = 'com.facebook.sdk.AutoLogAppEventsEnabled';
const META_AD_ID_COLLECTION = 'com.facebook.sdk.AdvertiserIDCollectionEnabled';
exports.withFacebookAppIdString = android_plugins_1.createStringsXmlPlugin(applyFacebookAppIdString, 'withFacebookAppIdString');
exports.withFacebookManifest = android_plugins_1.createAndroidManifestPlugin(setFacebookConfig, 'withFacebookManifest');
function buildXMLItem({ head, children, }) {
    return { ...(children !== null && children !== void 0 ? children : {}), $: head };
}
function buildAndroidItem(datum) {
    const item = typeof datum === 'string' ? { name: datum } : datum;
    const head = prefixAndroidKeys(item);
    return buildXMLItem({ head });
}
function getFacebookSchemeActivity(scheme) {
    /**
   <activity
      android:name="com.facebook.CustomTabActivity"
      android:exported="true">
      <intent-filter>
          <action android:name="android.intent.action.VIEW" />
          <category android:name="android.intent.category.DEFAULT" />
          <category android:name="android.intent.category.BROWSABLE" />
          <data android:scheme="${scheme}" />
      </intent-filter>
  </activity>
     */
    return buildXMLItem({
        head: prefixAndroidKeys({
            name: CUSTOM_TAB_ACTIVITY,
            exported: 'true',
        }),
        children: {
            'intent-filter': [
                {
                    action: [buildAndroidItem('android.intent.action.VIEW')],
                    category: [
                        buildAndroidItem('android.intent.category.DEFAULT'),
                        buildAndroidItem('android.intent.category.BROWSABLE'),
                    ],
                    data: [buildAndroidItem({ scheme })],
                },
            ],
        },
    });
}
function getFacebookScheme(config) {
    var _a;
    return (_a = config.facebookScheme) !== null && _a !== void 0 ? _a : null;
}
exports.getFacebookScheme = getFacebookScheme;
function getFacebookAppId(config) {
    var _a;
    return (_a = config.facebookAppId) !== null && _a !== void 0 ? _a : null;
}
exports.getFacebookAppId = getFacebookAppId;
function getFacebookDisplayName(config) {
    var _a;
    return (_a = config.facebookDisplayName) !== null && _a !== void 0 ? _a : null;
}
exports.getFacebookDisplayName = getFacebookDisplayName;
function getFacebookAutoInitEnabled(config) {
    var _a;
    return (_a = config.facebookAutoInitEnabled) !== null && _a !== void 0 ? _a : null;
}
exports.getFacebookAutoInitEnabled = getFacebookAutoInitEnabled;
function getFacebookAutoLogAppEvents(config) {
    var _a;
    return (_a = config.facebookAutoLogAppEventsEnabled) !== null && _a !== void 0 ? _a : null;
}
exports.getFacebookAutoLogAppEvents = getFacebookAutoLogAppEvents;
function getFacebookAdvertiserIDCollection(config) {
    var _a;
    return (_a = config.facebookAdvertiserIDCollectionEnabled) !== null && _a !== void 0 ? _a : null;
}
exports.getFacebookAdvertiserIDCollection = getFacebookAdvertiserIDCollection;
function ensureFacebookActivity({ mainApplication, scheme, }) {
    if (Array.isArray(mainApplication.activity)) {
        // Remove all Facebook CustomTabActivities first
        mainApplication.activity = mainApplication.activity.filter(activity => {
            var _a;
            return ((_a = activity.$) === null || _a === void 0 ? void 0 : _a['android:name']) !== CUSTOM_TAB_ACTIVITY;
        });
    }
    else {
        mainApplication.activity = [];
    }
    // If a new scheme is defined, append it to the activity.
    if (scheme) {
        mainApplication.activity.push(getFacebookSchemeActivity(scheme));
    }
    return mainApplication;
}
async function setFacebookAppIdString(config, projectRoot) {
    const stringsPath = await Strings_1.getProjectStringsXMLPathAsync(projectRoot);
    errors_1.assert(stringsPath, `There was a problem setting your Facebook App ID in "${stringsPath}"`);
    let stringsJSON = await Resources_1.readResourcesXMLAsync({ path: stringsPath });
    stringsJSON = applyFacebookAppIdString(config, stringsJSON);
    try {
        await XML_1.writeXMLAsync({ path: stringsPath, xml: stringsJSON });
    }
    catch {
        throw new Error(`Error setting facebookAppId. Cannot write strings.xml to "${stringsPath}"`);
    }
    return true;
}
exports.setFacebookAppIdString = setFacebookAppIdString;
function applyFacebookAppIdString(config, stringsJSON) {
    const appId = getFacebookAppId(config);
    if (appId) {
        return Strings_1.setStringItem([Resources_1.buildResourceItem({ name: STRING_FACEBOOK_APP_ID, value: appId })], stringsJSON);
    }
    return Strings_1.removeStringItem(STRING_FACEBOOK_APP_ID, stringsJSON);
}
function setFacebookConfig(config, androidManifest) {
    const scheme = getFacebookScheme(config);
    const appId = getFacebookAppId(config);
    const displayName = getFacebookDisplayName(config);
    const autoInitEnabled = getFacebookAutoInitEnabled(config);
    const autoLogAppEvents = getFacebookAutoLogAppEvents(config);
    const advertiserIdCollection = getFacebookAdvertiserIDCollection(config);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let mainApplication = getMainApplicationOrThrow(androidManifest);
    mainApplication = ensureFacebookActivity({ scheme, mainApplication });
    if (appId) {
        mainApplication = addMetaDataItemToMainApplication(mainApplication, META_APP_ID, 
        // The corresponding string is set in setFacebookAppIdString
        `@string/${STRING_FACEBOOK_APP_ID}`);
    }
    else {
        mainApplication = removeMetaDataItemFromMainApplication(mainApplication, META_APP_ID);
    }
    if (displayName) {
        mainApplication = addMetaDataItemToMainApplication(mainApplication, META_APP_NAME, displayName);
    }
    else {
        mainApplication = removeMetaDataItemFromMainApplication(mainApplication, META_APP_NAME);
    }
    if (autoInitEnabled !== null) {
        mainApplication = addMetaDataItemToMainApplication(mainApplication, META_AUTO_INIT, autoInitEnabled ? 'true' : 'false');
    }
    else {
        mainApplication = removeMetaDataItemFromMainApplication(mainApplication, META_AUTO_INIT);
    }
    if (autoLogAppEvents !== null) {
        mainApplication = addMetaDataItemToMainApplication(mainApplication, META_AUTO_LOG_APP_EVENTS, autoLogAppEvents ? 'true' : 'false');
    }
    else {
        mainApplication = removeMetaDataItemFromMainApplication(mainApplication, META_AUTO_LOG_APP_EVENTS);
    }
    if (advertiserIdCollection !== null) {
        mainApplication = addMetaDataItemToMainApplication(mainApplication, META_AD_ID_COLLECTION, advertiserIdCollection ? 'true' : 'false');
    }
    else {
        // eslint-disable-next-line
        mainApplication = removeMetaDataItemFromMainApplication(mainApplication, META_AD_ID_COLLECTION);
    }
    return androidManifest;
}
exports.setFacebookConfig = setFacebookConfig;

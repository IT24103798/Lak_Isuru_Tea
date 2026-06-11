export const PROFILE_PHOTO_CHANGE_EVENT = "lakIsuruProfilePhotoChange";

export const getProfilePhotoStorageKey = (user) => {
  const accountKey = user?._id || user?.id || user?.email || user?.phone;

  return accountKey ? `lakIsuruProfilePhoto:${accountKey}` : "lakIsuruProfilePhoto:guest";
};

export const getStoredProfilePhoto = (user) => {
  return localStorage.getItem(getProfilePhotoStorageKey(user)) || user?.profileImage || "";
};

export const notifyProfilePhotoChange = () => {
  window.dispatchEvent(new Event(PROFILE_PHOTO_CHANGE_EVENT));
};

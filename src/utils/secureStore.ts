import * as SecureStore from 'expo-secure-store';

export async function saveToken(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error('SecureStore save error:', error);
  }
}

export async function getToken(key: string) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error('SecureStore get error:', error);
    return null;
  }
}

export async function deleteToken(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('SecureStore delete error:', error);
  }
}

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-intent-launcher', () => ({
  __esModule: true,
  ActivityAction: {
    REQUEST_SCHEDULE_EXACT_ALARM: 'android.settings.REQUEST_SCHEDULE_EXACT_ALARM',
  },
  startActivityAsync: jest.fn(async () => ({ resultCode: -1 })),
}));

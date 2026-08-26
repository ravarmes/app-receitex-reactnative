/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// Mock SplashScreen to avoid asynchronous timer leaks during testing
jest.mock('../src/screens/SplashScreen', () => () => null);

// Mock react-native-google-mobile-ads
jest.mock('react-native-google-mobile-ads', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => ({
      initialize: jest.fn().mockResolvedValue(true),
    }),
    BannerAd: (props: any) => React.createElement(View, { testID: 'mock-banner-ad', ...props }),
    BannerAdSize: {
      BANNER: 'BANNER',
      LARGE_BANNER: 'LARGE_BANNER',
      MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
      FULL_BANNER: 'FULL_BANNER',
      LEADERBOARD: 'LEADERBOARD',
      ADAPTIVE_BANNER: 'ADAPTIVE_BANNER',
    },
    TestIds: {
      BANNER: 'ca-app-pub-3940256099942544/6300978111',
    },
  };
});

// Mock react-native-iap
jest.mock('react-native-iap', () => ({
  initConnection: jest.fn().mockResolvedValue(true),
  endConnection: jest.fn().mockResolvedValue(true),
  getAvailablePurchases: jest.fn().mockResolvedValue([]),
  getProducts: jest.fn().mockResolvedValue([]),
  getSubscriptions: jest.fn().mockResolvedValue([]),
  purchaseUpdatedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  purchaseErrorListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  finishTransaction: jest.fn().mockResolvedValue(true),
  requestPurchase: jest.fn().mockResolvedValue({}),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  clear: jest.fn().mockResolvedValue(null),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// Mock react-native-html-to-pdf
jest.mock('react-native-html-to-pdf', () => ({
  convert: jest.fn().mockResolvedValue({ filePath: '/mock/path/file.pdf' }),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default || mock;
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

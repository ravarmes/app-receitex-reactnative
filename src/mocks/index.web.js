// Mocks para componentes específicos da web
import EventEmitterMock from './EventEmitter';

// Mock para o NativeEventEmitter
export class NativeEventEmitter extends EventEmitterMock {
  constructor() {
    super();
  }
}

// Mock para o InteractionManager
export const InteractionManager = {
  runAfterInteractions: (callback) => {
    setTimeout(callback, 0);
    return {
      cancel: () => {}
    };
  },
  createInteractionHandle: () => 1,
  clearInteractionHandle: () => {},
  setDeadline: () => {},
};

// Mock para VirtualizedList
export const VirtualizedList = {
  ScrollView: () => null,
};

// Mock para Batchinator
export class Batchinator {
  constructor() {}
  schedule() {}
  dispose() {}
}

export default {
  EventEmitter: EventEmitterMock,
  NativeEventEmitter,
  InteractionManager,
  VirtualizedList,
  Batchinator,
}; 
// Usando o módulo EventEmitter padrão do Node
import { EventEmitter as NodeEventEmitter } from 'events';

// Criar uma classe que implementa a API do EventEmitter de React Native
class EventEmitterMock extends NodeEventEmitter {
  constructor() {
    super();
  }

  addListener(eventType, listener) {
    super.on(eventType, listener);
    return {
      remove: () => super.removeListener(eventType, listener)
    };
  }

  removeListener(eventType, listener) {
    super.removeListener(eventType, listener);
  }

  removeAllListeners(eventType) {
    if (eventType) {
      super.removeAllListeners(eventType);
    } else {
      super.removeAllListeners();
    }
  }

  emit(eventType, ...args) {
    return super.emit(eventType, ...args);
  }
}

export default EventEmitterMock; 
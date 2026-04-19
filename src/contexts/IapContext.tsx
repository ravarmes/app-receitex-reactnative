import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import {
  initConnection,
  endConnection,
  getProducts,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  requestPurchase,
  finishTransaction,
  ProductPurchase,
  PurchaseError,
} from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const REMOVE_ADS_SKU = 'produto_remover_anuncios'; // O SKU deve bater com o Google Play Console
const IAP_STORAGE_KEY = '@is_ad_free';

interface IapContextProps {
  isAdFree: boolean;
  isLoading: boolean;
  purchaseRemoveAds: () => Promise<void>;
}

const IapContext = createContext<IapContextProps>({
  isAdFree: false,
  isLoading: true,
  purchaseRemoveAds: async () => {}, // placeholder
});

export const IapProvider = ({ children }: { children: ReactNode }) => {
  const [isAdFree, setIsAdFree] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let updateListener: any = null;
    let errorListener: any = null;

    const initializeIAP = async () => {
      try {
        setIsLoading(true);

        // 1. Inicialização veloz via Local Storage
        const storedAdFree = await AsyncStorage.getItem(IAP_STORAGE_KEY);
        if (storedAdFree === 'true') {
          setIsAdFree(true);
        }

        // 2. Conectar com o Billing
        await initConnection();

        // 3. OBRIGATÓRIO no Android (Buscar o produto pra não dar PROMISE_BUY_ITEM)
        if (Platform.OS === 'android') {
          await getProducts({ skus: [REMOVE_ADS_SKU] });
        }

        // 4. Checar a carteira do usuário online
        const availablePurchases = await getAvailablePurchases();
        const hasPurchasedAdsRemoval = availablePurchases.some(
          (purchase) => purchase.productId === REMOVE_ADS_SKU
        );

        if (hasPurchasedAdsRemoval) {
          setIsAdFree(true);
          await AsyncStorage.setItem(IAP_STORAGE_KEY, 'true');
        }

      } catch (error) {
        console.warn('Erro IAP:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeIAP();

    // 5. Escutar compras
    updateListener = purchaseUpdatedListener(async (purchase: ProductPurchase) => {
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        try {
          if (purchase.productId === REMOVE_ADS_SKU) {
            setIsAdFree(true);
            await AsyncStorage.setItem(IAP_STORAGE_KEY, 'true');

            // 6. Confirma no Play (não é consumível)
            await finishTransaction({ purchase, isConsumable: false });
          }
        } catch (error) {
          console.error('Falha Transaction IAP:', error);
        }
      }
    });

    errorListener = purchaseErrorListener((error: PurchaseError) => {
      if (error.code === 'E_USER_CANCELLED') {
        return; // IGNORAR
      }
      console.warn('Falha Compra:', error.message);
    });

    // Cleanup
    return () => {
      if (updateListener) updateListener.remove();
      if (errorListener) errorListener.remove();
      endConnection();
    };
  }, []);

  const purchaseRemoveAds = async () => {
    try {
      setIsLoading(true);
      await requestPurchase({
        skus: [REMOVE_ADS_SKU],
      });
    } catch (error) {
      console.warn('Falha RequestPurchase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IapContext.Provider value={{ isAdFree, isLoading, purchaseRemoveAds }}>
      {children}
    </IapContext.Provider>
  );
};

export const useIap = () => useContext(IapContext);

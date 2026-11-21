import { NativeModule, requireNativeModule } from 'expo';

declare class PassCrafterVaultModule extends NativeModule<{}> {
  setValueAsync(value: string): Promise<void>;
}

export default requireNativeModule<PassCrafterVaultModule>('PassCrafterVault');

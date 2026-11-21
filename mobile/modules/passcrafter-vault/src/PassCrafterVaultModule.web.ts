import { registerWebModule, NativeModule } from 'expo';

// PassCrafterVaultModule is not available on the web platform.
class PassCrafterVaultModule extends NativeModule<{}> {}

export default registerWebModule(PassCrafterVaultModule, 'PassCrafterVaultModule');

package expo.modules.passcraftervault

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class PassCrafterVaultModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PassCrafterVault")

    AsyncFunction("setValueAsync") { value: String ->
    }
  }
}

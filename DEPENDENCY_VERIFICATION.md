# Dependency verification — 2026-10-26

The dependency update removes the vulnerable protobuf and Zod versions using overrides. No Tact source, ABI message, deployed contract, wallet owner or production key was changed.

A clean isolated copy of commit dbeea76a4c3d2b304f939542bff1bc5411de8b89 was installed and built with the original lockfile. It was then rebuilt with the patched lockfile: all 18 BOC artifacts had identical SHA-256 hashes. All 21 real sandbox tests passed. The patched dependency audit reported zero known vulnerabilities at that time. CI now enforces the dependency check and sandbox tests.

These are local compilation/regression results, not an independent security audit or verification that every current source matches deployed legacy bytecode. Mainnet deployment still requires separate testnet verification and an owner signature. Existing uncommitted generated files in the operator checkout were preserved; builds took place outside that checkout.

## Baseline / patched artifact hashes (identical)

- `build/AgentRegistry/AgentRegistry_AgentRegistry.code.boc`: `45be9bf35367553e0c8aac26e1094d6592b915e674790bb2aec47b4b4e920a59`
- `build/AgentRegistry/AgentRegistry_NodeIdentity.code.boc`: `6551199270c59c1043a0746929bd16e07c1c792d22ab412b66cac936c1492135`
- `build/AgentRegistryV2/AgentRegistryV2_AgentRegistryV2.code.boc`: `41389ab02eaa3aadf5b6ce7dc67e23f9f7798b9583abd6391737d36db6d81398`
- `build/AgentRegistryV2/AgentRegistryV2_NodeIdentity.code.boc`: `6551199270c59c1043a0746929bd16e07c1c792d22ab412b66cac936c1492135`
- `build/DAOVoting/DAOVoting_DAOVoting.code.boc`: `038929c95302821d87ec9482c69080a5db3dd4d8d94f97fa0afb5889fba79c89`
- `build/DAOVoting/DAOVoting_Proposal.code.boc`: `42010ddd522e2109597e2f7c3066e9276fc75645e78d37df82cd2537874b36e0`
- `build/DAOVotingV2/DAOVotingV2_DAOVotingV2.code.boc`: `e0fd87192cedd3115f3a316d5df9b53a9e9317dd160b9fd58f8ea9651ea454ba`
- `build/DAOVotingV2/DAOVotingV2_Proposal.code.boc`: `42010ddd522e2109597e2f7c3066e9276fc75645e78d37df82cd2537874b36e0`
- `build/EcosystemTreasury/EcosystemTreasury_EcosystemTreasury.code.boc`: `702dd5932792d32148f646aedccb200d951084d5b7776a6f18056f428e9bd621`
- `build/Escrow/Escrow_Escrow.code.boc`: `e98c521f4ebe1ff31064801225ebd1619dd013e78c92746531d90de5c70837a4`
- `build/EscrowComplete/EscrowComplete_Escrow.code.boc`: `7dee13bf05d51b4d13b9d1b3239e644ba45f3e8f665a24d1fbb6ebf85f29a742`
- `build/GSTDJetton/GSTDJetton_GSTDJetton.code.boc`: `b42161f96a6d0bf9950a0fd121c70218a22ea10c074601b3f5bcf090ffdc6d62`
- `build/GSTDJetton/GSTDJetton_GSTDJettonWallet.code.boc`: `15b212758c09d1c813a14e8a5643ef822dda2fd3f83c3f188a16071ee3766eaa`
- `build/GstdBridge/GstdBridge_GstdBridgeRouter.code.boc`: `73ac187f89b67f95c41fcfb9ce627b2290797e74662f0559ef4cdc24c50d0f1b`
- `build/SettlementMaster/SettlementMaster_SettlementMaster.code.boc`: `b3a4b0d2b44fe1c60036c93057f2be2aac14f5ea4cedf18504cd46f4c897dbdf`
- `build/SettlementRouter/SettlementRouter_SettlementRouter.code.boc`: `1fdef8150cff947a009ce0da36c6e67e0bcd7030893f041ff0a2bc59a10d8b92`
- `build/SovereignVault/SovereignVault_SovereignVault.code.boc`: `730db258403b80a92c5afe8b410df5d53b673e6195fdc6f979700a3c7fa358bc`
- `build/TreasuryGold/TreasuryGold_TreasuryGold.code.boc`: `a983cfee7f886458ae3dcf2cb75b759886de39d16f4a65d7b6a6e7981d0397fe`
